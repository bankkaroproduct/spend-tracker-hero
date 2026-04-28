// @ts-nocheck
// Single source of truth for transaction tag scenarios.
// Returns one of S1, S2, S3, S4, S5a, S5b, S5c, or S6.

import { USER_CARDS, BUCKET_TO_MERCHANT } from "./inputs";
import { calculateResponses, getEligibleMarketCards } from "./mockApi";

const CARD_IMG_MAP: Record<string, string> = {
  "Axis Flipkart": "/legacy-assets/cards/axis-flipkart.png",
  "Axis Flipkart Card": "/legacy-assets/cards/axis-flipkart.png",
  "HSBC Travel One": "/legacy-assets/cards/hsbc-travel-one.png",
  "HSBC Live+": "/legacy-assets/cards/hsbc-live.png",
  "HDFC Infinia": "/legacy-assets/cards/hdfc-infinia.png",
  "IDFC First Select": "/legacy-assets/cards/idfc select.png",
};

const merchantToBucket: Record<string, string> = {};
for (const [bucket, merchants] of Object.entries(BUCKET_TO_MERCHANT)) {
  for (const merchant of merchants as string[]) {
    if (!(merchant in merchantToBucket)) merchantToBucket[merchant] = bucket;
  }
}

function bucketFor(txn: any): string | null {
  if (txn?.bucket) return txn.bucket;
  if (txn?.brand && merchantToBucket[txn.brand]) return merchantToBucket[txn.brand];
  return null;
}

