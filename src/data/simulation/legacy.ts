// @ts-nocheck
// Drop-in adapter: re-exports computed data under existing names.
// Screen files import from here instead of the old hardcoded data files.

import { C } from "@/lib/theme";
import { USER_CARDS, TOTAL_ANNUAL_SPEND, BUCKET_TO_MERCHANT, BUCKET_TO_CATEGORY, MERCHANT_ICONS } from "./inputs";
import { calculateResponses, recommendResponse, getBestCardForBucket, getBestMarketCardForBucket, getFirstEligibleMarketCard, getEligibleMarketCards, isInviteOnlyMarketCard, isAlreadyOwnedMarketCard, getOwnedCardIndex } from "./mockApi";
import {
  computeCurrentSavings, computeOptimizedSavings, computeUltimateSavings,
  getSavingsBars, computeCombinedSavings, computeMatchScore, computeCardQuality,
  generateTransactions, generateActions,
  computeSpendCategories, computeSpendBrands,
  computeCardDetail, computeOptBrands, computeSpendDistribution,
  ACTIONS as COMPUTED_ACTIONS, ALL_ACTIONS as COMPUTED_ALL_ACTIONS, SMS_ACTIONS as COMPUTED_SMS_ACTIONS,
} from "./compute";
import { BANK_FEES_HSBC_TRAVEL, BANK_FEES_AXIS_FK, BANK_FEES_HSBC_LIVE, LATE_FEES_HSBC_TRAVEL, LATE_FEES_AXIS_FK, LATE_FEES_HSBC_LIVE } from "../cardDetail";
import {
  calculateRewardsForInput,
  selectActionsMetrics,
  selectBestCardBreakdownMetrics,
  selectBestCardDetailMetrics,
  selectBestCardsCombinedSavings,
  selectBestCardsListMetrics,
  selectCalculatorMetrics,
  selectCardPromoMetrics,
  selectOwnedCardDetailMetrics,
  selectOwnedCardsMetrics,
  selectPortfolioMetrics,
  selectRedeemMetrics,
  selectSavingsBars,
  selectSpendAnalysisMetrics,
  selectSpendDistributionMetrics,
  selectTransactionMetrics,
} from "./metrics";

const PER_CARD_BANK_FEES = [BANK_FEES_HSBC_TRAVEL, BANK_FEES_AXIS_FK, BANK_FEES_HSBC_LIVE];
const PER_CARD_LATE_FEES = [LATE_FEES_HSBC_TRAVEL, LATE_FEES_AXIS_FK, LATE_FEES_HSBC_LIVE];

// ─── cards.ts replacements ──────────────────────────────────────────────────

export const CARDS = selectOwnedCardsMetrics();

export const SEMI_CARDS = USER_CARDS.map((c) => ({
  bank: c.bank + " Bank",
  last4: c.last4,
  color: c.color,
}));

// ─── transactions.ts replacements ───────────────────────────────────────────

export const ALL_TXNS = selectTransactionMetrics().transactions;

const merchantSet = new Set<string>();
const iconSet = new Map<string, string>();
for (const t of ALL_TXNS) {
  if (!t.unaccounted) {
    merchantSet.add(t.brand);
    if (!iconSet.has(t.brand)) iconSet.set(t.brand, t.icon);
  }
}
export const br = Array.from(merchantSet);
export const ic = br.map((b) => iconSet.get(b) || "📦");

const bestCardForMap: Record<string, string> = {};
for (const [bucket, merchants] of Object.entries(BUCKET_TO_MERCHANT)) {
  const best = getBestCardForBucket(bucket);
  const cardName = USER_CARDS[best.cardIndex]?.name || USER_CARDS[0].name;
  for (const m of merchants) {
    bestCardForMap[m] = cardName;
  }
}

