// V2 reward engine.
// Calculates rewards for one card/spend input, including caps and conversion.

import type { CardRuleSet, CapRule, RewardLine, RewardRule, SpendInput } from "../domain/types";
import { convertPeriod, roundMoney, toMonthly } from "../domain/money";

function ruleSavings(rule: RewardRule, amount: number): { savings: number; points?: number } {
  if (rule.rateBasis === "percent") {
    return { savings: amount * (rule.rate / 100) };
  }
  const base = rule.rateBasis === "per_150" ? 150 : 100;
  const units = amount / base;
  const points = units * rule.rate;
  return { points, savings: points * (rule.conversionRate ?? 1) };
}

export function selectRewardRule(card: CardRuleSet, spend: SpendInput): RewardRule | null {
  const rules = card.rules || [];
  const merchant = String(spend.merchant || "").toLowerCase();
  return (
    rules.find((rule) => rule.bucket === spend.bucket && rule.merchant && rule.merchant.toLowerCase() === merchant) ||
    rules.find((rule) => rule.bucket === spend.bucket && !rule.merchant) ||
    null
  );
}

export function validateUniqueRewardRules(card: CardRuleSet): void {
  const seen = new Set<string>();
  for (const rule of card.rules || []) {
    const key = `${rule.bucket}::${rule.merchant || ""}`;
    if (seen.has(key)) {
      throw new Error(`[v2:rewards] duplicate reward rule for ${card.cardAlias} ${key}`);
    }
    seen.add(key);
  }
}

function yearlyCapAmount(cap?: CapRule, conversionRate = 1): number {
  if (!cap) return Infinity;
  const amount = cap.valueKind === "points" ? cap.amount * conversionRate : cap.amount;
  return convertPeriod(amount, cap.period, "yearly");
}

function applySavingsScale(line: RewardLine, scale: number): RewardLine {
  return {
    ...line,
    cappedSavings: line.cappedSavings * scale,
    cappedPointsEarned: line.cappedPointsEarned == null ? undefined : line.cappedPointsEarned * scale,
    capReached: true,
  };
}

function calculateRawReward(card: CardRuleSet, spend: SpendInput): RewardLine {
  const rule = selectRewardRule(card, spend);
  const yearlyAmount = convertPeriod(spend.amount, spend.period, "yearly");
  if (!rule) {
    return {
      cardAlias: card.cardAlias,
      bucket: spend.bucket,
      merchant: spend.merchant,
      grossSavings: 0,
      cappedSavings: 0,
      capReached: false,
      period: "yearly",
    };
  }

  const result = ruleSavings(rule, yearlyAmount);
  const isSharedCap = rule.cap?.scope === "shared";
  const yearlyCap = isSharedCap ? Infinity : yearlyCapAmount(rule.cap, rule.conversionRate ?? 1);
  const cappedSavings = Math.min(result.savings, yearlyCap);
  const pointCap = !isSharedCap && rule.cap?.valueKind === "points" ? convertPeriod(rule.cap.amount, rule.cap.period, "yearly") : Infinity;
  const cappedPoints = result.points == null ? undefined : Math.min(result.points, pointCap);

  return {
    cardAlias: card.cardAlias,
    bucket: spend.bucket,
    merchant: spend.merchant,
    grossSavings: result.savings,
    cappedSavings,
    pointsEarned: result.points,
    cappedPointsEarned: cappedPoints,
    capReached: result.savings > yearlyCap,
    period: "yearly",
    capValueKind: rule.cap?.valueKind || "savings",
  };
}

export function calculateRewards(card: CardRuleSet, spends: SpendInput[]): RewardLine[] {
  let lines = (spends || []).map((spend) => calculateRawReward(card, spend));

  const sharedGroups = new Map<string, { cap: CapRule; indexes: number[] }>();
  (card.rules || []).forEach((rule) => {
    if (rule.cap?.scope === "shared" && rule.cap.sharedGroup) {
      if (!sharedGroups.has(rule.cap.sharedGroup)) {
        sharedGroups.set(rule.cap.sharedGroup, { cap: rule.cap, indexes: [] });
      }
    }
  });

  lines.forEach((line, index) => {
    const rule = selectRewardRule(card, line);
    if (rule?.cap?.scope === "shared" && rule.cap.sharedGroup) {
      sharedGroups.get(rule.cap.sharedGroup)?.indexes.push(index);
    }
  });

  for (const { cap, indexes } of sharedGroups.values()) {
    const total = indexes.reduce(
      (sum, index) => sum + (cap.valueKind === "points" ? lines[index].cappedPointsEarned || 0 : lines[index].cappedSavings),
      0,
    );
    const capAmount = convertPeriod(cap.amount, cap.period, "yearly");
    if (total > capAmount && total > 0) {
      const scale = capAmount / total;
      lines = lines.map((line, index) => (indexes.includes(index) ? applySavingsScale(line, scale) : line));
      if (cap.valueKind === "points") {
        const conversionRate = (card.rules || []).find((rule) => rule.cap === cap)?.conversionRate ?? 1;
        lines = lines.map((line, index) => (
          indexes.includes(index) ? { ...line, cappedSavings: (line.cappedPointsEarned || 0) * conversionRate } : line
        ));
      }
    }
  }

  const cardCap = card.cardCap;
  if (cardCap) {
    const conversionRate = (card.rules || []).find((rule) => rule.conversionRate)?.conversionRate ?? 1;
    const total = lines.reduce(
      (sum, line) => sum + (cardCap.valueKind === "points" ? line.cappedPointsEarned || 0 : line.cappedSavings),
      0,
    );
    const capAmount = convertPeriod(cardCap.amount, cardCap.period, "yearly");
    if (total > capAmount && total > 0) {
      const scale = capAmount / total;
      lines = lines.map((line) => applySavingsScale(line, scale));
      if (cardCap.valueKind === "points") {
        lines = lines.map((line) => ({ ...line, cappedSavings: (line.cappedPointsEarned || 0) * conversionRate }));
      }
    }
  }

  return lines;
}

export function calculateReward(card: CardRuleSet, spend: SpendInput): RewardLine {
  return calculateRewards(card, [spend])[0];
}

export function roundRewardLine(line: RewardLine): RewardLine {
  return {
    ...line,
    grossSavings: roundMoney(line.grossSavings),
    cappedSavings: roundMoney(line.cappedSavings),
    pointsEarned: line.pointsEarned == null ? undefined : roundMoney(line.pointsEarned),
    cappedPointsEarned: line.cappedPointsEarned == null ? undefined : roundMoney(line.cappedPointsEarned),
  };
}

export function calculateMonthlyReward(card: CardRuleSet, spend: SpendInput): RewardLine {
  return calculateReward(card, { ...spend, amount: toMonthly(spend.amount, spend.period), period: "monthly" });
}
