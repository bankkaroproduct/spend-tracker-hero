// V2 transaction engine.
// Computes per-transaction saved/missed/uplift from amount-proportional rewards.
// This engine is stateless by design: it does not know how much monthly cap was
// already consumed before a transaction. Use portfolio/monthly allocation logic
// when cap carry-forward across multiple transactions is required.

import type { CardRuleSet, TransactionInput } from "../domain/types";
import { roundMoney } from "../domain/money";
import { calculateReward } from "./rewards";

export interface TransactionOutcome {
  transactionId: string;
  saved: number;
  missed: number;
  bestCardAlias?: string;
  usedCardAlias?: string;
}

export function calculateTransactionOutcome(
  txn: TransactionInput,
  ownedCards: CardRuleSet[],
  marketCards: CardRuleSet[] = [],
): TransactionOutcome {
  const spend = {
    bucket: txn.bucket || "unknown",
    amount: txn.amount,
    period: "yearly" as const,
    merchant: txn.merchant,
  };
  const used = ownedCards.find((card) => card.cardAlias === txn.usedCardAlias);
  const saved = used ? calculateReward(used, spend).cappedSavings : 0;
  const candidates = [...ownedCards, ...marketCards];
  const best = candidates
    .map((card) => ({ card, reward: calculateReward(card, spend).cappedSavings }))
    .sort((a, b) => b.reward - a.reward)[0];
  const bestReward = best?.reward || 0;

  return {
    transactionId: txn.id,
    usedCardAlias: used?.cardAlias,
    bestCardAlias: best?.card.cardAlias,
    saved: roundMoney(saved),
    missed: roundMoney(Math.max(0, bestReward - saved)),
  };
}
