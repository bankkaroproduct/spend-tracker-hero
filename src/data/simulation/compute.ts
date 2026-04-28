// @ts-nocheck
import { C } from "@/lib/theme";
import {
  SPEND_PROFILE, USER_CARDS, ACTUAL_CARD_USAGE,
  TOTAL_ANNUAL_SPEND, TOTAL_MONTHLY_SPEND,
  BUCKET_TO_CATEGORY, BUCKET_TO_MERCHANT, MERCHANT_ICONS,
  ANNUAL_BUCKETS, LOUNGE_BUCKETS, RESPONSE_ONLY_BUCKETS, ALL_INPUT_BUCKETS,
} from "./inputs";
import {
  calculateResponses, recommendResponse,
  getBucketSavings, getBestCardForBucket, getBestMarketCardForBucket,
  getEligibleMarketCards, getFirstEligibleMarketCard,
  getCardRewardForSpend, getBestCardForSpend,
} from "./mockApi";
import {
  Clock, Gift, CreditCard, Star, AlertTriangle, Home, Wallet, Mail,
  ShoppingBag, Apple, FileText, Plane, UtensilsCrossed, Fuel, Tv, Shield, Car, Pill,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────

function r2(n: number): number { return Math.round(n * 100) / 100; }

function getMonthlySpend(bucket: string): number {
  if (ANNUAL_BUCKETS.includes(bucket)) return (SPEND_PROFILE[bucket] || 0) / 12;
  if (LOUNGE_BUCKETS.includes(bucket)) return 0; // lounges aren't spend amounts
  return SPEND_PROFILE[bucket] || 0;
}

// Seeded LCG for deterministic randomness
let _seed = 42;
function seedRng(s: number) { _seed = s; }
function rnd(): number { _seed = (_seed * 1664525 + 1013904223) >>> 0; return _seed / 0xffffffff; }
function rndInt(min: number, max: number): number { return Math.floor(rnd() * (max - min + 1)) + min; }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = rndInt(0, i); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Spend buckets eligible for transaction generation (exclude lounges)
const TXN_BUCKETS = ALL_INPUT_BUCKETS.filter(b => !LOUNGE_BUCKETS.includes(b));

function monthsElapsedInCardYear(activationDate: string): number {
  const act = new Date(activationDate);
  const now = new Date("2026-04-26");
  const lastAnniversary = new Date(act);
  lastAnniversary.setFullYear(now.getFullYear());
  if (lastAnniversary > now) lastAnniversary.setFullYear(now.getFullYear() - 1);
  const ms = now.getTime() - lastAnniversary.getTime();
  return Math.max(1, Math.round(ms / (30.44 * 86400000)));
}

// ─── 3A. Core Savings ──────────────────────────────────────────────────────

export function computeCurrentSavings(): number {
  let total = 0;
  for (const bucket of ALL_INPUT_BUCKETS) {
    const cardIdx = ACTUAL_CARD_USAGE[bucket];
    if (cardIdx == null) continue;
    total += getBucketSavings(cardIdx, bucket);
  }
  return Math.round(total * 12);
}

export function computeOptimizedSavings(): { total: number; assignment: Record<string, number> } {
  let total = 0;
  const assignment: Record<string, number> = {};
  for (const bucket of ALL_INPUT_BUCKETS) {
    const best = getBestCardForBucket(bucket);
    assignment[bucket] = best.cardIndex;
    total += best.savings;
  }
  return { total: Math.round(total * 12), assignment };
}

export function computeUltimateSavings(): { total: number; assignment: Record<string, number | "market"> } {
  let total = 0;
  const assignment: Record<string, number | "market"> = {};
  for (const bucket of ALL_INPUT_BUCKETS) {
    const bestOwned = getBestCardForBucket(bucket);
    const bestMarket = getBestMarketCardForBucket(bucket);
    if (bestMarket.savings > bestOwned.savings) {
      assignment[bucket] = "market";
      total += bestMarket.savings;
    } else {
      assignment[bucket] = bestOwned.cardIndex;
      total += bestOwned.savings;
    }
  }
  return { total: Math.round(total * 12), assignment };
}

export function getSavingsBars() {
  const bar1 = computeCurrentSavings();
  const { total: bar2 } = computeOptimizedSavings();
  const { total: bar3 } = computeUltimateSavings();
  return {
    bar1,
    bar2,
    bar3,
    flow1_delta: Math.round(bar2 - bar1),
    flow2_delta: Math.round(bar3 - bar1),
    ultimate_uplift: Math.round(bar3 - bar2),
  };
}

// ─── 3A-bis. Combined Savings ──────────────────────────────────────────────

export function computeCombinedSavings(topN: number = 2): number {
  const marketCards = getEligibleMarketCards();
  const candidates = marketCards.slice(0, topN);

  let totalMonthly = 0;
  for (const bucket of ALL_INPUT_BUCKETS) {
    if (LOUNGE_BUCKETS.includes(bucket)) continue;

    let maxSavings = 0;
    // Check all 3 user cards
    for (let i = 0; i < calculateResponses.length; i++) {
      const s = getBucketSavings(i, bucket);
      if (s > maxSavings) maxSavings = s;
    }
    // Check market candidates
    for (const mc of candidates) {
      const s = mc?.spending_breakdown?.[bucket]?.savings || 0;
      if (s > maxSavings) maxSavings = s;
    }
    totalMonthly += maxSavings;
  }

  // Add best lounge annual value across all cards
  let bestLoungeAnnual = 0;
  for (let i = 0; i < calculateResponses.length; i++) {
    const tb = calculateResponses[i]?.travel_benefits?.total_travel_benefit_annual || 0;
    if (tb > bestLoungeAnnual) bestLoungeAnnual = tb;
  }
  for (const mc of candidates) {
    const tb = mc?.travel_benefits?.total_travel_benefit_annual || 0;
    if (tb > bestLoungeAnnual) bestLoungeAnnual = tb;
  }

  return r2(totalMonthly * 12 + bestLoungeAnnual);
}

// ─── 3C. Per-Transaction Savings Helpers ───────────────────────────────────

export function computeTxnSaved(txn: any): number {
  if (!txn.bucket) return 0;
  const cardIdx = txn.card_index ?? ACTUAL_CARD_USAGE[txn.bucket] ?? 0;
  return Math.round(getCardRewardForSpend(cardIdx, txn.amt || 0, txn.bucket, txn.brand).savings);
}

export function computeTxnMissed(txn: any): number {
  if (!txn.bucket) return 0;
  const cardIdx = txn.card_index ?? ACTUAL_CARD_USAGE[txn.bucket] ?? 0;
  const actual = getCardRewardForSpend(cardIdx, txn.amt || 0, txn.bucket, txn.brand).savings;
  const best = getBestCardForSpend(txn.amt || 0, txn.bucket, txn.brand).savings;
  const delta = best - actual;
  if (delta <= 0) return 0;
  return Math.round(delta);
}

export function computeTxnMarketDelta(txn: any): number {
  if (!txn.bucket) return 0;
  const bucketSpend = getMonthlySpend(txn.bucket);
  if (bucketSpend <= 0) return 0;
  const cardIdx = txn.card_index ?? ACTUAL_CARD_USAGE[txn.bucket] ?? 0;
  const actual = getBucketSavings(cardIdx, txn.bucket);
  const market = getBestMarketCardForBucket(txn.bucket).savings;
  const delta = market - actual;
  if (delta <= 0) return 0;
  return Math.round((txn.amt / bucketSpend) * delta);
}

// ─── 3B. Transaction Generator ─────────────────────────────────────────────

function computeTag(bucket: string, cardIdx: number, amt: number, brand: string) {
  const bestOwned = getBestCardForSpend(amt, bucket, brand);
  const bestMarket = getBestMarketCardForBucket(bucket);
  const bucketSpend = getMonthlySpend(bucket);
  const actualSavings = getCardRewardForSpend(cardIdx, amt, bucket, brand).savings;

  if (cardIdx === bestOwned.cardIndex) {
    return { t: "Best card for this brand", c: C.dkGreen, bg: "#EAF3DE" };
  }

  const ownedDelta = r2(bestOwned.savings - actualSavings);
  if (ownedDelta > 0) {
    return {
      t: "Use " + USER_CARDS[bestOwned.cardIndex].name + " — saves ₹" + Math.round(ownedDelta),
      c: C.orange,
      bg: "#FAEEDA",
    };
  }

  // Check market card uplift
  const marketDelta = bucketSpend > 0 ? r2((amt / bucketSpend) * bestMarket.savings - actualSavings) : 0;
  if (marketDelta > 5 && bestMarket.cardName) {
    return {
      t: "★ Get " + bestMarket.cardName + " & earn ₹" + Math.round(marketDelta) + " more",
      c: C.blue,
      bg: "#EEEDFE",
    };
  }

  return { t: "Best card for this brand", c: C.dkGreen, bg: "#EAF3DE" };
}

export function generateTransactions(): any[] {
  seedRng(42);
  const txns: any[] = [];
  const cardNames = ["HSBC Travel One", "Axis Flipkart Card", "HSBC Live+", "UPI"];
  const cardLast4 = ["7891", "4521", "3364", "0000"];
  const cardBanks = ["HSBC", "Axis", "HSBC", "UPI"];
  const months = ["Jan", "Feb", "Mar", "Apr"];

  // Build weighted bucket list proportional to monthly spend
  const bucketWeights: { bucket: string; weight: number }[] = [];
  let totalWeight = 0;
  for (const b of TXN_BUCKETS) {
    const ms = getMonthlySpend(b);
    if (ms <= 0) continue;
    bucketWeights.push({ bucket: b, weight: ms });
    totalWeight += ms;
  }

  // ── Curated seed transactions (i < 8) for showcasing app value ──
  // Each entry: [bucket, cardIdx, isUPI, isUnaccounted, amt, day-of-Apr]
  const SEEDS: [string, number, boolean, boolean, number, number][] = [
    ["flipkart_spends",       1, false, false, 7000,  26],  // 0: best card (green)
    ["dining_or_going_out",   0, false, false, 2500,  25],  // 1: switch to Live+
    ["rent",                  1, false, false, 20000, 24],  // 2: market card star (cardIdx≠bestOwned so market branch fires)
    ["online_food_ordering",  1, true,  false, 500,   23],  // 3: UPI (cardIdx ignored for UPI)
    ["amazon_spends",         1, false, true,  3000,  22],  // 4: unaccounted (cardIdx used for SMS template)
    ["grocery_spends_online", 0, false, false, 2000,  21],  // 5: switch to Live+
    ["hotels_annual",         1, false, false, 5000,  19],  // 6: best card (green)
    ["flights_annual",        0, false, false, 8000,  17],  // 7: switch to Axis
  ];

  // Generate 100 transactions
  for (let i = 0; i < 100; i++) {
    let isUnaccounted: boolean;
    let isUPI: boolean;
    let chosen: string;
    let amt: number;
    let monthIdx: number;
    let day: number;
    let cardIdx: number;

    if (i < 8) {
      // Curated seed transaction
      const seed = SEEDS[i];
      chosen = seed[0];
      cardIdx = seed[1];
      isUPI = seed[2];
      isUnaccounted = seed[3];
      amt = seed[4];
      day = seed[5];
      monthIdx = 3; // April
    } else {
      // Weighted random (original logic)
      isUnaccounted = i % 12 === 11;
      isUPI = !isUnaccounted && i % 33 === 0;

      // Pick bucket proportional to spend
      let roll = rnd() * totalWeight;
      chosen = bucketWeights[0].bucket;
      for (const bw of bucketWeights) {
        roll -= bw.weight;
        if (roll <= 0) { chosen = bw.bucket; break; }
      }

      const bucketSpend = getMonthlySpend(chosen);

      // Amount: randomized around average transaction size
      const avgPerTxn = bucketSpend / (3 + rnd() * 4); // ~3-7 txns per bucket per month
      amt = Math.round(Math.max(100, avgPerTxn * (0.5 + rnd())));

      // Date: spread across 4 months
      monthIdx = Math.floor(i / 25);
      day = 1 + rndInt(0, 27);
      cardIdx = ACTUAL_CARD_USAGE[chosen] ?? 0;
    }

    const bucketSpend = getMonthlySpend(chosen);
    const merchants = BUCKET_TO_MERCHANT[chosen] || ["Other"];
    const merchant = merchants[i % merchants.length];
    const icon = MERCHANT_ICONS[merchant] || "📦";
    const category = BUCKET_TO_CATEGORY[chosen] || "Other";

    const dateStr = day + " " + months[monthIdx];

    const via = isUPI ? "UPI" : cardNames[cardIdx] || cardNames[0];
    const viIdx = isUPI ? 3 : cardIdx;

    // Compute saved/missed via bucket rates
    let saved: number | null = null;
    let missed: number | null = null;

    if (!isUnaccounted && !isUPI) {
      const actualTxnSavings = getCardRewardForSpend(cardIdx, amt, chosen, merchant).savings;
      const bestOwned = getBestCardForSpend(amt, chosen, merchant);
      saved = Math.round(actualTxnSavings);
      if (bestOwned.cardIndex !== cardIdx && bestOwned.savings > actualTxnSavings) {
        missed = Math.round(bestOwned.savings - actualTxnSavings);
        if (missed <= 0) missed = null;
      }
    }
    if (isUPI) { saved = 0; missed = null; }

    // Tag
    let tag: any;
    if (isUnaccounted) {
      tag = { t: "Need more details >", c: C.dim, bg: "#eef0f3" };
    } else if (isUPI) {
      tag = { t: "Use a credit card instead", c: C.orange, bg: "#FAEEDA" };
    } else {
      tag = computeTag(chosen, cardIdx, amt, merchant);
    }

    // SMS text
    const smsTexts = [
      "HSBC Bank: INR " + amt + " spent on card ending 7891 at " + merchant + " on " + dateStr,
      "Axis Bank: Rs." + amt + " debited from card xx4521 at " + merchant + " on " + dateStr,
      "HSBC Bank: INR " + amt + " spent on card ending 3364 at " + merchant + " on " + dateStr,
      "UPI: Rs." + amt + " paid to " + merchant + " via UPI on " + dateStr + ". UPI Ref: " + rndInt(100000000, 999999999),
    ];

    txns.push({
      brand: isUnaccounted ? "Unaccounted" : merchant,
      icon: isUnaccounted ? "❓" : icon,
      amt,
      date: dateStr,
      via,
      saved: isUnaccounted ? null : saved,
      missed: isUnaccounted ? null : missed,
      tag: tag.t,
      tagColor: tag.c,
      tagBg: tag.bg,
      card: isUPI ? "UPI" : cardNames[cardIdx],
      last4: cardLast4[viIdx],
      bank: cardBanks[viIdx],
      unaccounted: isUnaccounted,
      sms: isUnaccounted ? smsTexts[viIdx] : null,
      bucket: isUnaccounted ? null : chosen,
      category: isUnaccounted ? null : category,
      card_index: isUnaccounted ? null : (isUPI ? null : cardIdx),
    });
  }

  return txns;
}

// ─── 3D. Actions Generator ─────────────────────────────────────────────────

export function generateActions(): any[] {
  const actions: any[] = [];

  // 1. HSBC Live+ shared cap hit
  const card2 = USER_CARDS[2];
  const capBuckets = card2.shared_cap?.buckets || [];
  let capTotal = 0;
  for (const b of capBuckets) capTotal += getBucketSavings(2, b);
  const capLimit = card2.shared_cap?.amount || 1000;
  if (capTotal >= capLimit * 0.9) {
    actions.push({
      Ic: AlertTriangle,
      title: "Dining/food/grocery rewards capped on HSBC Live+",
      desc: "Shared cap of ₹" + capLimit + "/mo hit — switch high spends to another card",
      badge: "Active",
      cta: "See options ›",
      type: "cap",
      altCard: "Axis Flipkart",
      altRate: 4,
      gmailRequired: false,
    });
  }

  // 2. HSBC Travel One points expiring
  const card0 = USER_CARDS[0];
  if (card0.points_expiring) {
    const pts = card0.points_expiring.amount;
    const days = card0.points_expiring.days_until;
    const worth = r2(pts * card0.conv_rate);
    actions.push({
      Ic: Clock,
      title: pts.toLocaleString("en-IN") + " points expiring soon",
      desc: "Worth ₹" + Math.round(worth) + " on " + card0.name,
      badge: "In " + days + " Days",
      cta: "Redeem ›",
      type: "points",
      gmailRequired: true,
    });
  }

  // 3. Axis Flipkart fee waiver progress
  const card1 = USER_CARDS[1];
  const card1Months = monthsElapsedInCardYear(card1.activation_date);
  let card1YTD = 0;
  for (const b of ALL_INPUT_BUCKETS) {
    if (LOUNGE_BUCKETS.includes(b)) continue;
    if (ACTUAL_CARD_USAGE[b] === 1) {
      const ms = getMonthlySpend(b);
      card1YTD += ms * card1Months;
    }
  }
  const feeThreshold1 = card1.fee_waiver_threshold;
  const remaining1 = Math.max(0, feeThreshold1 - card1YTD);
  if (remaining1 > 0) {
    actions.push({
      Ic: CreditCard,
      title: "Waive your annual fee on Axis Flipkart",
      desc: "Spend ₹" + Math.round(remaining1 / 1000) + "K more to waive " + card1.annual_fee_incl_gst,
      badge: "This Year",
      cta: "Track progress ›",
      type: "fee",
      gmailRequired: true,
    });
  }

  // 4. HSBC Travel One milestone check
  const milestone = card0.milestone_benefits[0];
  if (milestone) {
    let card0YTD = 0;
    for (const b of ALL_INPUT_BUCKETS) {
      if (LOUNGE_BUCKETS.includes(b)) continue;
      if (ACTUAL_CARD_USAGE[b] === 0) card0YTD += getMonthlySpend(b) * monthsElapsedInCardYear(card0.activation_date);
    }
    const msRemaining = Math.max(0, milestone.minSpend - card0YTD);
    if (msRemaining > 0 && msRemaining < milestone.minSpend * 0.6) {
      actions.push({
        Ic: Star,
        title: "Unlock milestone: " + milestone.reward,
        desc: "Spend ₹" + Math.round(msRemaining / 1000) + "K more on " + card0.name,
        badge: "This Year",
        cta: "Track progress ›",
        type: "milestone",
        gmailRequired: true,
      });
    }
  }

  // 5. Wasted spend on fuel (0% on all cards)
  const fuelSpend = SPEND_PROFILE.fuel || 0;
  if (fuelSpend > 0) {
    const allZero = USER_CARDS.every(c => c.zero_buckets?.includes("fuel"));
    if (allZero) {
      actions.push({
        Ic: Fuel,
        title: "₹" + (fuelSpend / 1000).toFixed(0) + "K/mo fuel earns 0% on all cards",
        desc: "Consider a fuel-focused card like BPCL SBI or IndianOil Citi",
        badge: "Ongoing",
        cta: "See options ›",
        type: "cap",
        gmailRequired: false,
      });
    }
  }

  // 6. Wasted spend on rent (0% on all cards)
  const rentSpend = SPEND_PROFILE.rent || 0;
  if (rentSpend > 0) {
    const allZeroRent = USER_CARDS.every(c => c.zero_buckets?.includes("rent"));
    if (allZeroRent) {
      actions.push({
        Ic: Home,
        title: "₹" + (rentSpend / 1000).toFixed(1) + "K/mo rent earns 0% on all cards",
        desc: "Rent payments don't earn rewards — pay via UPI to avoid surcharges",
        badge: "Ongoing",
        cta: "Learn more ›",
        type: "cap",
        gmailRequired: false,
      });
    }
  }

  // 7. HSBC Live+ fee waiver progress
  const card2Fee = USER_CARDS[2];
  let card2YTD = 0;
  for (const b of ALL_INPUT_BUCKETS) {
    if (LOUNGE_BUCKETS.includes(b)) continue;
    if (ACTUAL_CARD_USAGE[b] === 2) card2YTD += getMonthlySpend(b) * monthsElapsedInCardYear(card2Fee.activation_date);
  }
  const remaining2 = Math.max(0, card2Fee.fee_waiver_threshold - card2YTD);
  if (remaining2 > 0 && card2Fee.fee_waiver_threshold > 0) {
    actions.push({
      Ic: CreditCard,
      title: "Waive annual fee on " + card2Fee.name,
      desc: "Spend ₹" + Math.round(remaining2 / 1000) + "K more to waive " + card2Fee.annual_fee_incl_gst,
      badge: "This Year",
      cta: "Track progress ›",
      type: "fee",
      gmailRequired: true,
    });
  }

  // 8. HSBC Travel One fee waiver progress
  let card0YTDFee = 0;
  for (const b of ALL_INPUT_BUCKETS) {
    if (LOUNGE_BUCKETS.includes(b)) continue;
    if (ACTUAL_CARD_USAGE[b] === 0) card0YTDFee += getMonthlySpend(b) * monthsElapsedInCardYear(card0.activation_date);
  }
  const remaining0 = Math.max(0, card0.fee_waiver_threshold - card0YTDFee);
  if (remaining0 > 0 && card0.fee_waiver_threshold > 0) {
    actions.push({
      Ic: CreditCard,
      title: "Waive annual fee on " + card0.name,
      desc: "Spend ₹" + Math.round(remaining0 / 1000) + "K more to waive ₹" + card0.annual_fee + " fee",
      badge: "This Year",
      cta: "Track progress ›",
      type: "fee",
      gmailRequired: true,
    });
  }

  // 9. Credit utilization warning
  for (const c of USER_CARDS) {
    const util = c.credit_used / c.credit_limit;
    if (util > 0.7) {
      actions.push({
        Ic: AlertTriangle,
        title: Math.round(util * 100) + "% credit used on " + c.name,
        desc: "High utilization impacts credit score. Try to keep below 30%",
        badge: "Warning",
        cta: "View details ›",
        type: "credit-limit",
        gmailRequired: false,
      });
    }
  }

  // 10. Upgrade card suggestion from market data
  const marketCards = getEligibleMarketCards();
  const topMarket = marketCards[0];
  if (topMarket) {
    const userBestYearly = Math.max(...calculateResponses.map(r => r.total_savings_yearly));
    const marketYearly = topMarket.total_savings_yearly || 0;
    if (marketYearly > userBestYearly * 1.3) {
      actions.push({
        Ic: Star,
        title: (topMarket.card_name || "").trim() + " saves ₹" + Math.round((marketYearly - userBestYearly) / 1000) + "K more/yr",
        desc: "Based on your spend, this card outperforms all your current cards",
        badge: "Upgrade",
        cta: "Compare ›",
        type: "milestone",
        gmailRequired: false,
      });
    }
  }

  // 11. School fees earning 0%
  const schoolFees = SPEND_PROFILE.school_fees || 0;
  if (schoolFees > 0) {
    const anyEarns = USER_CARDS.some(c => !c.zero_buckets?.includes("school_fees"));
    if (!anyEarns) {
      actions.push({
        Ic: FileText,
        title: "₹" + Math.round(schoolFees / 1000) + "K/yr school fees earns 0%",
        desc: "Most cards don't reward education spends — check edu-focused options",
        badge: "Ongoing",
        cta: "Learn more ›",
        type: "cap",
        gmailRequired: false,
      });
    }
  }

  return actions;
}

const _allActions = generateActions();
export const ACTIONS = _allActions.slice(0, 3);
export const ALL_ACTIONS = _allActions;
export const SMS_ACTIONS = [
  { Ic: Mail, title: "Connect Gmail to see expiring points", desc: "We can't detect point balances from SMS alone", badge: "Action Needed", cta: "Connect ›", type: "nudge", gmailRequired: false },
  { Ic: Mail, title: "Unlock unclaimed benefits", desc: "Connect Gmail to see vouchers & rewards waiting for you", badge: "Action Needed", cta: "Connect ›", type: "nudge", gmailRequired: false },
];

// ─── 3E. Category / Brand Breakdowns ───────────────────────────────────────

const CAT_ICON_MAP: Record<string, any> = {
  "Shopping": ShoppingBag,
  "Groceries": Apple,
  "Food & Dining": UtensilsCrossed,
  "Bills & Utilities": FileText,
  "Travel": Plane,
  "Fuel": Fuel,
  "Insurance": Shield,
  "Rent": Home,
  "Education": FileText,
  "Entertainment": Tv,
  "Cab Rides": Car,
  "Health & Wellness": Pill,
};

const CAT_COLOR_MAP: Record<string, string> = {
  "Shopping": "#3b82f6",
  "Groceries": "#22c55e",
  "Food & Dining": "#ef4444",
  "Bills & Utilities": "#8b5cf6",
  "Travel": "#f59e0b",
  "Fuel": "#f97316",
  "Insurance": "#6366f1",
  "Rent": "#1a1a2e",
  "Education": "#0284c7",
  "Entertainment": "#06b6d4",
  "Cab Rides": "#ec4899",
  "Health & Wellness": "#14b8a6",
};

export function computeSpendCategories(): any[] {
  const catMap: Record<string, number> = {};
  const txnCount: Record<string, number> = {};
  for (const [bucket, val] of Object.entries(SPEND_PROFILE)) {
    if (LOUNGE_BUCKETS.includes(bucket) || RESPONSE_ONLY_BUCKETS.includes(bucket)) continue;
    if (!val || val <= 0) continue;
    const cat = BUCKET_TO_CATEGORY[bucket];
    if (!cat) continue;
    const annual = ANNUAL_BUCKETS.includes(bucket) ? val : val * 12;
    catMap[cat] = (catMap[cat] || 0) + annual;
    txnCount[cat] = (txnCount[cat] || 0) + (ANNUAL_BUCKETS.includes(bucket) ? 2 : 12);
  }
  return Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amt]) => ({
      name,
      amt: Math.round(amt),
      txns: txnCount[name] || 0,
      Ic: CAT_ICON_MAP[name] || FileText,
      color: CAT_COLOR_MAP[name] || "#6b7280",
    }));
}

