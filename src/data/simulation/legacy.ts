// @ts-nocheck
// Drop-in adapter: re-exports computed data under existing names.
// Screen files import from here instead of the old hardcoded data files.

import { C } from "@/lib/theme";
import { USER_CARDS, TOTAL_ANNUAL_SPEND, BUCKET_TO_MERCHANT, BUCKET_TO_CATEGORY, MERCHANT_ICONS } from "./inputs";
import { calculateResponses, recommendResponse, getBestCardForBucket, getBestMarketCardForBucket, getFirstEligibleMarketCard, getEligibleMarketCards, isInviteOnlyMarketCard } from "./mockApi";
import {
  computeCurrentSavings, computeOptimizedSavings, computeUltimateSavings,
  getSavingsBars, computeCombinedSavings, computeMatchScore, computeCardQuality,
  generateTransactions, generateActions,
  computeSpendCategories, computeSpendBrands,
  computeCardDetail, computeOptBrands, computeSpendDistribution,
  ACTIONS as COMPUTED_ACTIONS, ALL_ACTIONS as COMPUTED_ALL_ACTIONS, SMS_ACTIONS as COMPUTED_SMS_ACTIONS,
} from "./compute";
import { BANK_FEES_HSBC_TRAVEL, BANK_FEES_AXIS_FK, BANK_FEES_HSBC_LIVE, LATE_FEES_HSBC_TRAVEL, LATE_FEES_AXIS_FK, LATE_FEES_HSBC_LIVE } from "../cardDetail";

const PER_CARD_BANK_FEES = [BANK_FEES_HSBC_TRAVEL, BANK_FEES_AXIS_FK, BANK_FEES_HSBC_LIVE];
const PER_CARD_LATE_FEES = [LATE_FEES_HSBC_TRAVEL, LATE_FEES_AXIS_FK, LATE_FEES_HSBC_LIVE];

// ─── cards.ts replacements ──────────────────────────────────────────────────

export const CARDS = USER_CARDS.map((c) => ({
  name: c.name,
  last4: c.last4,
  color: c.color,
  accent: c.accent,
  headerAccent: c.headerAccent,
  quality: computeCardQuality(c.index),
  availPts: c.availPts,
  ptName: c.ptName,
  points_expiring: c.points_expiring,
}));

export const SEMI_CARDS = USER_CARDS.map((c) => ({
  bank: c.bank + " Bank",
  last4: c.last4,
  color: c.color,
}));

// ─── transactions.ts replacements ───────────────────────────────────────────

export const ALL_TXNS = generateTransactions();

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

export const SPEND_CATS = computeSpendCategories();
export const SPEND_BRANDS = computeSpendBrands();
export const TOTAL_ACC = TOTAL_ANNUAL_SPEND;

// ─── actions.ts replacements ────────────────────────────────────────────────

export const ACTIONS = COMPUTED_ACTIONS;
export const ALL_ACTIONS = COMPUTED_ALL_ACTIONS;
export const SMS_ACTIONS = COMPUTED_SMS_ACTIONS;

// ─── cardDetail.ts replacements ─────────────────────────────────────────────

const _cdCache = [0, 1, 2].map((i) => computeCardDetail(i));

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

export const CALC_CARDS = USER_CARDS.map((c) => {
  const rates: Record<string, number> = { default: 0 };
  if (c.index === 0) {
    rates.default = 0.4;
    rates.MakeMyTrip = 3.2; rates.Cleartrip = 3.2; rates.IndiGo = 3.2; rates["Air India"] = 3.2;
    rates["Booking.com"] = 4.8; rates.OYO = 4.8;
  } else if (c.index === 1) {
    rates.default = 1;
    rates.Flipkart = 5; rates.Myntra = 7.5;
    rates.MakeMyTrip = 5; rates.Cleartrip = 5; rates["Booking.com"] = 5; rates.OYO = 5;
    rates.Swiggy = 4; rates.Uber = 4; rates.PVR = 4; rates["Cult.fit"] = 4;
  } else if (c.index === 2) {
    rates.default = 1.5;
    rates.Swiggy = 10; rates.Zomato = 10; rates.BigBasket = 10;
    rates.Blinkit = 10; rates.Zepto = 10; rates.DMart = 10;
    rates.Starbucks = 10; rates["McDonald's"] = 10;
    rates["Swiggy Instamart"] = 10; rates["Nature's Basket"] = 10;
  }
  return {
    name: c.name,
    type: c.savings_type === "points" ? "Points" : c.index === 1 ? "Auto Cashback" : "Cashback",
    rates,
  };
});

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

export const SAVINGS_BARS = getSavingsBars();
export const COMBINED_SAVINGS = computeCombinedSavings(2);

// ─── Spend distribution (for Optimize screen) ──────────────────────────────

export const SPEND_DIST_WITH_ULTIMATE = computeSpendDistribution(true);
export const SPEND_DIST_WITHOUT_ULTIMATE = computeSpendDistribution(false);

// ─── Best Cards screen data ────────────────────────────────────────────────

function cleanCardName(n: string) { return (n || "").trim().replace(/\s+credit\s+card$/i, "").replace(/\s+/g, " ").trim(); }
function parseFee(s: any): number { if (!s) return 0; const m = String(s).replace(/[₹,\s]/g, "").match(/\d+/); return m ? parseInt(m[0]) : 0; }
function parseMoney(s: any): number { if (typeof s === "number") return s; if (!s) return 0; const cleaned = String(s).replace(/[^0-9.]/g, ""); return cleaned ? Math.round(parseFloat(cleaned)) : 0; }
function marketYearlySavings(card: any): number { return Math.round(card?.total_savings_yearly || parseMoney(card?.annual_rewards_value) || parseMoney(card?.net_annual_savings) || 0); }

