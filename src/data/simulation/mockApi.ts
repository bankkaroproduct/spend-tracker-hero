// @ts-nocheck
import {
  SPEND_PROFILE, USER_CARDS, ANNUAL_BUCKETS, LOUNGE_BUCKETS,
  LOUNGE_REFERENCE, RESPONSE_ONLY_BUCKETS, ALL_INPUT_BUCKETS,
} from './inputs';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMonthlySpend(bucket: string): number {
  if (ANNUAL_BUCKETS.includes(bucket)) return (SPEND_PROFILE[bucket] || 0) / 12;
  if (LOUNGE_BUCKETS.includes(bucket)) return SPEND_PROFILE[bucket] || 0;
  return SPEND_PROFILE[bucket] || 0;
}

function rateKey(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function merchantKeys(merchant?: string): string[] {
  const key = rateKey(merchant || "");
  if (!key) return [];
  return [key, key.replace(/_/g, ""), key.replace(/_/g, "-")];
}

export function getRewardRate(card: any, bucket: string, merchant?: string): number {
  if (card.zero_buckets?.includes(bucket)) return 0;
  if (LOUNGE_BUCKETS.includes(bucket)) return 0;
  if (SPEND_PROFILE[bucket] === 0 && !ANNUAL_BUCKETS.includes(bucket)) return 0;

  if (card.index === 0) {
    // Points card: use rp_per_100 presence to decide eligibility (exclusions still handled by zero_buckets).
    const rpPer = (card.rp_per_100 && typeof card.rp_per_100[bucket] === "number")
      ? card.rp_per_100[bucket]
      : card.rp_per_100?.default;
    return rpPer > 0 ? 1 : 0;
  }

  if (card.index === 1) {
    for (const key of merchantKeys(merchant)) {
      if (typeof card.reward_rates?.[key] === "number") return card.reward_rates[key];
    }
    if (typeof card.reward_rates?.[bucket] === "number") return card.reward_rates[bucket];
    return card.reward_rates.default;
  }

  if (card.index === 2) {
    return card.shared_cap?.buckets.includes(bucket)
      ? card.reward_rates.accelerated
      : card.reward_rates.default;
  }

  return 0;
}

function getRewardCap(card: any, bucket: string, merchant?: string): number | string {
  for (const key of merchantKeys(merchant)) {
    if (typeof card.bucket_caps?.[key] === "number") return card.bucket_caps[key];
  }
  if (typeof card.bucket_caps?.[bucket] === "number") return card.bucket_caps[bucket];
  if (card.savings_type === "points" && typeof card.travel_rp_cap_monthly === "number" && (bucket === "flights_annual" || bucket === "hotels_annual")) {
    return r2(card.travel_rp_cap_monthly * card.conv_rate);
  }
  if (card.shared_cap?.buckets?.includes(bucket)) return card.shared_cap.amount;
  return "Unlimited";
}

export function getCardRewardForSpend(cardIndex: number, amount: number, bucket: string, merchant?: string) {
  const card = USER_CARDS[cardIndex];
  if (!card || !bucket || amount <= 0) {
    return { savings: 0, points_earned: 0, rate: 0, maxCap: "Unlimited", maxCapReached: false };
  }

  const rate = getRewardRate(card, bucket, merchant);
  let savings = amount * rate;
  let pointsEarned = 0;
  let maxCap = getRewardCap(card, bucket, merchant);
  let maxCapReached = false;

  if (card.savings_type === "points" && rate > 0) {
    const rpPer = (card.rp_per_100 && typeof card.rp_per_100[bucket] === "number")
      ? card.rp_per_100[bucket]
      : card.rp_per_100.default;
    pointsEarned = (amount / card.spend_conversion) * rpPer;
    savings = pointsEarned * card.conv_rate;
  }

  if (typeof maxCap === "number" && savings > maxCap) {
    savings = maxCap;
    maxCapReached = true;
    if (card.savings_type === "points") pointsEarned = savings / card.conv_rate;
  }

  return {
    savings: r2(savings),
    points_earned: r2(pointsEarned),
    rate: amount > 0 ? r2((savings / amount) * 100) : 0,
    maxCap,
    maxCapReached,
  };
}

export function getBestCardForSpend(amount: number, bucket: string, merchant?: string): { cardIndex: number; savings: number } {
  let best = { cardIndex: 0, savings: 0 };
  for (let i = 0; i < USER_CARDS.length; i++) {
    const s = getCardRewardForSpend(i, amount, bucket, merchant).savings;
    if (s > best.savings) best = { cardIndex: i, savings: s };
  }
  return best;
}

function r2(n: number): number { return Math.round(n * 100) / 100; }

function fmtINR(n: number): string {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return "₹" + n;
}

function buildExplanation(card: any, bucket: string, spend: number, savings: number, pointsEarned: number) {
  if (spend === 0) return [];
  const mo = fmtINR(Math.round(spend));
  const yr = fmtINR(Math.round(spend * 12));
  if (card.savings_type === "points") {
    const rpMo = Math.round(pointsEarned);
    const rpYr = Math.round(pointsEarned * 12);
    const rpPer = (card.rp_per_100 && typeof card.rp_per_100[bucket] === "number")
      ? card.rp_per_100[bucket]
      : card.rp_per_100.default;
    return [
      { key: "monthly", explanation: `<div>On monthly spend of ${mo} on <b>eligible brands</b> you get ${rpPer} RP for every ₹${card.spend_conversion}, so you will receive <b>${rpMo.toLocaleString("en-IN")} RP</b>.</div>` },
      { key: "annual", explanation: `<div>On yearly spend of ${yr} on <b>eligible brands</b> you get ${rpPer} RP for every ₹${card.spend_conversion}, so you will receive <b>${rpYr.toLocaleString("en-IN")} RP</b>.</div>` },
    ];
  }
  const pct = (savings / (spend || 1) * 100).toFixed(1).replace(/\.0$/, "");
  return [
    { key: "monthly", explanation: `<div>On monthly spend of ${mo} you earn <b>${pct}% cashback = ${fmtINR(Math.round(savings))}</b>.</div>` },
    { key: "annual", explanation: `<div>On yearly spend of ${yr} you earn <b>${pct}% cashback = ${fmtINR(Math.round(savings * 12))}</b>.</div>` },
  ];
}

// ─── Build /calculate response for one user card ────────────────────────────

function buildCalculateResponse(cardIndex: number) {
  const card = USER_CARDS[cardIndex];
  const breakdown: Record<string, any> = {};

  // 1. Compute raw savings per input bucket (excluding lounge)
  for (const bucket of ALL_INPUT_BUCKETS) {
    if (LOUNGE_BUCKETS.includes(bucket)) continue;

    const spend = getMonthlySpend(bucket);
    const rate = getRewardRate(card, bucket);
    let savings = spend * rate;
    let pointsEarned = 0;
    let maxCap: number | string = "Unlimited";
    const totalMaxCap: number | string = "Unlimited";
    let maxCapReached = false;

    if (card.savings_type === "points" && rate > 0) {
      const rpPer = (card.rp_per_100 && typeof card.rp_per_100[bucket] === "number")
        ? card.rp_per_100[bucket]
        : card.rp_per_100.default;
      pointsEarned = (spend / card.spend_conversion) * rpPer;
      savings = pointsEarned * card.conv_rate;

      // Monthly RP caps for Travel One (flights/hotels): clamp points, surface cap as ₹ equivalent.
      if (typeof card.travel_rp_cap_monthly === "number" && (bucket === "flights_annual" || bucket === "hotels_annual")) {
        const rpCap = card.travel_rp_cap_monthly;
        if (pointsEarned > rpCap) {
          pointsEarned = rpCap;
          savings = pointsEarned * card.conv_rate;
          maxCap = r2(rpCap * card.conv_rate);
          maxCapReached = true;
        } else {
          maxCap = r2(rpCap * card.conv_rate);
        }
      }
    }

    // Per-bucket caps (Axis Flipkart quarterly caps → monthly)
    if (card.bucket_caps?.[bucket]) {
      maxCap = card.bucket_caps[bucket];
      if (savings > maxCap) {
        savings = maxCap;
        maxCapReached = true;
        if (card.savings_type === "points") pointsEarned = savings / card.conv_rate;
      }
    }

    breakdown[bucket] = {
      on: bucket,
      spend: r2(spend),
      savings: r2(savings),
      savings_type: card.savings_type,
      points_earned: r2(pointsEarned),
      maxCap,
      totalMaxCap,
      maxCapReached,
      explanation: buildExplanation(card, bucket, spend, savings, pointsEarned),
      conv_rate: card.conv_rate,
      spend_conversion: card.spend_conversion || 0,
    };
  }

  // 2. Apply shared cap (HSBC Live+)
  if (card.shared_cap) {
    const capBuckets = card.shared_cap.buckets;
    const totalUncapped = capBuckets.reduce((s, b) => s + (breakdown[b]?.savings || 0), 0);

    if (totalUncapped > card.shared_cap.amount) {
      for (const b of capBuckets) {
        if (!breakdown[b]) continue;
        const proportion = breakdown[b].savings / totalUncapped;
        breakdown[b].savings = r2(card.shared_cap.amount * proportion);
        breakdown[b].maxCap = card.shared_cap.amount;
        breakdown[b].maxCapReached = true;
        breakdown[b].explanation = buildExplanation(
          card, b, breakdown[b].spend, breakdown[b].savings, 0
        );
      }
    }
  }

  // 3. Lounge buckets
  const domVisitsYearly = Math.min(
    (SPEND_PROFILE.domestic_lounge_usage_quarterly || 0) * 4,
    card.lounge_access.domestic_annual
  );
  const intlVisitsYearly = Math.min(
    (SPEND_PROFILE.international_lounge_usage_quarterly || 0) * 4,
    card.lounge_access.international_annual
  );
  const domLoungeAnnual = domVisitsYearly * LOUNGE_REFERENCE.domestic_per_visit;
  const intlLoungeAnnual = intlVisitsYearly * LOUNGE_REFERENCE.international_per_visit;
  const totalTravelBenefitAnnual = domLoungeAnnual + intlLoungeAnnual;

  breakdown.domestic_lounge_usage_quarterly = {
    on: "domestic_lounge_usage_quarterly",
    spend: SPEND_PROFILE.domestic_lounge_usage_quarterly || 0,
    savings: r2(domLoungeAnnual / 12),
    savings_type: "cashback",
    points_earned: 0,
    maxCap: "Unlimited",
    totalMaxCap: "Unlimited",
    maxCapReached: false,
    explanation: domVisitsYearly > 0 ? [
      { key: "monthly", explanation: `<div>You get ${(SPEND_PROFILE.domestic_lounge_usage_quarterly || 0)} lounge visits per quarter, worth ${fmtINR(r2(domLoungeAnnual / 12))} monthly.</div>` },
      { key: "annual", explanation: `<div>You get ${domVisitsYearly} lounge visits per year, worth ${fmtINR(domLoungeAnnual)} annually.</div>` },
    ] : [],
    conv_rate: 0,
    spend_conversion: 0,
  };

  breakdown.international_lounge_usage_quarterly = {
    on: "international_lounge_usage_quarterly",
    spend: SPEND_PROFILE.international_lounge_usage_quarterly || 0,
    savings: r2(intlLoungeAnnual / 12),
    savings_type: "cashback",
    points_earned: 0,
    maxCap: "Unlimited",
    totalMaxCap: "Unlimited",
    maxCapReached: false,
    explanation: intlVisitsYearly > 0 ? [
      { key: "monthly", explanation: `<div>You get ${(SPEND_PROFILE.international_lounge_usage_quarterly || 0)} lounge visits per quarter, worth ${fmtINR(r2(intlLoungeAnnual / 12))} monthly.</div>` },
      { key: "annual", explanation: `<div>You get ${intlVisitsYearly} lounge visits per year, worth ${fmtINR(intlLoungeAnnual)} annually.</div>` },
    ] : [],
    conv_rate: 0,
    spend_conversion: 0,
  };

  // 4. Response-only buckets (spend=0, savings=0)
  for (const bucket of RESPONSE_ONLY_BUCKETS) {
    breakdown[bucket] = {
      on: bucket, spend: 0, savings: 0,
      savings_type: card.savings_type, points_earned: 0,
      maxCap: "Unlimited", totalMaxCap: "Unlimited",
      maxCapReached: false, explanation: [],
      conv_rate: card.conv_rate, spend_conversion: card.spend_conversion || 0,
    };
  }

  // 5. Totals
  const totalSavingsMonthly = Object.values(breakdown).reduce((s: number, b: any) => s + b.savings, 0);
  const totalSavingsYearly = r2(totalSavingsMonthly * 12);
  const totalExtraBenefits = (card.milestone_benefits || []).reduce((s, m) => s + (m.value || 0), 0);

  return {
    card_name: card.name,
    card_alias: card.card_alias,
    bank_name: card.bank,
    card_type: card.card_type,
    image: card.image,
    total_savings: r2(totalSavingsMonthly),
    total_savings_yearly: totalSavingsYearly,
    total_extra_benefits: totalExtraBenefits,
    roi: r2(totalSavingsYearly + totalExtraBenefits + totalTravelBenefitAnnual),
    annual_fees: String(Math.round(card.annual_fee * 1.18)),
    annual_fee_without_gst: String(card.annual_fee),
    annual_fee_spends: String(card.fee_waiver_threshold),
    annual_fee_waiver_toggle: card.fee_waiver_threshold > 0 ? 1 : 0,
    annual_fee_text: String(card.annual_fee),
    card_max_cap: null,
    travel_benefits: {
      domestic_lounge_benefits_annual: domLoungeAnnual,
      international_lounge_benefits_annual: intlLoungeAnnual,
      railway_lounge_beneftis_annual: 0,
      domestic_lounges_unlocked: card.lounge_access.domestic_annual,
      international_lounges_unlocked: card.lounge_access.international_annual,
      railway_lounges_unlocked: 0,
      total_travel_benefit_annual: totalTravelBenefitAnnual,
    },
    milestone_benefits: (card.milestone_benefits || []).map((m) => ({
      minSpend: String(m.minSpend),
      maxDays: "365",
      rpBonus: card.savings_type === "points" ? String(m.value / card.conv_rate) : "",
      voucherBonus: card.savings_type === "cashback" ? String(m.value) : "",
      brand: "",
      cash_conversion: String(card.conv_rate),
      eligible: true,
    })),
    welcomeBenefits: [{
      brands: [],
      voucher_bonus: card.welcome_benefits.description,
      cash_value: 0,
      maximum_days: String(card.welcome_benefits.maximum_days),
      minimum_spend: String(card.welcome_benefits.minimum_spend),
    }],
    spending_breakdown: breakdown,
  };
}

// ─── Pre-computed responses ─────────────────────────────────────────────────

export const calculateResponses = USER_CARDS.map((_, i) => buildCalculateResponse(i));

// ─── /recommend_cards response ──────────────────────────────────────────────
// Uses data from `data/api response pretty.json` (HDFC Diners Black + Axis Magnus)
// supplemented with MCP-extracted data for additional cards.
// When wiring real API, replace this import with a live fetch.

import { RECOMMEND_CARDS_DATA } from './recommendData';

export const recommendResponse = RECOMMEND_CARDS_DATA;

// ─── Convenience accessors ──────────────────────────────────────────────────

export function getCalculateResponse(cardIndex: number) {
  return calculateResponses[cardIndex];
}

export function getBucketSavings(cardIndex: number, bucket: string): number {
  return calculateResponses[cardIndex]?.spending_breakdown?.[bucket]?.savings || 0;
}

export function getBestCardForBucket(bucket: string): { cardIndex: number; savings: number } {
  let best = { cardIndex: 0, savings: 0 };
  for (let i = 0; i < calculateResponses.length; i++) {
    const s = getBucketSavings(i, bucket);
    if (s > best.savings) best = { cardIndex: i, savings: s };
  }
  return best;
}

// Static allowlist — replace with API data when invite_only field becomes available
const INVITE_ONLY_ALIASES = ["magnus-burgundy-credit-card", "hdfc-infinia-credit-card"];

export function isInviteOnlyMarketCard(card: any): boolean {
  const alias = String(card?.card_alias || "").toLowerCase();
  return Boolean(card?.invite_only) || INVITE_ONLY_ALIASES.some(a => alias.includes(a));
}

// Normalize a card name for cross-source comparison
// (strips "credit card" suffix, punctuation, collapses whitespace)
function _normCardName(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/credit\s*card/g, "")
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}