export function computeSpendBrands(): any[] {
  const brandMap: Record<string, number> = {};
  const brandTxns: Record<string, number> = {};
  const brandMeta: Record<string, { icon: string; color: string }> = {};
  for (const [bucket, val] of Object.entries(SPEND_PROFILE)) {
    if (LOUNGE_BUCKETS.includes(bucket) || RESPONSE_ONLY_BUCKETS.includes(bucket)) continue;
    if (!val || val <= 0) continue;
    const merchants = BUCKET_TO_MERCHANT[bucket];
    if (!merchants || merchants.length === 0) continue;
    const cat = BUCKET_TO_CATEGORY[bucket] || "Other";
    const annual = ANNUAL_BUCKETS.includes(bucket) ? val : val * 12;
    const perMerchant = annual / merchants.length;
    for (const m of merchants) {
      brandMap[m] = (brandMap[m] || 0) + perMerchant;
      brandTxns[m] = (brandTxns[m] || 0) + (ANNUAL_BUCKETS.includes(bucket) ? 1 : 6);
      if (!brandMeta[m]) {
        brandMeta[m] = { icon: MERCHANT_ICONS[m] || "📦", color: CAT_COLOR_MAP[cat] || "#6b7280" };
      }
    }
  }
  return Object.entries(brandMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amt]) => ({
      name,
      amt: Math.round(amt),
      txns: brandTxns[name] || 0,
      icon: brandMeta[name]?.icon || "📦",
      color: brandMeta[name]?.color || "#6b7280",
    }));
}

