// V2 mock adapter.
// Converts local USER_CARDS/mock data into V2 domain models and throws on malformed input.

import type { CardRuleSet, RewardRule } from "../domain/types";
import { ALL_INPUT_BUCKETS, BUCKET_TO_MERCHANT, MERCHANT_TO_BUCKET } from "../simulation/inputs";
import { validateUniqueRewardRules } from "../engine/rewards";

const merchantToBucketLower = Object.fromEntries(
  Object.entries(MERCHANT_TO_BUCKET).map(([merchant, bucket]) => [merchant.toLowerCase(), bucket]),
);

export function assertObject(value: unknown, label: string): asserts value is Record<string, any> {
  if (!value || typeof value !== "object") {
    throw new Error(`[v2:adapter] ${label} must be an object`);
  }
}

function rateToPercent(rate: number): number {
  return Math.round((Number(rate) || 0) * 10000) / 100;
}

function ruleCap(card: Record<string, any>, key: string, scope: "bucket" | "shared" = "bucket") {
  const cap = card.bucket_caps?.[key];
  if (!cap) return undefined;
  return { amount: Number(cap), period: "monthly" as const, scope, valueKind: "savings" as const };
}

function addRule(rules: RewardRule[], rule: RewardRule) {
  if (rules.some((existing) => existing.bucket === rule.bucket && (existing.merchant || "") === (rule.merchant || ""))) return;
  rules.push(rule);
}

export function adaptUserCard(value: unknown, buckets: string[] = ALL_INPUT_BUCKETS): CardRuleSet {
  assertObject(value, "mock card");
  if (!value.cardAlias && !value.card_alias && !value.name) {
    throw new Error("[v2:adapter] mock card requires cardAlias/card_alias/name");
  }
  const rules: RewardRule[] = [];
  const rewardRates = value.reward_rates || {};
  const zeroBuckets = new Set(value.zero_buckets || []);
  const rewardKind = value.savings_type === "points" ? "points" : "cashback";
  const conversionRate = Number(value.conv_rate ?? 1);

  if (rewardKind === "points") {
    for (const bucket of buckets) {
      if (zeroBuckets.has(bucket)) continue;
      const rp = value.rp_per_100?.[bucket] ?? value.rp_per_100?.default;
      if (typeof rp !== "number") continue;
      const hasTravelCap = ["flights_annual", "hotels_annual"].includes(bucket) && value.travel_rp_cap_monthly;
      addRule(rules, {
        bucket,
        rewardKind,
        rate: rp,
        rateBasis: "per_100",
        conversionRate,
        cap: hasTravelCap
          ? { amount: Number(value.travel_rp_cap_monthly), period: "monthly", scope: "bucket", valueKind: "points" }
          : undefined,
      });
    }
  } else {
    for (const [key, rate] of Object.entries(rewardRates)) {
      if (key === "default" || key === "accelerated") continue;
      const bucket = buckets.includes(key) ? key : merchantToBucketLower[key.toLowerCase()];
      if (!bucket || zeroBuckets.has(bucket)) continue;
      const merchant = buckets.includes(key) ? undefined : key;
      addRule(rules, {
        bucket,
        merchant,
        rewardKind,
        rate: rateToPercent(Number(rate)),
        rateBasis: "percent",
        conversionRate,
        cap: ruleCap(value, key),
      });
    }

    if (value.shared_cap?.buckets?.length && typeof rewardRates.accelerated === "number") {
      for (const bucket of value.shared_cap.buckets) {
        if (zeroBuckets.has(bucket)) continue;
        addRule(rules, {
          bucket,
          rewardKind,
          rate: rateToPercent(rewardRates.accelerated),
          rateBasis: "percent",
          conversionRate,
          cap: {
            amount: Number(value.shared_cap.amount),
            period: "monthly",
            scope: "shared",
            sharedGroup: `${value.card_alias || value.name}:accelerated`,
            valueKind: "savings",
          },
        });
      }
    }

    if (typeof rewardRates.default === "number") {
      for (const bucket of buckets) {
        if (zeroBuckets.has(bucket)) continue;
        addRule(rules, {
          bucket,
          rewardKind,
          rate: rateToPercent(rewardRates.default),
          rateBasis: "percent",
          conversionRate,
          cap: ruleCap(value, bucket),
        });
      }
    }
  }

  const adapted = {
    cardAlias: value.cardAlias || value.card_alias || value.name,
    displayName: value.displayName || value.name || value.cardAlias || value.card_alias,
    annualFee: Number(value.annualFee || value.annual_fees || value.annual_fee || 0),
    rules: Array.isArray(value.rules) ? value.rules : rules,
    cardCap: value.card_max_cap
      ? { amount: Number(value.card_max_cap), period: "yearly", scope: "card", valueKind: rewardKind === "points" ? "points" : "savings" }
      : undefined,
  };
  validateUniqueRewardRules(adapted);
  return adapted;
}

export const adaptMockCard = adaptUserCard;

export function adaptUserCards(values: unknown[]): CardRuleSet[] {
  if (!Array.isArray(values)) throw new Error("[v2:adapter] USER_CARDS must be an array");
  return values.map((card) => adaptUserCard(card));
}