export const tg = (ms: number | null, ti: number, brand: string, via: string, amt: number) => {
  const rec = bestCardForMap[brand] || USER_CARDS[0].name;
  const cardNames = {
    "Axis Flipkart Card": "Axis Flipkart",
    "HSBC Travel One": "HSBC Travel One",
    "HSBC Live+": "HSBC Live+",
  };
  const viaName = cardNames[via] || via;
  if (ti === 4) return { t: "Need more details >", c: C.dim, bg: "#eef0f3" };

  const marketBest = getBestMarketCardForBucket(brand);
  const marketSavings = marketBest.savings || 0;
  const actualSavings = ms || 0;
  const marketDelta = amt > 0 && marketSavings > 0
    ? Math.round((marketSavings - actualSavings) / (marketSavings / (amt > 0 ? amt : 1)) || 0)
    : 0;
  if (ti === 3 && marketSavings > 0 && marketDelta > 0) {
    return { t: "★ Get " + marketBest.cardName.split(" ").slice(0, 3).join(" ") + " & earn ₹" + marketDelta + " more", c: C.blue, bg: "#EEEDFE" };
  }

  if (viaName === rec || !ms || ms <= 0) return { t: "Best card for this brand", c: C.dkGreen, bg: "#EAF3DE" };
  return { t: "Use " + rec + " — saves ₹" + (ms || 0), c: C.orange, bg: "#FAEEDA" };
};

// ─── spend.ts replacements ──────────────────────────────────────────────────

const _spendAnalysis = selectSpendAnalysisMetrics();
export const SPEND_CATS = _spendAnalysis.categories;
export const SPEND_BRANDS = _spendAnalysis.brands;
export const TOTAL_ACC = _spendAnalysis.totalSpend;

// ─── actions.ts replacements ────────────────────────────────────────────────

export const ACTIONS = COMPUTED_ACTIONS;
export const ALL_ACTIONS = COMPUTED_ALL_ACTIONS;
export const SMS_ACTIONS = COMPUTED_SMS_ACTIONS;

// ─── cardDetail.ts replacements ─────────────────────────────────────────────

const _cdCache = [0, 1, 2].map((i) => selectOwnedCardDetailMetrics(i));

export const CD = _cdCache.map((d, i) => ({
  advice: d.advice,
  adviceCta: "See how to optimize",
  saved: d.totalSaved,
  potential: d.potential,
  bestCard: d.bestCard,
  bestSaved: d.bestSaved,
  actions: d.actions,
  brands: d.brands,
  categories: d.categories,
  txns: d.txns,
  totalSpend: d.totalSpend,
  totalSaved: d.totalSaved,
  totalMissed: d.totalMissed,
  welcome: d.welcome,
  milestones: d.milestones,
  lounge: d.lounge,
  limits: d.limits,
  fees: d.fees,
  bankFees: PER_CARD_BANK_FEES[i],
  lateFees: PER_CARD_LATE_FEES[i],
}));

export const CD_BRANDS = _cdCache[0]?.brands || [];
export const CD_CATS = _cdCache[0]?.categories || [];

// ─── calculator.ts replacements ─────────────────────────────────────────────

const _calcMetrics = selectCalculatorMetrics();
export const CALC_CARDS = _calcMetrics.cards;

// CALC_BRANDS / CALC_CATS / BRAND_MAP / CAT_OPTIONS — generated from simulation
// (replaces the static, drifting rates that used to live in src/data/calculator.ts).
export const CALC_BRANDS: Record<string, Array<{ name: string; icon: string; rate: number }>> = (() => {
  const out: Record<string, any[]> = {};
  for (const b of _calcMetrics.brands) {
    const bestRate = Math.max(0, ..._calcMetrics.cards.map((c: any) => c.rates[b.name] || 0));
    (out[b.category] = out[b.category] || []).push({
      name: b.name,
      icon: MERCHANT_ICONS[b.name] || "📦",
      rate: Math.round(bestRate * 100) / 100,
    });
  }
  return out;
})();

export const CALC_CATS: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const [cat, brands] of Object.entries(CALC_BRANDS)) {
    out[cat] = Math.max(0, ...brands.map((b) => b.rate));
  }
  return out;
})();

export const CAT_OPTIONS = Object.keys(CALC_BRANDS);

export const BRAND_MAP: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const [cat, brands] of Object.entries(CALC_BRANDS)) {
    out[cat] = brands.map((b) => b.name);
  }
  return out;
})();

// ─── optimize.ts replacements ───────────────────────────────────────────────

export const OPT_BRANDS = computeOptBrands();