// ─── 3F. Card Quality ──────────────────────────────────────────────────────

export function computeCardQuality(cardIndex: number): string {
  const cardYearly = calculateResponses[cardIndex]?.total_savings_yearly || 0;
  const marketCards = recommendResponse?.savings || [];
  let bestMarketYearly = 0;
  for (const mc of marketCards) {
    const y = mc?.total_savings_yearly || 0;
    if (y > bestMarketYearly) bestMarketYearly = y;
  }
  if (bestMarketYearly <= 0) return "Good"; // fallback if no market data
  const ratio = cardYearly / bestMarketYearly;
  if (ratio >= 0.8) return "Great";
  if (ratio >= 0.5) return "Good";
  if (ratio >= 0.3) return "Average";
  return "Below Average";
}

// ─── 3G. Match Score ───────────────────────────────────────────────────────

export function computeMatchScore(marketCardIndex: number): number {
  const marketCards = recommendResponse?.savings || [];
  const mc = marketCards[marketCardIndex];
  if (!mc) return 0;

  // Top 5 buckets by spend (excluding lounge)
  const bucketsBySpend = TXN_BUCKETS
    .map(b => ({ bucket: b, spend: getMonthlySpend(b) }))
    .filter(b => b.spend > 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  let marketSum = 0;
  let bestSum = 0;

  for (const { bucket } of bucketsBySpend) {
    const mSavings = mc.spending_breakdown?.[bucket]?.savings || 0;
    marketSum += mSavings;

    // Best possible = max across all user cards + all market cards
    let bestForBucket = 0;
    for (let i = 0; i < calculateResponses.length; i++) {
      const s = getBucketSavings(i, bucket);
      if (s > bestForBucket) bestForBucket = s;
    }
    for (const omc of marketCards) {
      const s = omc?.spending_breakdown?.[bucket]?.savings || 0;
      if (s > bestForBucket) bestForBucket = s;
    }
    bestSum += bestForBucket;
  }

  if (bestSum <= 0) return 0;
  return Math.round((marketSum / bestSum) * 100);
}

// ─── 3H. Spend Distribution ────────────────────────────────────────────────

export function computeSpendDistribution(includeUltimate: boolean): any[] {
  const assignment = includeUltimate
    ? computeUltimateSavings().assignment
    : computeOptimizedSavings().assignment;

  // Accumulate per-card spend/savings
  const cardMap: Record<string, { spend: number; savings: number; categories: Set<string> }> = {};
  const eligibleCards = getEligibleMarketCards();
  const marketName = eligibleCards[0]?.card_name || "Recommended Card";
  const marketColor = "#111827";

  for (const bucket of TXN_BUCKETS) {
    const ms = getMonthlySpend(bucket);
    if (ms <= 0) continue;
    const cat = BUCKET_TO_CATEGORY[bucket] || "Other";
    const a = assignment[bucket];

    let key: string;
    let savings: number;

    if (a === "market") {
      key = marketName;
      savings = getBestMarketCardForBucket(bucket).savings;
    } else {
      const ci = typeof a === "number" ? a : 0;
      key = USER_CARDS[ci].name;
      savings = getBucketSavings(ci, bucket);
    }

    if (!cardMap[key]) cardMap[key] = { spend: 0, savings: 0, categories: new Set() };
    cardMap[key].spend += ms * 12;
    cardMap[key].savings += savings * 12;
    cardMap[key].categories.add(cat);
  }

  const totalSpend = Object.values(cardMap).reduce((s, v) => s + v.spend, 0);

  return Object.entries(cardMap)
    .sort(([, a], [, b]) => b.spend - a.spend)
    .map(([name, d]) => {
      const card = USER_CARDS.find(c => c.name === name);
      return {
        name,
        color: card ? card.color : marketColor,
        pct: totalSpend > 0 ? Math.round((d.spend / totalSpend) * 100) : 0,
        spend: Math.round(d.spend),
        savings: Math.round(d.savings),
        categories: [...d.categories],
      };
    });
}

// ─── 3I. Per-Card Detail Data ──────────────────────────────────────────────

export function computeCardDetail(cardIndex: number): any {
  const card = USER_CARDS[cardIndex];
  const resp = calculateResponses[cardIndex];
  const txns = generateTransactions().filter(t => t.card_index === cardIndex);

  // Totals
  const totalSpend = txns.reduce((s, t) => s + t.amt, 0);
  const totalSaved = txns.reduce((s, t) => s + (t.saved || 0), 0);
  const totalMissed = txns.reduce((s, t) => s + (t.missed || 0), 0);

  // Brands — top 20 by spend
  const brandMap: Record<string, { spend: number; saved: number; icon: string }> = {};
  for (const t of txns) {
    if (!brandMap[t.brand]) brandMap[t.brand] = { spend: 0, saved: 0, icon: t.icon };
    brandMap[t.brand].spend += t.amt;
    brandMap[t.brand].saved += t.saved || 0;
  }
  const brands = Object.entries(brandMap)
    .sort(([, a], [, b]) => b.spend - a.spend)
    .slice(0, 20)
    .map(([name, d]) => ({ name, icon: d.icon, spend: Math.round(d.spend), saved: Math.round(d.saved) }));

  // Categories
  const catMap: Record<string, { spend: number; saved: number; icon: string }> = {};
  for (const t of txns) {
    const cat = t.category || "Other";
    const ic = MERCHANT_ICONS[t.brand] || "📦";
    if (!catMap[cat]) catMap[cat] = { spend: 0, saved: 0, icon: ic };
    catMap[cat].spend += t.amt;
    catMap[cat].saved += t.saved || 0;
  }
  const CAT_ALIASES = { "Groceries": "Essentials", "Entertainment": "Leisure" };
  const categories = Object.entries(catMap)
    .sort(([, a], [, b]) => b.spend - a.spend)
    .map(([name, d]) => ({ name, icon: d.icon, spend: Math.round(d.spend), saved: Math.round(d.saved), ...(CAT_ALIASES[name] ? { cat: CAT_ALIASES[name] } : {}) }));

  // Actions for this card
  const cardActions = _allActions.filter(a => {
    const titleLower = (a.title + " " + a.desc).toLowerCase();
    return titleLower.includes(card.name.toLowerCase());
  });

  // Welcome status — check activation date vs today (2026-04-26)
  const activationDate = new Date(card.activation_date);
  const now = new Date("2026-04-26");
  const daysSinceActivation = Math.floor((now.getTime() - activationDate.getTime()) / 86400000);
  const welcomeStatus = daysSinceActivation <= (card.welcome_benefits.maximum_days || 30) ? "Pending" : "Claimed";

  // Milestone progress
  const cardYTDSpend = totalSpend * 3; // extrapolate 4mo txns to full year estimate
  const milestones = (card.milestone_benefits || []).map(m => {
    const pctDone = Math.min(100, (cardYTDSpend / m.minSpend) * 100);
    const remaining = Math.max(0, m.minSpend - cardYTDSpend);
    const daysLeft = remaining > 0 ? Math.round(remaining / (totalSpend / 120)) : 0;
    return {
      title: m.reward,
      desc: "on spends of ₹" + m.minSpend.toLocaleString("en-IN") + " on this card in a year",
      status: pctDone >= 100 ? "Claimed" : "Yet to claim",
      expiry: pctDone < 100 ? daysLeft + " days" : undefined,
      progress: Math.round(pctDone),
      remaining: Math.round(remaining),
    };
  });

  // Lounge
  const loungeInfo: any[] = [];
  if (card.lounge_access.domestic_annual > 0) {
    loungeInfo.push({
      title: card.lounge_access.domestic_annual + " free domestic airport lounge visits per year",
      desc: card.lounge_used.domestic + " of " + card.lounge_access.domestic_annual + " used",
      icon: "✈️",
    });
  }
  if (card.lounge_access.international_annual > 0) {
    loungeInfo.push({
      title: card.lounge_access.international_annual + " free international lounge visits per year",
      desc: card.lounge_used.international + " of " + card.lounge_access.international_annual + " used",
      icon: "🌍",
    });
  }
  if (loungeInfo.length === 0) {
    loungeInfo.push({ title: "No lounge access on this card", desc: "Not available", icon: "🚫" });
  }

  // Credit limits
  const limits = {
    creditUsed: card.credit_used,
    creditTotal: card.credit_limit,
    caps: [] as any[],
  };

  const capMerge: Record<string, { used: number; total: number }> = {};
  const sharedBuckets = card.shared_cap?.buckets || [];
  if (sharedBuckets.length > 0 && card.shared_cap?.amount) {
    let sharedUsed = 0;
    for (const b of sharedBuckets) {
      const bd = resp?.spending_breakdown?.[b];
      if (bd) sharedUsed += bd.savings || 0;
    }
    const catNames = [...new Set(sharedBuckets.map(b => BUCKET_TO_CATEGORY[b] || b))];
    limits.caps.push({
      name: catNames.join(" + ") + " (shared cap)",
      used: Math.round(sharedUsed),
      total: card.shared_cap.amount,
    });
  }
  for (const bucket of ALL_INPUT_BUCKETS) {
    if (sharedBuckets.includes(bucket)) continue;
    const bd = resp?.spending_breakdown?.[bucket];
    if (bd && typeof bd.maxCap === "number" && bd.maxCap > 0) {
      const capName = (BUCKET_TO_CATEGORY[bucket] || bucket) + " spends";
      if (capMerge[capName]) {
        capMerge[capName].used += Math.round(bd.savings);
      } else {
        capMerge[capName] = { used: Math.round(bd.savings), total: bd.maxCap };
      }
    }
  }
  for (const [name, v] of Object.entries(capMerge)) {
    limits.caps.push({ name, used: v.used, total: v.total });
  }

  // Fee waiver status
  let feeSpentYTD = 0;
  for (const b of ALL_INPUT_BUCKETS) {
    if (LOUNGE_BUCKETS.includes(b)) continue;
    if (ACTUAL_CARD_USAGE[b] === cardIndex) feeSpentYTD += getMonthlySpend(b) * monthsElapsedInCardYear(card.activation_date);
  }
  const feeWaiverPct = card.fee_waiver_threshold > 0
    ? Math.min(100, Math.round((feeSpentYTD / card.fee_waiver_threshold) * 100))
    : 100;
  const feeWaived = feeWaiverPct >= 100;

  // Best market card for comparison
  const marketCards = recommendResponse?.savings || [];
  const bestMarket = marketCards[0];

  return {
    advice: card.name + " — optimize usage to maximize savings across your portfolio",
    adviceCta: "See how to optimize",
    saved: Math.round(totalSaved),
    potential: Math.round(resp?.total_savings_yearly || 0),
    bestCard: bestMarket?.card_name || "HDFC Diners Black",
    bestSaved: Math.round(bestMarket?.total_savings_yearly || 0),
    actions: cardActions.slice(0, 2),
    brands,
    categories,
    txns,
    totalSpend: Math.round(totalSpend),
    totalSaved: Math.round(totalSaved),
    totalMissed: Math.round(totalMissed),
    welcome: {
      title: card.welcome_benefits.description,
      desc: "Within " + card.welcome_benefits.maximum_days + " days of activation",
      status: welcomeStatus,
    },
    milestones,
    lounge: loungeInfo,
    limits,
    fees: {
      annual: card.annual_fee_incl_gst,
      annualWaiver: "Spend ₹" + (card.fee_waiver_threshold / 100000).toFixed(1) + "L or more to waive next year's fee",
      annualStatus: feeWaived ? "Waived" : Math.round(feeWaiverPct) + "% there",
      joining: card.joining_fee,
      joiningNote: "Fee waived for first year",
    },
  };
}

// ─── 3J. Optimize Brands ──────────────────────────────────────────────────

export function computeOptBrands(): any[] {
  const results: any[] = [];

  // Iterate over meaningful buckets (skip lounge, school_fees with 0 spend)
  for (const bucket of TXN_BUCKETS) {
    const ms = getMonthlySpend(bucket);
    if (ms <= 0) continue;

    const merchants = BUCKET_TO_MERCHANT[bucket] || [];
    if (merchants.length === 0) continue;

    // Use primary merchant as brand representative
    const brand = merchants[0];
    const icon = MERCHANT_ICONS[brand] || "📦";
    const cat = BUCKET_TO_CATEGORY[bucket] || "Other";

    // Find best card for this bucket
    const bestOwned = getBestCardForBucket(bucket);
    const bestRate = ms > 0 ? r2((bestOwned.savings / ms) * 100) : 0;
    const bestSaved = Math.round(bestOwned.savings * 12);

    // Alt card: second best
    let altIdx = -1;
    let altSavings = 0;
    for (let i = 0; i < calculateResponses.length; i++) {
      if (i === bestOwned.cardIndex) continue;
      const s = getBucketSavings(i, bucket);
      if (s > altSavings) { altIdx = i; altSavings = s; }
    }
    const altRate = ms > 0 && altIdx >= 0 ? r2((altSavings / ms) * 100) : 0;

    // Current saved (what user actually earns)
    const actualIdx = ACTUAL_CARD_USAGE[bucket] ?? 0;
    const actualSavings = getBucketSavings(actualIdx, bucket);
    const currentSaved = Math.round(actualSavings * 12);

    // Breakdown: allocate all to best card
    const breakdown = [{
      card: USER_CARDS[bestOwned.cardIndex].name,
      pct: 100,
      spend: Math.round(ms * 12),
      saved: bestSaved,
    }];

    // Cap info
    const bd = calculateResponses[bestOwned.cardIndex]?.spending_breakdown?.[bucket];
    const capInfo = bd?.maxCapReached
      ? "₹" + (typeof bd.maxCap === "number" ? bd.maxCap : 0) + "/month cap reached"
      : undefined;

    results.push({
      name: brand,
      icon,
      cat,
      totalSpend: Math.round(ms * 12),
      saved: currentSaved,
      bestCard: USER_CARDS[bestOwned.cardIndex].name,
      bestRate: r2(bestRate),
      bestSaved,
      altCard: altIdx >= 0 ? USER_CARDS[altIdx].name : USER_CARDS[(bestOwned.cardIndex + 1) % USER_CARDS.length].name,
      altRate: r2(altRate),
      txnCount: Math.round(ms / 1500), // approximate
      capInfo,
      breakdown,
    });
  }

  return results.sort((a, b) => b.totalSpend - a.totalSpend);
}
