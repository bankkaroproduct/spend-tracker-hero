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
  const rec = bestCardForMap[brand] || "Axis Flipkart";
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
export const TOTAL_ACC = _spendAnalysis.total;

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

export const CALC_CARDS = selectCalculatorMetrics().cards;

export { CALC_BRANDS, CALC_CATS, CAT_OPTIONS, BRAND_MAP } from "../calculator";

// ─── optimize.ts replacements ───────────────────────────────────────────────

export const OPT_BRANDS = computeOptBrands();

const marketTop = getFirstEligibleMarketCard();
export const SAVINGS_COMP = [
  {
    name: cleanCardName(marketTop?.card_name || "HDFC Diners Black"),
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
function parseFee(s: any): number { if (!s) return 0; const m = String(s).replace(/[₹,\s]/g, "").match(/\d+/); return m ? parseInt(m[0]) : 0; }
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
  const card = recommendResponse?.savings?.[idx];
  if (!card) return null;
  const netSavings = Math.round((card.total_savings_yearly || 0) - (parseInt(card.annual_fee_without_gst || "0") || 0));
  const worstUserCard = calculateResponses.reduce((w, c, i) =>
    c.total_savings_yearly < (w?.total_savings_yearly || Infinity) ? { ...c, _idx: i } : w, null);

  const wb = card.welcomeBenefits || card.welcome_benefits;
  const wbFirst = Array.isArray(wb) ? wb[0] : null;
  const mb = card.milestone_benefits;
  const milestoneArr = Array.isArray(mb) ? mb : [];
  const milestoneVal = typeof mb === "string" ? parseMoney(mb) : 0;

  return {
    welcome: wbFirst ? {
      amt: wbFirst.cash_value || parseMoney(wbFirst.voucher_bonus) || parseMoney(wbFirst.rp_bonus) || 0,
      validity: (wbFirst.maximum_days || "30") + " days",
    } : null,
    milestones: milestoneArr.length > 0
      ? milestoneArr.map((m) => ({
          amt: parseInt(m.voucherBonus || m.rpBonus || "0") || 0,
          validity: (m.maxDays || "365") + " days",
        }))
      : milestoneVal > 0
        ? [{ amt: milestoneVal, validity: "per year" }]
        : [],
    lounge: {
      qty: (card.travel_benefits?.domestic_lounges_unlocked || 0) + (card.travel_benefits?.international_lounges_unlocked || 0),
      type: "per year",
    },
    fees: {
      annual: parseFee(card.annual_fees || card.annual_fee) || 0,
      waiver: card.annual_fee_spends ? "Spend ₹" + (parseInt(card.annual_fee_spends) / 100000) + "L to waive" : "Check bank website",
    },
    replace: worstUserCard ? USER_CARDS[worstUserCard._idx]?.name : USER_CARDS[2].name,
    replaceSave: worstUserCard ? Math.round((card.total_savings_yearly || 0) - worstUserCard.total_savings_yearly) : 0,
    netSavings,
    brandFit: buildBrandFit(card),
    redemptionOptions: card.redemption_options || [],
    recommendedRedemption: card.recommended_redemption_options || [],
    productUsps: card.product_usps || [],
    comparisonBars: [
      { name: cleanCardName(card.card_name), savings: Math.round(card.total_savings_yearly || 0), color: "#111827" },
      ...calculateResponses.map((cr, i) => ({
        name: USER_CARDS[i].name,
        savings: Math.round(cr.total_savings_yearly),
        color: USER_CARDS[i].color,
      })),
    ],
  };
}

function buildBrandFit(card: any) {
  const topBuckets = Object.entries(card.spending_breakdown || {})
    .filter(([, v]: any) => v.spend > 0 && v.savings > 0)
    .sort(([, a]: any, [, b]: any) => b.savings - a.savings)
    .slice(0, 10);

  return topBuckets.map(([bucket, data]: any) => {
    const merchants = BUCKET_TO_MERCHANT[bucket] || [bucket];
    const rate = data.spend > 0 ? ((data.savings / data.spend) * 100).toFixed(1) : "0";
    return {
      brand: merchants[0],
      spend: Math.round(data.spend * 12),
      rate: rate + "%",
      savings: Math.round(data.savings * 12),
    };
  });
}

// ─── Redeem screen data ────────────────────────────────────────────────────

const _redeemMetrics = selectRedeemMetrics();
export const REDEEM_DATA: Record<string, any> = _redeemMetrics.byCardName;
for (const card of []) {
  REDEEM_DATA[card.name] = {
    pointName: card.ptName,
    perPt: card.conv_rate,
    checkUrl: "",
    options: card.index === 0
      ? [
          // HSBC Travel One: 1 RP = ₹0.20 (MCP confirmed)
          { name: "Statement Credit", rate: 0.20, steps: ["Login to HSBC Online", "Cards → Rewards", "Select Statement Credit"] },
          { name: "Travel Booking", rate: 0.20, steps: ["Login to HSBC Online", "Cards → Rewards", "Book via SmartBuy"] },
        ]
      : [
          { name: "Auto Cashback", rate: 1.0, steps: ["Cashback is credited automatically to your statement"] },
        ],
  };
}

const _legacyMarketRedeemCards = (recommendResponse?.savings || []).slice(0, 0).map((card) => {
  const topRedemption = card.redemption_options?.[0];
  return {
    name: cleanCardName(card.card_name),
    bank: card.bank_name,
    perPt: topRedemption?.conversion_rate || 0.50,
    method: topRedemption?.method || "Points",
    image: card.image,
  };
});
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
