// @ts-nocheck
import {
  SPEND_PROFILE,
  USER_CARDS,
  ACTUAL_CARD_USAGE,
  TOTAL_ANNUAL_SPEND,
  ANNUAL_BUCKETS,
  LOUNGE_BUCKETS,
  RESPONSE_ONLY_BUCKETS,
  ALL_INPUT_BUCKETS,
  BUCKET_TO_CATEGORY,
  BUCKET_TO_MERCHANT,
  MERCHANT_TO_BUCKET,
} from "./inputs";
import {
  calculateResponses,
  recommendResponse,
  getBucketSavings,
  getBestCardForBucket,
  getBestMarketCardForBucket,
  getEligibleMarketCards,
  getFirstEligibleMarketCard,
  getOwnedCardIndex,
  isInviteOnlyMarketCard,
  getCardRewardForSpend,
} from "./mockApi";
import {
  computeCurrentSavings,
  computeOptimizedSavings,
  computeUltimateSavings,
  computeCombinedSavings,
  computeMatchScore,
  computeCardQuality,
  computeSpendCategories,
  computeSpendBrands,
  computeCardDetail,
  computeOptBrands,
  computeSpendDistribution,
  generateTransactions,
  generateActions,
} from "./compute";
import { getTransactionScenario } from "./txnScenario";

export const UNITS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

export function roundMoney(n: number): number {
  return Math.round(Number(n) || 0);
}

export function toYearly(monthly: number): number {
  return roundMoney((Number(monthly) || 0) * 12);
}

export function toMonthly(yearly: number): number {
  return Math.round(((Number(yearly) || 0) / 12) * 100) / 100;
}

export function monthlySpendForBucket(bucket: string): number {
  if (ANNUAL_BUCKETS.includes(bucket)) return (SPEND_PROFILE[bucket] || 0) / 12;
  if (LOUNGE_BUCKETS.includes(bucket)) return 0;
  return SPEND_PROFILE[bucket] || 0;
}

export function annualSpendForBucket(bucket: string): number {
  if (ANNUAL_BUCKETS.includes(bucket)) return roundMoney(SPEND_PROFILE[bucket] || 0);
  if (LOUNGE_BUCKETS.includes(bucket)) return 0;
  return toYearly(SPEND_PROFILE[bucket] || 0);
}

export function reconcileNumberParts(total: number, parts: any[], field = "value") {
  const out = (parts || []).map((p) => ({ ...p, [field]: roundMoney(p?.[field]) }));
  if (!out.length) return out;
  const drift = roundMoney(total) - out.reduce((s, p) => s + (Number(p[field]) || 0), 0);
  out[out.length - 1][field] = roundMoney((out[out.length - 1][field] || 0) + drift);
  return out;
}

export function warnIfUnreconciled(label: string, total: number, parts: any[], field = "value") {
  if (import.meta?.env?.PROD) return;
  const sum = (parts || []).reduce((s, p) => s + (Number(p?.[field]) || 0), 0);
  if (Math.abs(sum - total) > 1) {
    console.warn("[metrics]", label, { total, sum, drift: sum - total, parts });
  }
}