const marketTop = getFirstEligibleMarketCard();
export const SAVINGS_COMP = [
  {
    name: marketTop ? cleanCardName(marketTop.card_name) : "No recommendation",
    color: "#111827",
    cls: "Best Card For You",
    clsColor: C.dkGreen,
    barColor: "linear-gradient(90deg,#0d9f5f,#16a34a)",
    barPct: 100,
    savings: marketYearlySavings(marketTop),
  },
  {
    name: USER_CARDS[1].name,
    color: USER_CARDS[1].color,
    cls: computeCardQuality(1),
    clsColor: "#6d8c00",
    barColor: "linear-gradient(90deg,#a3c520,#d4e82c)",
    barPct: Math.round((calculateResponses[1].total_savings_yearly / (marketTop?.total_savings_yearly || 1)) * 100),
    savings: Math.round(calculateResponses[1].total_savings_yearly),
  },
  {
    name: USER_CARDS[0].name,
    color: USER_CARDS[0].color,
    cls: computeCardQuality(0),
    clsColor: C.orange,
    barColor: "linear-gradient(90deg,#d97706,#fbbf24)",
    barPct: Math.round((calculateResponses[0].total_savings_yearly / (marketTop?.total_savings_yearly || 1)) * 100),
    savings: Math.round(calculateResponses[0].total_savings_yearly),
  },
];

// ─── Savings bars (for Home + Optimize screens) ────────────────────────────

export const SAVINGS_BARS = selectSavingsBars();
export const COMBINED_SAVINGS = selectBestCardsCombinedSavings(2);

export const USER_CARD_YEARLY_SAVINGS = calculateResponses.map((cr, i) => ({
  name: USER_CARDS[i].name,
  savings: Math.round(cr.total_savings_yearly),
  color: USER_CARDS[i].color,
}));

// ─── Spend distribution (for Optimize screen) ──────────────────────────────

export const SPEND_DIST_WITH_ULTIMATE = selectSpendDistributionMetrics(true);
export const SPEND_DIST_WITHOUT_ULTIMATE = selectSpendDistributionMetrics(false);

// ─── Best Cards screen data ────────────────────────────────────────────────

function cleanCardName(n: string) { return (n || "").trim().replace(/\s+credit\s+card$/i, "").replace(/\s+/g, " ").trim(); }
function parseMoney(s: any): number { if (typeof s === "number") return s; if (!s) return 0; const cleaned = String(s).replace(/[^0-9.]/g, ""); return cleaned ? Math.round(parseFloat(cleaned)) : 0; }
function marketYearlySavings(card: any): number { return Math.round(card?.total_savings_yearly || parseMoney(card?.annual_rewards_value) || parseMoney(card?.net_annual_savings) || 0); }

export const BEST_CARDS = selectBestCardsListMetrics();

export const BEST_CARDS_FILTER_OPTS = [
  { label: "All Cards", value: "all" },
  { label: "Lifetime Free", value: "ltf" },
  { label: "Fee Waiver", value: "waiver" },
  { label: "Invite Only", value: "invite" },
];

export const BEST_CARDS_COMB_SAVINGS = selectBestCardsCombinedSavings(2);

// ─── Best Cards detail data ────────────────────────────────────────────────

export function getBestCardDetail(idx: number) {
  return selectBestCardDetailMetrics(idx);
}

// ─── Redeem screen data ────────────────────────────────────────────────────

const _redeemMetrics = selectRedeemMetrics();
export const REDEEM_DATA: Record<string, any> = _redeemMetrics.byCardName;
export const MARKET_REDEEM_CARDS = _redeemMetrics.marketCards;

// ─── Actions screen data (inline replacement) ──────────────────────────────

const _actionsMetrics = selectActionsMetrics();
const _actionsList = Array.isArray(_actionsMetrics) ? _actionsMetrics : (_actionsMetrics?.items || []);
export const ACTIONS_DATA = _actionsList.slice(0, 7).map((a) => ({
  title: a.title,
  desc: a.desc,
  badge: a.badge,
  type: a.type,
  brand: a.title.toLowerCase().includes("axis") ? "axis" : "hsbc",
  chevron: a.type === "cap",
  redeem: a.type === "points",
}));

// ─── CardDetail best-for-brand mapping ──────────────────────────────────────

export const BEST_FOR_BRAND: Record<string, string> = { ...bestCardForMap };

// ─── Per-txn savings helpers (for BottomSheets) ────────────────────────────

