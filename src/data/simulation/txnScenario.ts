// @ts-nocheck
// Single source of truth for transaction tag scenarios.
// Returns one of S1, S2, S3, S4, S5a, S5b, S5c, or S6.

import { USER_CARDS, BUCKET_TO_MERCHANT, MERCHANT_TO_BUCKET } from "./inputs";
import {
  calculateResponses,
  getBestCardForBucket,
  getBestMarketCardForBucket,
  getEligibleMarketCards,
} from "./mockApi";

const CARD_IMG_MAP: Record<string, string> = {
  "Axis Flipkart": "/legacy-assets/cards/axis-flipkart.png",
  "Axis Flipkart Card": "/legacy-assets/cards/axis-flipkart.png",
  "HSBC Travel One": "/legacy-assets/cards/HSBC TravelOne Credit Card.png",
  "HSBC Live+": "/legacy-assets/cards/hsbc-live.png",
  "HDFC Infinia": "/legacy-assets/cards/hdfc-infinia.png",
  "IDFC First Select": "/legacy-assets/cards/idfc select.png",
};

// Reverse-build merchant → bucket map (inputs.ts may not export it).
const _merchantToBucket: Record<string, string> = {};
for (const [bucket, merchants] of Object.entries(BUCKET_TO_MERCHANT)) {
  for (const m of merchants as string[]) _merchantToBucket[m] = bucket;
}

function bucketFor(txn: any): string | null {
  if (txn?.bucket) return txn.bucket;
  if (txn?.brand && _merchantToBucket[txn.brand]) return _merchantToBucket[txn.brand];
  return null;
}

function normalizeCardName(name: string): string {
  if (!name) return "";
  return name.replace(/\s+Card$/i, "").trim();
}

function shortCardName(name: string): string {
  const n = normalizeCardName(name);
  // First 2 words for tag pills
  return n.split(" ").slice(0, 2).join(" ");
}

function rateLabel(cardName: string, monthlySpend: number, monthlySavings: number): string {
  if (monthlySpend <= 0) return "";
  const isPoints = cardName === "HSBC Travel One";
  const pct = (monthlySavings / monthlySpend) * 100;
  if (isPoints) {
    // Approximate "X RP per ₹100" → display as multiplier
    return Math.max(1, Math.round(pct)) + "X REWARDS";
  }
  return Math.max(1, Math.round(pct)) + "% CASHBACK";
}

function marketRateLabel(card: any, bucket: string): string {
  const bd = card?.spending_breakdown?.[bucket];
  if (!bd || bd.spend <= 0) return "";
  const pct = (bd.savings / bd.spend) * 100;
  return Math.max(1, Math.round(pct)) + "% CASHBACK";
}

export type ScenarioId = "S1" | "S2" | "S3" | "S4" | "S5a" | "S5b" | "S5c" | "S6";

export interface CardRef {
  name: string;
  shortName: string;
  image: string;
  rateLabel: string;
}

export interface TxnScenario {
  id: ScenarioId;
  actualSavings: number;
  bestWalletSavings: number;
  bestMarketSavings: number;
  walletDelta: number; // bestWalletSavings - actualSavings
  marketDelta: number; // bestMarketSavings - actualSavings
  bestWalletCard: CardRef | null;
  bestMarketCard: CardRef | null;
  walletEqualsMarket: boolean;
  isUPI: boolean;
}

const EMPTY_S6: TxnScenario = {
  id: "S6",
  actualSavings: 0,
  bestWalletSavings: 0,
  bestMarketSavings: 0,
  walletDelta: 0,
  marketDelta: 0,
  bestWalletCard: null,
  bestMarketCard: null,
  walletEqualsMarket: false,
  isUPI: false,
};