function cleanCardName(n: string) {
  return String(n || "")
    .trim()
    .replace(/\s+credit\s+card$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function norm(n: string) {
  return cleanCardName(n).toLowerCase().replace(/credit\s*card/g, "").replace(/[^a-z0-9+]+/g, " ").trim();
}

function parseMoney(s: any): number {
  if (typeof s === "number") return roundMoney(s);
  if (!s) return 0;
  const cleaned = String(s).replace(/[^0-9.]/g, "");
  return cleaned ? roundMoney(parseFloat(cleaned)) : 0;
}

function marketYearlySavings(card: any): number {
  return roundMoney(card?.total_savings_yearly || parseMoney(card?.annual_rewards_value) || parseMoney(card?.net_annual_savings) || 0);
}

function yearlySavingsForBreakdown(card: any, bucket: string): number {
  return roundMoney((card?.spending_breakdown?.[bucket]?.savings || 0) * 12);
}

function yearlySpendForBreakdown(card: any, bucket: string): number {
  const bd = card?.spending_breakdown?.[bucket];
  if (!bd) return annualSpendForBucket(bucket);
  if (LOUNGE_BUCKETS.includes(bucket)) return 0;
  return roundMoney((bd.spend || 0) * 12);
}

export function selectSummaryMetrics() {
  const current = computeCurrentSavings();
  const optimized = computeOptimizedSavings().total;
  const ultimate = computeUltimateSavings().total;
  return {
    unit: UNITS.YEARLY,
    totalSpend: TOTAL_ANNUAL_SPEND,
    currentSavings: current,
    optimizedSavings: optimized,
    ultimateSavings: ultimate,
    optimizationUplift: roundMoney(optimized - current),
    ultimateUplift: roundMoney(ultimate - optimized),
    totalPotentialUplift: roundMoney(ultimate - current),
  };
}

export function selectSavingsBars() {
  const s = selectSummaryMetrics();
  return {
    bar1: s.currentSavings,
    bar2: s.optimizedSavings,
    bar3: s.ultimateSavings,
    flow1_delta: s.optimizationUplift,
    flow2_delta: s.totalPotentialUplift,
    ultimate_uplift: s.ultimateUplift,
    unit: UNITS.YEARLY,
  };
}

export function selectHomeMetrics() {
  return {
    summary: selectSummaryMetrics(),
    spend: selectSpendAnalysisMetrics(),
    transactions: selectTransactionMetrics().transactions.slice(0, 4),
    cardPromo: selectCardPromoMetrics(),
  };
}

export function selectTransactionMetrics() {
  const transactions = generateTransactions().map((txn, index) => {
    if (txn.unaccounted) return { ...txn, metricId: index, scenario: null, saved: null, missed: null, marketUplift: 0 };
    const scenario = getTransactionScenario(txn);
    return {
      ...txn,
      metricId: index,
      scenario,
      saved: scenario.actualSavings,
      missed: scenario.walletDelta || null,
      marketUplift: scenario.marketDelta,
      tag: txn.tag,
    };
  });
  return { unit: "transaction", transactions };
}

function roundPcts<T>(items: T[], key: string, total: number): T[] {
  if (!total) return items.map(i => ({ ...i, pct: 0 }));
  const raw = items.map(i => (i as any)[key] / total * 100);
  const floored = raw.map(Math.floor);
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);
  const remainders = raw.map((r, i) => ({ i, r: r - floored[i] })).sort((a, b) => b.r - a.r);
  for (const { i } of remainders) { if (remainder <= 0) break; floored[i]++; remainder--; }
  return items.map((item, i) => ({ ...item, pct: floored[i] }));
}

export function selectSpendAnalysisMetrics() {
  const cats = reconcileNumberParts(
    TOTAL_ANNUAL_SPEND,
    computeSpendCategories().map((c) => ({ ...c, value: c.amt })),
    "value",
  ).map((c) => ({ ...c, amt: c.value }));
  const categories = roundPcts(cats, "amt", TOTAL_ANNUAL_SPEND);
  const brands = roundPcts(computeSpendBrands(), "amt", TOTAL_ANNUAL_SPEND);
  return { unit: UNITS.YEARLY, totalSpend: TOTAL_ANNUAL_SPEND, categories, brands };
}

export function selectOptimizeMetrics(includeUltimate = true) {
  const dist = selectSpendDistributionMetrics(includeUltimate);
  return {
    summary: selectSummaryMetrics(),
    bars: selectSavingsBars(),
    brands: computeOptBrands(),
    spendDistribution: dist,
    cardPromo: selectCardPromoMetrics(),
  };
}

export function selectSpendDistributionMetrics(includeUltimate = true) {
  const raw = computeSpendDistribution(includeUltimate);
  const reconciled = reconcileNumberParts(TOTAL_ANNUAL_SPEND, raw.map((d) => ({ ...d, spendValue: d.spend })), "spendValue")
    .map((d) => ({ ...d, spend: d.spendValue }));
  warnIfUnreconciled("spend distribution", TOTAL_ANNUAL_SPEND, reconciled, "spend");
  const pctTotal = reconciled.reduce((s, d) => s + (d.pct || 0), 0);
  if (reconciled.length && pctTotal !== 100) {
    const drift = 100 - pctTotal;
    reconciled[reconciled.length - 1].pct = Math.max(0, (reconciled[reconciled.length - 1].pct || 0) + drift);
  }
  return reconciled;
}

export function selectOwnedCardDetailMetrics(cardIndex: number) {
  return computeCardDetail(cardIndex);
}

export function selectOwnedCardsMetrics() {
  return USER_CARDS.map((c) => ({
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
}

export function selectBestCardsListMetrics() {
  return (recommendResponse?.savings || []).map((card, i) => {
    const ownedIdx = getOwnedCardIndex(card);
    const isOwned = ownedIdx >= 0;
    const fee = parseMoney(card.annual_fees || card.annual_fee) || roundMoney((parseMoney(card.annual_fee_without_gst) || 0) * 1.18);
    const tags = (isInviteOnlyMarketCard(card) ? ["Invite Only"] : []).concat(
      isOwned ? ["In Your Wallet"] : [],
      fee === 0 ? ["Lifetime Free"] : [],
      (card.annual_fee_waiver_toggle || card.annual_fee_waiver) ? ["Fee Waiver"] : [],
    );
    return {
      name: cleanCardName(card.card_name),
      bank: card.bank_name,
      color: i === 0 ? "#111827" : i === 1 ? "#0c2340" : "#333",
      accent: "#666",
      annualFee: fee,
      savings: marketYearlySavings(card),
      match: computeMatchScore(i),
      tags,
      highlights: (card.product_usps || []).slice(0, 3).map((u) => u.header + ": " + u.description),
      whyGood: (card.product_usps || []).slice(0, 3).map((u) => u.header),
      whyNot: [],
      howToApply: isOwned ? "In Your Wallet" : (card.cg_network_url ? "Apply via partner link" : "Apply on bank website"),
      image: card.image || card.card_bg_image || null,
      card_bg_image: card.card_bg_image,
      card_bg_gradient: card.card_bg_gradient,
      cg_network_url: card.cg_network_url,
      ck_store_url: card.ck_store_url,
      is_owned: isOwned,
      owned_card_index: ownedIdx,
      card_alias: card.card_alias,
      rating: card.rating,
      lounge_value: card.lounge_value,
      milestone_benefits_str: card.milestone_benefits,
      welcome_benefits_raw: card.welcome_benefits,
      spending_breakdown: card.spending_breakdown,
      filterTags: tags,
    };
  });
}

export function selectBestCardsCombinedSavings(topN = 2) {
  return roundMoney(computeCombinedSavings(topN));
}

export function selectBestCardBreakdownMetrics(cardOrIndex: any) {
  const list = selectBestCardsListMetrics();
  const card = typeof cardOrIndex === "number" ? list[cardOrIndex] : cardOrIndex;
  const source = typeof cardOrIndex === "number"
    ? recommendResponse?.savings?.[cardOrIndex]
    : (recommendResponse?.savings || []).find((c) => cleanCardName(c.card_name) === card?.name || norm(c.card_name) === norm(card?.name));
  if (!card || !source?.spending_breakdown) {
    return {
      milestone: 0,
      shopping: 0,
      groceries: 0,
      food: 0,
      dining: 0,
      fuel: 0,
      flights: 0,
      hotels: 0,
      bills: 0,
      rent: 0,
      thisCard: 0,
      onAxisFlipkart: 0,
      onHSBCTravelOne: 0,
      onHSBCLivePlus: 0,
      combined: 0,
    };
  }
  const catKey = (bucket: string) => {
    if (bucket === "online_food_ordering") return "food";
    if (bucket === "dining_or_going_out") return "dining";
    if (bucket === "fuel") return "fuel";
    if (bucket === "flights_annual") return "flights";
    if (bucket === "hotels_annual") return "hotels";
    if (bucket === "rent") return "rent";
    const cat = BUCKET_TO_CATEGORY[bucket];
    if (cat === "Shopping") return "shopping";
    if (cat === "Groceries") return "groceries";
    if (cat === "Bills" || cat === "Insurance" || cat === "Education") return "bills";
    return "other";
  };
  const out: any = { shopping: 0, groceries: 0, food: 0, dining: 0, fuel: 0, flights: 0, hotels: 0, bills: 0, rent: 0 };
  let thisCard = 0;
  for (const bucket of ALL_INPUT_BUCKETS) {
    if (LOUNGE_BUCKETS.includes(bucket) || RESPONSE_ONLY_BUCKETS.includes(bucket)) continue;
    const val = yearlySavingsForBreakdown(source, bucket);
    const k = catKey(bucket);
    if (k !== "other") out[k] = (out[k] || 0) + val;
    thisCard += val;
  }
  const detail = selectBestCardDetailMetrics(typeof cardOrIndex === "number" ? cardOrIndex : list.indexOf(card));
  const milestone = (detail?.milestones || []).reduce((s, m) => s + (m.amt || 0), 0);
  thisCard += milestone;
  const onCard0 = roundMoney(calculateResponses[0]?.total_savings_yearly || 0);
  const onCard1 = roundMoney(calculateResponses[1]?.total_savings_yearly || 0);
  const onCard2 = roundMoney(calculateResponses[2]?.total_savings_yearly || 0);
  return {
    milestone,
    ...out,
    thisCard,
    onAxisFlipkart: onCard1,
    onHSBCTravelOne: onCard0,
    onHSBCLivePlus: onCard2,
    combined: roundMoney(thisCard + onCard0 + onCard1 + onCard2),
  };
}

export function selectBestCardDetailMetrics(idx: number) {
  const card = recommendResponse?.savings?.[idx];
  if (!card) return null;
  const feeWithoutGst = parseMoney(card.annual_fee_without_gst);
  const netSavings = roundMoney((card.total_savings_yearly || 0) - feeWithoutGst);
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
      ? milestoneArr.map((m) => ({ amt: parseMoney(m.voucherBonus || m.rpBonus), validity: (m.maxDays || "365") + " days" }))
      : milestoneVal > 0 ? [{ amt: milestoneVal, validity: "per year" }] : [],
    lounge: {
      qty: (card.travel_benefits?.domestic_lounges_unlocked || 0) + (card.travel_benefits?.international_lounges_unlocked || 0),
      type: "per year",
    },
    fees: {
      annual: parseMoney(card.annual_fees || card.annual_fee) || 0,
      waiver: card.annual_fee_spends ? "Spend ₹" + (parseInt(card.annual_fee_spends) / 100000) + "L to waive" : "data unavailable",
    },
    replace: worstUserCard ? USER_CARDS[worstUserCard._idx]?.name : "",
    replaceSave: worstUserCard ? roundMoney((card.total_savings_yearly || 0) - worstUserCard.total_savings_yearly) : 0,
    netSavings,
    brandFit: selectBestCardBrandFit(card),
    redemptionOptions: card.redemption_options || [],
    recommendedRedemption: card.recommended_redemption_options || [],
    productUsps: card.product_usps || [],
    comparisonBars: [
      { name: cleanCardName(card.card_name), savings: roundMoney(card.total_savings_yearly || 0), color: "#111827" },
      ...calculateResponses.map((cr, i) => ({ name: USER_CARDS[i].name, savings: roundMoney(cr.total_savings_yearly), color: USER_CARDS[i].color })),
    ],
  };
}

export function selectBestCardBrandFit(card: any) {
  return Object.entries(card?.spending_breakdown || {})
    .filter(([, v]: any) => v.spend > 0 && v.savings > 0)
    .sort(([, a]: any, [, b]: any) => b.savings - a.savings)
    .slice(0, 10)
    .map(([bucket, data]: any) => ({
      brand: (BUCKET_TO_MERCHANT[bucket] || [bucket])[0],
      spend: yearlySpendForBreakdown(card, bucket),
      rate: data.spend > 0 ? ((data.savings / data.spend) * 100).toFixed(1).replace(/\.0$/, "") + "%" : "0%",
      savings: yearlySavingsForBreakdown(card, bucket),
    }));
}

export function selectCardPromoMetrics() {
  const marketTop = getFirstEligibleMarketCard();
  return {
    name: cleanCardName(marketTop?.card_name || "Recommended Card"),
    image: marketTop?.card_bg_image || marketTop?.image || "",
    savings: marketYearlySavings(marketTop),
    cg_url: marketTop?.cg_network_url || "",
    spending_breakdown: marketTop?.spending_breakdown,
    milestone_benefits: marketTop?.milestone_benefits,
    welcome_benefits: marketTop?.welcomeBenefits,
    travel_benefits: marketTop?.travel_benefits,
    total_extra_benefits: marketTop?.total_extra_benefits || 0,
    annual_fee: parseMoney(marketTop?.annual_fees || marketTop?.annual_fee),
    fee_waiver: marketTop?.annual_fee_spends,
    product_usps: marketTop?.product_usps,
  };
}

export function selectPortfolioMetrics(selectedNewCards: string[] = []) {
  const selected = selectedNewCards.length ? selectedNewCards : selectBestCardsListMetrics().slice(0, 3).map((c) => c.name);
  const marketCards = (recommendResponse?.savings || []).filter((c) => selected.some((name) => norm(name) === norm(c.card_name) || norm(c.card_name).includes(norm(name)) || norm(name).includes(norm(c.card_name))));
  const allCandidates = [
    ...calculateResponses.map((resp, i) => ({ source: resp, name: USER_CARDS[i].name, color: USER_CARDS[i].color, accent: USER_CARDS[i].accent, owned: true, last4: "XXXX " + USER_CARDS[i].last4, annualFee: USER_CARDS[i].annual_fee || 0, milestoneBenefits: resp.total_extra_benefits || 0 })),
    ...marketCards.map((source, i) => ({ source, name: cleanCardName(source.card_name), color: i === 0 ? "#583598" : i === 1 ? "#11257E" : "#4C98F4", accent: i === 0 ? "#9359FE" : i === 1 ? "#0A44A7" : "#0862CF", owned: false, last4: "NEW CARD", newCard: true, annualFee: parseMoney(source.annual_fees || source.annual_fee), milestoneBenefits: parseMoney(source.milestone_benefits) || 0 })),
  ];
  const cardMap = new Map();
  const catMap = new Map();
  for (const bucket of ALL_INPUT_BUCKETS) {
    if (LOUNGE_BUCKETS.includes(bucket) || RESPONSE_ONLY_BUCKETS.includes(bucket)) continue;
    const spend = annualSpendForBucket(bucket);
    if (spend <= 0) continue;
    let best = null;
    for (const c of allCandidates) {
      const s = yearlySavingsForBreakdown(c.source, bucket);
      if (!best || s > best.savings) best = { ...c, savings: s };
    }
    if (!best) continue;
    if (!cardMap.has(best.name)) {
      cardMap.set(best.name, { name: best.name, spend: 0, save: 0, c1: best.color, c2: best.accent, tags: new Set(), last4: best.last4, newCard: best.newCard, annualFee: best.annualFee || 0, milestoneBenefits: best.milestoneBenefits || 0 });
    }
    const row = cardMap.get(best.name);
    row.spend += spend;
    row.save += best.savings;
    const cat = BUCKET_TO_CATEGORY[bucket] || "Other";
    row.tags.add(cat);
    if (!catMap.has(cat)) catMap.set(cat, { key: cat, spend: 0, save: 0, cards: new Map() });
    const cRow = catMap.get(cat);
    cRow.spend += spend;
    cRow.save += best.savings;
    cRow.cards.set(best.name, { name: best.name, spend: (cRow.cards.get(best.name)?.spend || 0) + spend, c1: best.color, c2: best.accent });
  }
  let cards = Array.from(cardMap.values()).sort((a, b) => b.spend - a.spend);
  cards = reconcileNumberParts(TOTAL_ANNUAL_SPEND, cards.map((c) => ({ ...c, spendValue: c.spend })), "spendValue")
    .map((c) => ({ ...c, spend: c.spendValue }));
  const totalSave = cards.reduce((s, c) => s + c.save, 0);
  cards = reconcileNumberParts(totalSave, cards.map((c) => ({ ...c, saveValue: c.save })), "saveValue")
    .map((c) => {
      const pct = TOTAL_ANNUAL_SPEND > 0 ? roundMoney((c.spend / TOTAL_ANNUAL_SPEND) * 100) : 0;
      const milestoneBenefits = roundMoney(c.milestoneBenefits || 0);
      const annualFee = roundMoney(c.annualFee || 0);
      return {
        ...c,
        save: c.saveValue,
        pct,
        tags: Array.from(c.tags),
        breakdown: {
          savingsOnSpends: roundMoney(c.saveValue - milestoneBenefits + annualFee),
          milestoneBenefits,
          annualFee,
        },
      };
    });
  const pctDrift = 100 - cards.reduce((s, c) => s + (c.pct || 0), 0);
  if (cards.length) cards[cards.length - 1].pct += pctDrift;
  const categories = Array.from(catMap.values()).map((c) => {
    const cardsForCat = Array.from(c.cards.values());
    const reconciledCards = reconcileNumberParts(c.spend, cardsForCat.map((x) => ({ ...x, spendValue: x.spend })), "spendValue")
      .map((x) => ({ ...x, spend: x.spendValue, share: c.spend > 0 ? roundMoney((x.spendValue / c.spend) * 100) : 0, caption: "Use this card for maximum rewards" }));
    const shareDrift = 100 - reconciledCards.reduce((s, x) => s + x.share, 0);
    if (reconciledCards.length) reconciledCards[reconciledCards.length - 1].share += shareDrift;
    return {
      ...c,
      icon: `/cdn/categories/${c.key === "Dining" ? "Dining Out" : c.key}.webp`,
      spend: roundMoney(c.spend),
      save: roundMoney(c.save),
      cards: reconciledCards,
    };
  }).sort((a, b) => b.spend - a.spend);
  const totalSavings = roundMoney(totalSave);
  const baseline = selectSummaryMetrics().currentSavings;
  return {
    unit: UNITS.YEARLY,
    selectedNewCards: selected,
    totalSpend: TOTAL_ANNUAL_SPEND,
    totalSavings,
    baselineSavings: baseline,
    uplift: roundMoney(totalSavings - baseline),
    cards,
    categories,
    timeline: buildPortfolioTimeline(categories[0], cards),
    benefitsByCard: buildPortfolioBenefits(cards, marketCards),
    feesByCard: buildPortfolioFees(cards, marketCards),
    eligibilityByCard: buildPortfolioEligibility(cards),
  };
}

function buildPortfolioTimeline(category: any, cards: any[]) {
  const active = category?.cards?.[0] || cards[0];
  if (!active) return [];
  const monthly = toMonthly(active.spend || 0);
  const yearly = roundMoney(active.spend || 0);
  return [
    { kind: "card", card: active.name, c1: active.c1, c2: active.c2, title: "Spend ₹" + roundMoney(monthly).toLocaleString("en-IN") + "/month on " + active.name, caption: "based on your canonical spend profile", monthly: roundMoney(monthly), yearly },
  ];
}

function buildPortfolioBenefits(cards: any[], marketCards: any[]) {
  const map: any = {};
  for (const c of cards) {
    const src = marketCards.find((m) => norm(m.card_name) === norm(c.name));
    const detail = src ? selectBestCardDetailMetrics((recommendResponse?.savings || []).indexOf(src)) : null;
    map[c.name] = {
      milestones: detail?.milestones?.length ? detail.milestones.map((m) => ({ earned: "₹" + roundMoney(m.amt).toLocaleString("en-IN") + " reward", desc: m.validity, status: "claimable" })) : [{ earned: "data unavailable", desc: "", status: "locked" }],
      welcome: detail?.welcome ? [{ title: "₹" + roundMoney(detail.welcome.amt).toLocaleString("en-IN") + " welcome benefit", desc: detail.welcome.validity }] : [{ title: "data unavailable", desc: "" }],
      lounge: detail?.lounge?.qty ? [{ title: detail.lounge.qty + " lounge visits " + detail.lounge.type, desc: "" }] : [{ title: "data unavailable", desc: "" }],
    };
  }
  return map;
}

function buildPortfolioFees(cards: any[], marketCards: any[]) {
  const map: any = {};
  for (const c of cards) {
    const src = marketCards.find((m) => norm(m.card_name) === norm(c.name));
    const fee = src ? parseMoney(src.annual_fees || src.annual_fee) : c.annualFee || 0;
    const waiver = src?.annual_fee_spends ? "Spend ₹" + (parseInt(src.annual_fee_spends) / 100000) + "L in a year to waive next year's fee" : "data unavailable";
    map[c.name] = {
      annual: { fee: fee ? "₹" + fee.toLocaleString("en-IN") : "Lifetime Free", spendToWaive: waiver, remaining: "data unavailable" },
      joining: { fee: fee ? "₹" + fee.toLocaleString("en-IN") : "Nil", note: "data unavailable" },
      bank: [{ label: "Forex Markups", value: "data unavailable" }],
      late: [{ range: "data unavailable", fee: "data unavailable" }],
    };
  }
  return map;
}

function buildPortfolioEligibility(cards: any[]) {
  const map: any = {};
  for (const c of cards) {
    map[c.name] = { age: "data unavailable", salary: "data unavailable", rating: "data unavailable", ntc: "data unavailable", existing: "data unavailable" };
  }
  return map;
}

export function selectCalculatorMetrics() {
  const brandBuckets = Object.entries(BUCKET_TO_MERCHANT).flatMap(([bucket, merchants]) => merchants.map((name) => ({ name, bucket, category: BUCKET_TO_CATEGORY[bucket] || "Other" })));
  const cards = USER_CARDS.map((card) => {
    const rates: any = {};
    const points: any = {};
    for (const { name, bucket } of brandBuckets) {
      const reward = getCardRewardForSpend(card.index, 10000, bucket, name);
      rates[name] = reward.rate || 0;
      points[name] = reward.points_earned || 0;
    }
    const defaultBuckets = ALL_INPUT_BUCKETS.filter((b) => !LOUNGE_BUCKETS.includes(b) && !RESPONSE_ONLY_BUCKETS.includes(b));
    const defaultRate = defaultBuckets.reduce((s, b) => {
      const bd = calculateResponses[card.index]?.spending_breakdown?.[b];
      return s + (bd?.spend > 0 ? bd.savings / bd.spend : 0);
    }, 0) / Math.max(1, defaultBuckets.length);
    return {
      name: card.name,
      type: card.savings_type === "points" ? "Points" : card.index === 1 ? "Auto Cashback" : "Cashback",
      rates: { default: Math.round(defaultRate * 10000) / 100, ...rates },
      pointUnits: points,
    };
  });
  return { cards, brands: brandBuckets };
}

export function calculateRewardsForInput(amount: number, queryName: string, isCategory = false) {
  const metrics = selectCalculatorMetrics();
  const categoryBrands = isCategory
    ? metrics.brands.filter((b) => b.category === queryName || b.category === (queryName === "Food Delivery" ? "Dining" : queryName))
    : metrics.brands.filter((b) => b.name === queryName);
  return USER_CARDS.map((srcCard, cardIndex) => {
    const rewards = categoryBrands.length
      ? categoryBrands.map((brand) => getCardRewardForSpend(cardIndex, amount, brand.bucket, brand.name))
      : [getCardRewardForSpend(cardIndex, amount, MERCHANT_TO_BUCKET[queryName] || queryName, queryName)];
    const bestReward = rewards.reduce((best, reward) => reward.savings > best.savings ? reward : best, { savings: 0, rate: 0, points_earned: 0 });
    return {
      name: srcCard.name,
      type: srcCard.savings_type === "points" ? "Points" : srcCard.index === 1 ? "Auto Cashback" : "Cashback",
      rates: metrics.cards[cardIndex]?.rates || {},
      pointUnits: metrics.cards[cardIndex]?.pointUnits || {},
      rate: Math.round((bestReward.rate || 0) * 100) / 100,
      saved: roundMoney(bestReward.savings || 0),
      points: roundMoney(bestReward.points_earned || 0),
      maxCap: bestReward.maxCap,
      maxCapReached: !!bestReward.maxCapReached,
    };
  }).sort((a, b) => b.saved - a.saved);
}

export function selectActionsMetrics() {
  return generateActions();
}

export function selectRedeemMetrics() {
  const owned = USER_CARDS.map((card) => ({
    name: card.name,
    pointName: card.ptName,
    perPt: card.conv_rate,
    checkUrl: "",
    pointsAvailable: card.availPts || 0,
    options: card.savings_type === "points"
      ? [
          { partner: "Statement Credit", name: "Statement Credit", method: "Cashback", rate: card.conv_rate, minPts: 500, recommended: true, portal: "Card rewards portal", steps: "Redeem through the card rewards portal.", icon: "₹" },
        ]
      : [
          { partner: "Statement Cashback", name: "Statement Cashback", method: "Cashback", rate: card.conv_rate, minPts: 1, recommended: true, portal: "Auto-credited", steps: "Cashback is automatically credited to your statement.", icon: "₹" },
        ],
  }));
  const market = getEligibleMarketCards().slice(0, 5).map((card) => {
    const top = (card.redemption_options || [])[0] || {};
    return {
      name: cleanCardName(card.card_name),
      color: "#1a1a2e",
      accent: "#333",
      last4: "—",
      pointName: top.reward_type || "Reward Points",
      bestRate: top.conversion_rate ? "₹" + top.conversion_rate + "/PT" : "data unavailable",
      img: card.image || card.card_bg_image || "",
      options: (card.redemption_options || []).map((r) => ({
        partner: r.method || r.name || "Redemption option",
        method: r.method || "Rewards",
        rate: Number(r.conversion_rate) || 0,
        minPts: 1,
        recommended: false,
        portal: "data unavailable",
        steps: "data unavailable",
        icon: "₹",
      })),
    };
  });
  const byCardName: Record<string, any> = {};
  for (const card of owned) byCardName[card.name] = card;
  for (const card of market) {
    byCardName[card.name] = {
      pointName: card.pointName,
      perPt: card.options[0]?.rate || 0,
      checkUrl: "data unavailable",
      pointsAvailable: 0,
      options: card.options.length ? card.options : [{
        partner: "data unavailable",
        name: "data unavailable",
        method: "Rewards",
        rate: 0,
        minPts: 1,
        recommended: false,
        portal: "data unavailable",
        steps: "data unavailable",
        icon: "₹",
      }],
    };
  }
  return { owned, market, byCardName, marketCards: market };
}

export const METRICS = {
  selectSummaryMetrics,
  selectSavingsBars,
  selectHomeMetrics,
  selectTransactionMetrics,
  selectOptimizeMetrics,
  selectOwnedCardDetailMetrics,
  selectBestCardsListMetrics,
  selectBestCardBreakdownMetrics,
  selectBestCardDetailMetrics,
  selectBestCardsCombinedSavings,
  selectPortfolioMetrics,
  selectCalculatorMetrics,
  calculateRewardsForInput,
  selectActionsMetrics,
  selectRedeemMetrics,
};