export { computeTxnSaved, computeTxnMissed, computeTxnMarketDelta } from "./compute";
export {
  calculateRewardsForInput,
  selectBestCardBreakdownMetrics,
  selectPortfolioMetrics,
};

// ─── Card image map — single source of truth ───────────────────────────────
// Used by BottomSheets, BestCards, Portfolio, Calc, Redeem, etc.
export const CARD_IMG_MAP: Record<string, string> = {
  "Axis Flipkart": "/legacy-assets/cards/axis-flipkart.png",
  "HSBC Travel One": "/legacy-assets/cards/hsbc-travel-one.png",
  "HSBC Live+": "/legacy-assets/cards/hsbc-live.png",
  "HDFC Infinia": "/legacy-assets/cards/hdfc-infinia.png",
  "HDFC Millennia": "/legacy-assets/cards/Hdfc swiggy.png",
  "HDFC Millenia": "/legacy-assets/cards/Hdfc swiggy.png",
  "HDFC Swiggy": "/legacy-assets/cards/Hdfc swiggy.png",
  "HDFC Regalia": "/legacy-assets/cards/hdfc-infinia.png",
  "IDFC First Select": "/legacy-assets/cards/idfc select.png",
  "IDFC First Classic": "/legacy-assets/cards/idfc-select.png",
  "Amex Travel Platinum": "/legacy-assets/cards/amex-platinum-travel.png",
  "Amex Platinum": "/legacy-assets/cards/amex-platinum-travel.png",
  "American Express Travel Platinum": "/legacy-assets/cards/amex-platinum-travel.png",
  "Amex MRCC": "/legacy-assets/cards/amex-platinum-travel.png",
  "Axis Magnus": "/legacy-assets/cards/AU-Zenith.png",
  "AU Zenith": "/legacy-assets/cards/AU-Zenith.png",
  "AU Zenith Plus": "/legacy-assets/cards/AU-Zenith.png",
  "ICICI Emeralde": "/legacy-assets/cards/icici-emeralde.png",
  "SBI Miles": "/legacy-assets/cards/sbi-miles.png",
};

// ─── Card Promo data (for Home screen) ──────────────────────────────────────

export const CARD_PROMO = selectCardPromoMetrics();

// ─── BottomSheets card rate/best mappings ───────────────────────────────────

export const SIM_CARD_RATE: Record<string, Record<string, number>> = {};
export const SIM_CARD_BASE_RATE: Record<string, number> = {};
export const SIM_BEST_FOR: Record<string, string> = {};
export const SIM_MARKET_BEST: Record<string, { name: string; rate: number; img: string }> = {};

for (const card of USER_CARDS) {
  const cr = calculateResponses[card.index];
  const rateMap: Record<string, number> = {};
  for (const [bucket, merchants] of Object.entries(BUCKET_TO_MERCHANT)) {
    const bd = cr?.spending_breakdown?.[bucket];
    if (bd && bd.spend > 0) {
      const rate = (bd.savings / bd.spend) * 100;
      for (const m of merchants) rateMap[m] = Math.round(rate * 10) / 10;
    }
  }
  SIM_CARD_RATE[card.name] = rateMap;
  SIM_CARD_BASE_RATE[card.name] = card.savings_type === "points"
    ? card.reward_rates.default * 100
    : (card.reward_rates.default || card.reward_rates.accelerated || 0) * 100;
}

for (const [bucket, merchants] of Object.entries(BUCKET_TO_MERCHANT)) {
  const best = getBestCardForBucket(bucket);
  const marketBest = getBestMarketCardForBucket(bucket);
  for (const m of merchants) {
    SIM_BEST_FOR[m] = USER_CARDS[best.cardIndex]?.name || USER_CARDS[0].name;
    if (marketBest.savings > 0) {
      const spend = calculateResponses[0]?.spending_breakdown?.[bucket]?.spend || 1;
      const mCard = getEligibleMarketCards().find(c => c.card_name?.includes(marketBest.cardName));
      SIM_MARKET_BEST[m] = {
        name: marketBest.cardName.split(" ").slice(0, 3).join(" "),
        rate: Math.round((marketBest.savings / spend) * 1000) / 10,
        img: mCard?.image || mCard?.card_bg_image || "",
      };
    }
  }
}