function displayCardName(name: string): string {
  return String(name || "")
    .replace(/\s+Credit\s+Card\s*$/i, "")
    .replace(/\s+Card\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function comparableCardName(name: string): string {
  return displayCardName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortCardName(name: string): string {
  const parts = displayCardName(name).split(" ").filter(Boolean);
  return parts.slice(0, 2).join(" ");
}

function formatRateFromBreakdown(cardName: string, breakdown: any, fallbackSpend: number, fallbackSavings: number): string {
  const spend = Number(breakdown?.spend ?? fallbackSpend) || 0;
  const savings = Number(breakdown?.savings ?? fallbackSavings) || 0;
  if (spend <= 0 || savings <= 0) return "";

  const isPoints = String(breakdown?.savings_type || "").toLowerCase() === "points" || displayCardName(cardName) === "HSBC Travel One";
  const pct = (savings / spend) * 100;
  if (isPoints && displayCardName(cardName) === "HSBC Travel One") {
    return `${Math.max(1, Math.round(pct))}X REWARDS`;
  }
  return `${Math.max(1, Math.round(pct))}% CASHBACK`;
}

function monthlySpendFor(bucket: string): number {
  return Number(calculateResponses[0]?.spending_breakdown?.[bucket]?.spend) || 0;
}

function walletSavingsFor(cardIndex: number, bucket: string): number {
  return Number(calculateResponses[cardIndex]?.spending_breakdown?.[bucket]?.savings) || 0;
}

function bestWalletFor(bucket: string): { cardIndex: number; savings: number } {
  let best = { cardIndex: -1, savings: 0 };
  for (let i = 0; i < calculateResponses.length; i++) {
    const savings = walletSavingsFor(i, bucket);
    if (savings > best.savings) best = { cardIndex: i, savings };
  }
  return best.cardIndex >= 0 ? best : { cardIndex: 0, savings: 0 };
}

function bestNonOwnedMarketFor(bucket: string): { card: any; savings: number } {
  let best = { card: null, savings: 0 };
  for (const card of getEligibleMarketCards()) {
    const savings = Number(card?.spending_breakdown?.[bucket]?.savings) || 0;
    if (savings > best.savings) best = { card, savings };
  }
  return best;
}

export type ScenarioId = "S1" | "S2" | "S3" | "S4" | "S5a" | "S5b" | "S5c" | "S6";

export interface CardRef {
  id: string;
  name: string;
  shortName: string;
  image: string;
  rateLabel: string;
  owned: boolean;
}

export interface TxnScenario {
  id: ScenarioId;
  actualSavings: number;
  bestWalletSavings: number;
  bestMarketSavings: number;
  bestOverallSavings: number;
  walletDelta: number;
  marketDelta: number;
  bestWalletCard: CardRef | null;
  bestMarketCard: CardRef | null;
  bestOverallCard: CardRef | null;
  worthAddingCard: CardRef | null;
  cardUsed: CardRef | null;
  walletEqualsMarket: boolean;
  isUPI: boolean;
  showNoWalletSubtext: boolean;
  showBetterInWallet: boolean;
  showWorthAdding: boolean;
}

function emptyScenario(id: ScenarioId = "S6", isUPI = false): TxnScenario {
  return {
    id,
    actualSavings: 0,
    bestWalletSavings: 0,
    bestMarketSavings: 0,
    bestOverallSavings: 0,
    walletDelta: 0,
    marketDelta: 0,
    bestWalletCard: null,
    bestMarketCard: null,
    bestOverallCard: null,
    worthAddingCard: null,
    cardUsed: null,
    walletEqualsMarket: false,
    isUPI,
    showNoWalletSubtext: false,
    showBetterInWallet: false,
    showWorthAdding: false,
  };
}

function walletCardRef(cardIndex: number, bucket: string, monthlySpend: number, monthlySavings: number): CardRef | null {
  const card = USER_CARDS[cardIndex];
  if (!card) return null;
  const name = displayCardName(card.name);
  const breakdown = calculateResponses[cardIndex]?.spending_breakdown?.[bucket];
  return {
    id: card.card_alias || comparableCardName(name),
    name,
    shortName: shortCardName(name),
    image: card.image || CARD_IMG_MAP[name] || "",
    rateLabel: formatRateFromBreakdown(name, breakdown, monthlySpend, monthlySavings),
    owned: true,
  };
}

function marketCardRef(card: any, bucket: string, monthlySpend: number, monthlySavings: number): CardRef | null {
  if (!card) return null;
  const name = displayCardName(card.card_name || card.name || "");
  if (!name) return null;
  const breakdown = card?.spending_breakdown?.[bucket];
  return {
    id: card.card_alias || comparableCardName(name),
    name,
    shortName: shortCardName(name),
    image: card.image || card.card_bg_image || CARD_IMG_MAP[name] || "/legacy-assets/cards/hdfc-infinia.png",
    rateLabel: formatRateFromBreakdown(name, breakdown, monthlySpend, monthlySavings),
    owned: false,
  };
}

function withVisibility(scn: TxnScenario): TxnScenario {
  return {
    ...scn,
    showNoWalletSubtext: scn.id === "S4" || scn.id === "S5c",
    showBetterInWallet: scn.id === "S3" || scn.id === "S5a" || scn.id === "S5b",
    showWorthAdding:
      !!scn.worthAddingCard &&
      (scn.id === "S2" ||
        scn.id === "S4" ||
        scn.id === "S5b" ||
        scn.id === "S5c" ||
        (scn.id === "S3" && scn.bestMarketSavings > scn.bestWalletSavings)),
  };
}

export function getTransactionScenario(txn: any): TxnScenario {
  if (!txn || txn.unaccounted) return emptyScenario();

  const isUPI = txn.via === "UPI" || txn.card === "UPI";
  const bucket = bucketFor(txn);
  if (!bucket) return emptyScenario("S6", isUPI);

  const amt = Number(txn.amt) || 0;
  const monthlySpend = monthlySpendFor(bucket);
  const proRate = monthlySpend > 0 ? amt / monthlySpend : 0;
  if (proRate <= 0) return emptyScenario("S6", isUPI);

  const wallet = bestWalletFor(bucket);
  const market = bestNonOwnedMarketFor(bucket);
  const cardIdx = typeof txn.card_index === "number" ? txn.card_index : null;
  const actualSavingsMonthly = !isUPI && cardIdx != null ? walletSavingsFor(cardIdx, bucket) : 0;

  const actualSavings = Math.round(actualSavingsMonthly * proRate);
  const bestWalletSavings = Math.round(wallet.savings * proRate);
  const bestMarketSavings = Math.round(market.savings * proRate);
  const bestOverallSavings = Math.max(bestWalletSavings, bestMarketSavings);

  const cardUsed = cardIdx != null ? walletCardRef(cardIdx, bucket, monthlySpend, actualSavingsMonthly) : null;
  const bestWalletCard = walletCardRef(wallet.cardIndex, bucket, monthlySpend, wallet.savings);
  const bestMarketCard = marketCardRef(market.card, bucket, monthlySpend, market.savings);
  const bestOverallCard = bestMarketSavings > bestWalletSavings ? bestMarketCard : bestWalletCard;
  const worthAddingCard = bestMarketCard && bestMarketSavings > bestWalletSavings ? bestMarketCard : null;
  const cardUsedIsBestWallet = cardIdx != null && cardIdx === wallet.cardIndex;
  const cardUsedIsBestOverall = !!cardUsed && !!bestOverallCard && cardUsed.id === bestOverallCard.id;
  const walletEqualsMarket = !!bestWalletCard && !!bestOverallCard && bestWalletCard.id === bestOverallCard.id;

  const base = {
    actualSavings,
    bestWalletSavings,
    bestMarketSavings,
    bestOverallSavings,
    walletDelta: Math.max(0, bestWalletSavings - actualSavings),
    marketDelta: Math.max(0, bestMarketSavings - actualSavings),
    bestWalletCard,
    bestMarketCard,
    bestOverallCard,
    worthAddingCard,
    cardUsed,
    walletEqualsMarket,
    isUPI,
  };

  if (isUPI) {
    if (bestWalletSavings === 0 && bestMarketSavings > 0) return withVisibility({ id: "S5c", ...base });
    if (bestMarketSavings > bestWalletSavings && bestWalletSavings > 0) return withVisibility({ id: "S5b", ...base });
    if (walletEqualsMarket && bestWalletSavings > 0) return withVisibility({ id: "S5a", ...base });
    return withVisibility({ id: "S6", ...base });
  }

  if (actualSavings === 0 && bestWalletSavings === 0 && bestMarketSavings > 0) {
    return withVisibility({ id: "S4", ...base });
  }

  if (!cardUsedIsBestWallet && bestWalletSavings > actualSavings) {
    return withVisibility({ id: "S3", ...base });
  }

  if (cardUsedIsBestWallet && cardUsedIsBestOverall) {
    return withVisibility({ id: "S1", ...base });
  }

  if (cardUsedIsBestWallet && bestMarketSavings > actualSavings) {
    return withVisibility({ id: "S2", ...base });
  }

  return withVisibility({ id: "S6", ...base });
}

export const SCENARIO_PILL: Record<ScenarioId, { bg: string; color: string; variant?: string }> = {
  S1: { bg: "#EAFBF3", color: "#078146", variant: "best" },
  S2: { bg: "#EAFBF3", color: "#078146", variant: "best" },
  S3: { bg: "#FBF6D8", color: "#B07A0E", variant: "switch" },
  S4: { bg: "linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)", color: "#0862CF", variant: "newcard" },
  S5a: { bg: "#FBF6D8", color: "#B07A0E", variant: "switch" },
  S5b: { bg: "#FBF6D8", color: "#B07A0E", variant: "switch" },
  S5c: { bg: "linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)", color: "#0862CF", variant: "newcard" },
  S6: { bg: "transparent", color: "transparent" },
};

export const SCENARIO_SAVED_COLOR: Record<ScenarioId, string> = {
  S1: "#078146",
  S2: "#68A250",
  S3: "#B56D3C",
  S4: "#B56D3C",
  S5a: "#B56D3C",
  S5b: "#B56D3C",
  S5c: "#B56D3C",
  S6: "#B56D3C",
};

function fmtN(n: number): string {
  return Math.round(n || 0).toLocaleString("en-IN");
}

export function tagText(scn: TxnScenario): string {
  const w = scn.bestWalletCard?.shortName?.toUpperCase() || "BEST CARD";
  const m = (scn.worthAddingCard || scn.bestMarketCard)?.shortName?.toUpperCase() || "MARKET CARD";
  switch (scn.id) {
    case "S1":
      return "USED BEST CARD FOR THIS";
    case "S2":
      return "USED YOUR BEST CARD FOR THIS";
    case "S3":
      return `USE ${w} AND SAVE \u20B9${fmtN(scn.walletDelta)}`;
    case "S4":
      return `+ GET ${m} & EARN \u20B9${fmtN(scn.bestMarketSavings)}`;
    case "S5a":
      return `USE ${w} AND SAVE \u20B9${fmtN(scn.bestWalletSavings)}`;
    case "S5b":
      return `USE ${w} AND SAVE \u20B9${fmtN(scn.bestWalletSavings)}`;
    case "S5c":
      return `+ GET ${m} & EARN \u20B9${fmtN(scn.bestMarketSavings)}`;
    default:
      return "";
  }
}