export function getTransactionScenario(txn: any): TxnScenario {
  if (!txn || txn.unaccounted) return EMPTY_S6;

  const bucket = bucketFor(txn);
  const isUPI = txn.via === "UPI" || txn.card === "UPI";
  if (!bucket) return { ...EMPTY_S6, isUPI };

  const amt = Number(txn.amt) || 0;
  const cardIdx = txn.card_index;

  // Pull monthly figures from API responses
  const wallet = getBestCardForBucket(bucket); // {cardIndex, savings} monthly
  const market = getBestMarketCardForBucket(bucket); // {cardIndex (within eligible), savings, cardName}

  // Monthly bucket spend (use card 0 since spend is identical across cards)
  const monthlySpend = calculateResponses[0]?.spending_breakdown?.[bucket]?.spend || 0;
  const proRate = monthlySpend > 0 ? amt / monthlySpend : 0;

  const actualSavingsMonthly = !isUPI && cardIdx != null
    ? (calculateResponses[cardIdx]?.spending_breakdown?.[bucket]?.savings || 0)
    : 0;

  const actualSavings = Math.round(actualSavingsMonthly * proRate);
  const bestWalletSavings = Math.round(wallet.savings * proRate);
  const bestMarketSavings = Math.round(market.savings * proRate);

  // Build wallet card ref
  const walletCardName = USER_CARDS[wallet.cardIndex]?.name || "";
  const bestWalletCard: CardRef | null = walletCardName
    ? {
        name: walletCardName,
        shortName: shortCardName(walletCardName),
        image: CARD_IMG_MAP[walletCardName] || CARD_IMG_MAP[normalizeCardName(walletCardName)] || "",
        rateLabel: rateLabel(walletCardName, monthlySpend, wallet.savings),
      }
    : null;

  // Build market card ref
  const marketCards = getEligibleMarketCards();
  const mCardObj = marketCards.find((c: any) => c.card_name === market.cardName) || marketCards[0];
  const marketName = mCardObj?.card_name ? normalizeCardName(mCardObj.card_name) : "";
  const bestMarketCard: CardRef | null = marketName && market.savings > 0
    ? {
        name: marketName,
        shortName: shortCardName(marketName),
        image: mCardObj?.image || mCardObj?.card_bg_image || "/legacy-assets/cards/hdfc-infinia.png",
        rateLabel: marketRateLabel(mCardObj, bucket),
      }
    : null;

  // Wallet vs market identity (by name match — market cards are different brands so this is rarely true)
  const walletEqualsMarket = !!(walletCardName && marketName &&
    normalizeCardName(walletCardName).toLowerCase() === marketName.toLowerCase());

  const walletDelta = Math.max(0, bestWalletSavings - actualSavings);
  const marketDelta = Math.max(0, bestMarketSavings - actualSavings);

  const base = {
    actualSavings,
    bestWalletSavings,
    bestMarketSavings,
    walletDelta,
    marketDelta,
    bestWalletCard,
    bestMarketCard,
    walletEqualsMarket,
    isUPI,
  };

  // ── Routing ──────────────────────────────────────────────────────────────
  if (isUPI) {
    if (bestWalletSavings === 0 && bestMarketSavings > 0) return { id: "S5c", ...base };
    if (bestMarketSavings > bestWalletSavings) return { id: "S5b", ...base };
    if (walletEqualsMarket && bestWalletSavings > 0) return { id: "S5a", ...base };
    // Wallet has reward but market doesn't beat it (and not equal-by-name) → still useful to nudge
    if (bestWalletSavings > 0) return { id: "S5a", ...base };
    return { id: "S6", ...base };
  }

  // Card payments
  if (actualSavings === 0 && bestWalletSavings === 0 && bestMarketSavings > 0) {
    return { id: "S4", ...base };
  }

  const cardUsedIsBestWallet = cardIdx === wallet.cardIndex;

  if (!cardUsedIsBestWallet && bestWalletSavings > actualSavings) {
    return { id: "S3", ...base };
  }

  if (cardUsedIsBestWallet) {
    // S1 only when wallet's best is also market's best for this bucket
    // (in this dataset wallet cards rarely == market cards by name, so use savings comparison)
    if (bestMarketSavings <= actualSavings || walletEqualsMarket) {
      return { id: "S1", ...base };
    }
    return { id: "S2", ...base };
  }

  return { id: "S6", ...base };
}

// ── Display helpers ────────────────────────────────────────────────────────

export const SCENARIO_PILL: Record<ScenarioId, { bg: string; color: string }> = {
  S1: { bg: "#EAFBF3", color: "#078146" },
  S2: { bg: "#EAFBF3", color: "#078146" },
  S3: { bg: "#FBF6D8", color: "#B07A0E" },
  S4: { bg: "linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)", color: "#0862CF" },
  S5a: { bg: "#FBF6D8", color: "#B07A0E" },
  S5b: { bg: "#FBF6D8", color: "#B07A0E" },
  S5c: { bg: "linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)", color: "#0862CF" },
  S6: { bg: "#EDEDED", color: "#7a8296" },
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
  const m = scn.bestMarketCard?.shortName?.toUpperCase() || "MARKET CARD";
  switch (scn.id) {
    case "S1": return "USED BEST CARD FOR THIS";
    case "S2": return "USED YOUR BEST CARD FOR THIS";
    case "S3": return `USE ${w} AND SAVE ₹${fmtN(scn.walletDelta)}`;
    case "S4": return `+ GET ${m} & EARN ₹${fmtN(scn.bestMarketSavings)}`;
    case "S5a": return `USE ${w} AND SAVE ₹${fmtN(scn.bestWalletSavings)}`;
    case "S5b": return `USE ${w} AND SAVE ₹${fmtN(scn.bestWalletSavings)}`;
    case "S5c": return `+ GET ${m} & EARN ₹${fmtN(scn.bestMarketSavings)}`;
    default: return "";
  }
}
