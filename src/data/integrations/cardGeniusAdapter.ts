// V2 CardGenius adapter.
// Maps /calculate and /recommend_cards-style responses into V2 domain models.

import type { CardRuleSet, RewardRule } from "../domain/types";
import { validateUniqueRewardRules } from "../engine/rewards";

function parseMoney(value: any): number {
  if (typeof value === "number") return value;
  const cleaned = String(value || "").replace(/[^0-9.]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

export function adaptCardGeniusCard(value: unknown): CardRuleSet {
  if (!value || typeof value !== "object") {
    throw new Error("[v2:cardGenius] card response must be an object");
  }
  const card = value as Record<string, any>;
  const alias = card.card_alias || card.cardAlias || card.slug || card.name;
  if (!alias) {
    throw new Error("[v2:cardGenius] card response missing card_alias/name");
  }
  if (!card.spending_breakdown || typeof card.spending_breakdown !== "object") {
    throw new Error("[v2:cardGenius] spending_breakdown must be an object");
  }
  const rules: RewardRule[] = Object.entries(card.spending_breakdown).flatMap(([bucket, raw]: [string, any]) => {
    if (!raw || typeof raw !== "object") throw new Error(`[v2:cardGenius] ${bucket} breakdown must be an object`);
    const spend = Number(raw.spend || 0);
    const savings = Number(raw.savings || 0);
    if (spend <= 0 || savings <= 0) return [];
    const rewardKind = raw.savings_type === "points" ? "points" : "cashback";
    const capAmount = typeof raw.maxCap === "number" ? raw.maxCap : undefined;
    return [{
      bucket,
      rewardKind,
      rate: (savings / spend) * 100,
      rateBasis: "percent" as const,
      conversionRate: Number(raw.conv_rate ?? 1),
      cap: capAmount
        ? { amount: capAmount, period: "monthly" as const, scope: "bucket" as const, valueKind: "savings" as const }
        : undefined,
    }];
  });
  const hasPointsBreakdown = Object.values(card.spending_breakdown).some((raw: any) => raw?.savings_type === "points");
  const adapted = {
    cardAlias: alias,
    displayName: card.card_name || card.name || alias,
    annualFee: parseMoney(card.annual_fees || card.annualFee || card.annual_fee),
    rules,
    cardCap: card.card_max_cap
      ? { amount: Number(card.card_max_cap), period: "yearly", scope: "card", valueKind: hasPointsBreakdown ? "points" : "savings" }
      : undefined,
  };
  validateUniqueRewardRules(adapted);
  return adapted;
}

export function adaptCardGeniusCards(values: unknown[]): CardRuleSet[] {
  if (!Array.isArray(values)) throw new Error("[v2:cardGenius] cards must be an array");
  return values.map(adaptCardGeniusCard);
}

export function excludeOwnedCardResponses<T extends Record<string, any>>(cards: T[], ownedAliases: string[]): T[] {
  const owned = new Set((ownedAliases || []).map((alias) => String(alias).toLowerCase()));
  return (cards || []).filter((card) => !owned.has(String(card.card_alias || card.cardAlias || "").toLowerCase()));
}