export const BEST_CARDS = (recommendResponse?.savings || []).map((card, i) => ({
  name: cleanCardName(card.card_name),
  bank: card.bank_name,
  color: i === 0 ? "#111827" : i === 1 ? "#0c2340" : "#333",
  accent: "#666",
  annualFee: parseFee(card.annual_fees || card.annual_fee) || Math.round((parseFee(card.annual_fee_without_gst) || 0) * 1.18),
  savings: marketYearlySavings(card),
  match: computeMatchScore(i),
  tags: (isInviteOnlyMarketCard(card) ? ["Invite Only"] : []).concat(
    parseFee(card.annual_fees || card.annual_fee) === 0 ? ["Lifetime Free"] : [],
    (card.annual_fee_waiver_toggle || card.annual_fee_waiver) ? ["Fee Waiver"] : []
  ),
  highlights: (card.product_usps || []).slice(0, 3).map((u) => u.header + ": " + u.description),
  whyGood: (card.product_usps || []).slice(0, 3).map((u) => u.header),
  whyNot: [],
  howToApply: card.cg_network_url ? "Apply via partner link" : "Apply on bank website",
  image: card.image || card.card_bg_image || null,
  card_bg_image: card.card_bg_image,
  card_bg_gradient: card.card_bg_gradient,
  cg_network_url: card.cg_network_url,
  ck_store_url: card.ck_store_url,
}));

export const BEST_CARDS_FILTER_OPTS = [
  { label: "All Cards", value: "all" },
  { label: "Lifetime Free", value: "ltf" },
  { label: "Fee Waiver", value: "waiver" },
  { label: "Invite Only", value: "invite" },
];

export const BEST_CARDS_COMB_SAVINGS = computeCombinedSavings(2);

// ─── Best Cards detail data ────────────────────────────────────────────────

export function getBestCardDetail(idx: number) {
  const card = recommendResponse?.savings?.[idx];
  if (!card) return null;
  const netSavings = Math.round((card.total_savings_yearly || 0) - (parseInt(card.annual_fee_without_gst || "0") || 0));
  const worstUserCard = calculateResponses.reduce((w, c, i) =>
    c.total_savings_yearly < (w?.total_savings_yearly || Infinity) ? { ...c, _idx: i } : w, null);

  return {
    welcome: card.welcomeBenefits?.[0] ? {
      amt: card.welcomeBenefits[0].cash_value || 0,
      validity: card.welcomeBenefits[0].maximum_days + " days",
    } : null,
    milestones: (card.milestone_benefits || []).map((m) => ({
      amt: parseInt(m.voucherBonus || m.rpBonus || "0") || 0,
      validity: m.maxDays + " days",
    })),
    lounge: {
      qty: (card.travel_benefits?.domestic_lounges_unlocked || 0) + (card.travel_benefits?.international_lounges_unlocked || 0),
      type: "per year",
    },
    fees: {
      annual: parseFee(card.annual_fees || card.annual_fee) || 0,
      waiver: card.annual_fee_spends ? "Spend ₹" + (parseInt(card.annual_fee_spends) / 100000) + "L to waive" : "No waiver",
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

export const REDEEM_DATA: Record<string, any> = {};
for (const card of USER_CARDS) {
  REDEEM_DATA[card.name] = {
    pointName: card.ptName,
    perPt: card.conv_rate,
    checkUrl: "",
    options: card.index === 0
      ? [
          { name: "Air Miles (best value)", rate: 0.30, steps: ["Login to HSBC Online", "Cards → Rewards", "Select Air Miles"] },
          { name: "Amazon Pay", rate: 0.20, steps: ["Login to HSBC Online", "Cards → Rewards", "Select Amazon Pay"] },
          { name: "Statement Credit", rate: 0.20, steps: ["Login to HSBC Online", "Cards → Rewards", "Select Statement Credit"] },
        ]
      : [
          { name: "Auto Cashback", rate: 1.0, steps: ["Cashback is credited automatically to your statement"] },
        ],
  };
}

export const MARKET_REDEEM_CARDS = (recommendResponse?.savings || []).slice(0, 3).map((card) => {
  const topRedemption = card.redemption_options?.[0];
  return {
    name: cleanCardName(card.card_name),
    bank: card.bank_name,
    perPt: topRedemption?.conversion_rate || 0.50,
    method: topRedemption?.method || "Points",
    image: card.image,
  };
});

// ─── Actions screen data (inline replacement) ──────────────────────────────

export const ACTIONS_DATA = COMPUTED_ALL_ACTIONS.slice(0, 7).map((a) => ({
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

// ─── Card Promo data (for Home screen) ──────────────────────────────────────

export const CARD_PROMO = {
  name: cleanCardName(marketTop?.card_name || "HDFC Diners Black"),
  image: marketTop?.card_bg_image || marketTop?.image || "",
  savings: marketYearlySavings(marketTop),
  cg_url: marketTop?.cg_network_url || "",
  spending_breakdown: marketTop?.spending_breakdown,
  milestone_benefits: marketTop?.milestone_benefits,
  welcome_benefits: marketTop?.welcomeBenefits,
  travel_benefits: marketTop?.travel_benefits,
  total_extra_benefits: marketTop?.total_extra_benefits || 0,
  annual_fee: marketTop?.annual_fees,
  fee_waiver: marketTop?.annual_fee_spends,
  product_usps: marketTop?.product_usps,
};

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
