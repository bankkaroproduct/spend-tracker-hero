// V2 portfolio engine.
// Owns current/optimized/ultimate totals, owned-card exclusion, and card summaries.

import type { CardRuleSet, CardSavingsSummary, SpendInput } from "../domain/types";
import { roundMoney } from "../domain/money";
import { calculateRewards } from "./rewards";

export function excludeOwnedCards<T extends { cardAlias?: string; card_alias?: string }>(
  marketCards: T[],
  ownedAliases: string[],
): T[] {
  const owned = new Set(ownedAliases);
  return (marketCards || []).filter((card) => !owned.has(card.cardAlias || card.card_alias || ""));
}

export function calculateCardSavings(card: CardRuleSet, spends: SpendInput[]): CardSavingsSummary {
  const grossSavings = roundMoney(
    calculateRewards(card, spends || []).reduce((sum, line) => sum + line.cappedSavings, 0),
  );
  const annualFee = roundMoney(card.annualFee || 0);
  return {
    cardAlias: card.cardAlias,
    grossSavings,
    annualFee,
    netSavings: roundMoney(grossSavings - annualFee),
    period: "yearly",
  };
}

export function bestCardForSpend(cards: CardRuleSet[], spend: SpendInput): CardSavingsSummary | null {
  const summaries = (cards || []).map((card) => {
    const grossSavings = roundMoney(calculateRewards(card, [spend]).reduce((sum, line) => sum + line.cappedSavings, 0));
    return {
      cardAlias: card.cardAlias,
      grossSavings,
      annualFee: roundMoney(card.annualFee || 0),
      netSavings: roundMoney(grossSavings - (card.annualFee || 0)),
      period: "yearly" as const,
    };
  });
  return summaries.sort((a, b) => b.grossSavings - a.grossSavings)[0] || null;
}