export function isAlreadyOwnedMarketCard(card: any): boolean {
  const alias = String(card?.card_alias || "").toLowerCase();
  if (alias && USER_CARDS.some(uc => uc.card_alias === alias)) return true;
  const candidates = [card?.card_name, card?.card_alias].map(_normCardName).filter(Boolean);
  if (!candidates.length) return false;
  return USER_CARDS.some(uc => {
    const owned = _normCardName(uc.name);
    return candidates.some(c => c === owned || c.includes(owned) || owned.includes(c));
  });
}

export function getOwnedCardIndex(card: any): number {
  const alias = String(card?.card_alias || "").toLowerCase();
  if (alias) {
    const idx = USER_CARDS.findIndex(uc => uc.card_alias === alias);
    if (idx >= 0) return idx;
  }
  return -1;
}

export function getEligibleMarketCards() {
  const all = recommendResponse?.savings || [];
  const eligible = all
    .filter(c => !isInviteOnlyMarketCard(c))
    .filter(c => !isAlreadyOwnedMarketCard(c));
  if (typeof window !== "undefined" && import.meta.env?.DEV && window.localStorage?.getItem("sa:debugMockApi") === "true") {
    console.log("[mockApi] Total cards:", all.length, "| Eligible:", eligible.length, "| First eligible:", eligible[0]?.card_name);
  }
  return eligible;
}

export function getFirstEligibleMarketCard() {
  return getEligibleMarketCards()[0] || recommendResponse?.savings?.[0];
}

export function getBestMarketCardForBucket(bucket: string): { cardIndex: number; savings: number; cardName: string } {
  const cards = getEligibleMarketCards();
  let best = { cardIndex: 0, savings: 0, cardName: cards[0]?.card_name || "" };
  for (let i = 0; i < cards.length; i++) {
    const s = cards[i]?.spending_breakdown?.[bucket]?.savings || 0;
    if (s > best.savings) best = { cardIndex: i, savings: s, cardName: cards[i].card_name };
  }
  return best;
}
