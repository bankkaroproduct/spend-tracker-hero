// @ts-nocheck
// Data for the new "Actions to consider" flow.
// Each entry powers one row in the list AND its corresponding bottom sheet.
//
// To revert this entire feature: in src/features/actions/ActionsScreen.tsx,
// set `USE_NEW_FLOW = false`. The original screen is preserved untouched.

import { CD } from "@/data/simulation/legacy";
import { USER_CARDS } from "@/data/simulation/inputs";
import { f } from "@/lib/format";

export type ConsiderCat = "credit" | "cap" | "fee" | "milestone" | "benefit" | "points";
export type Urgency = "now" | "soon" | "later" | "info";

// ─── Computed helpers ───────────────────────────────────────────────────────
const card0 = USER_CARDS[0]; // HSBC Travel One
const card1 = USER_CARDS[1]; // Axis Flipkart
const card2 = USER_CARDS[2]; // HSBC Live+
const cd0 = CD[0];

// Credit utilization
const card1CreditPct = Math.round((card1.credit_used / card1.credit_limit) * 100);
const card1HighUseThreshold = Math.round(card1.credit_limit * 0.3);
const card1PayoffAdvice = card1.credit_used > card1HighUseThreshold
  ? `High credit use (>30%) hurts your credit score. Pay off atleast ₹${f(card1.credit_used - card1HighUseThreshold)} to protect your score`
  : `Your credit utilization is ${card1CreditPct}%. Keep it below 30% for a healthy score`;

// Fee waiver (card 0 — HSBC Travel One)
const feeSpentYTD0 = cd0.totalSpend || 0;
const feeThreshold0 = card0.fee_waiver_threshold || 800000;
const feeRemaining0 = Math.max(0, feeThreshold0 - feeSpentYTD0);
const feePct0 = Math.min(100, Math.round((feeSpentYTD0 / feeThreshold0) * 100));

// Points expiring (card 0)
const ptsExp0 = card0.points_expiring;
const ptsExpAmt = ptsExp0?.amount || 2200;
const ptsExpDays = ptsExp0?.days_until || 18;
const ptsExpValue = Math.round(ptsExpAmt * card0.conv_rate);

// Milestone (card 0)
const milestone0 = card0.milestone_benefits?.[0];
const milestoneMinSpend = milestone0?.minSpend || 1200000;
const milestoneValue = milestone0?.value || 2000;
const milestoneYTDSpend = (cd0.totalSpend || 0) * 3; // extrapolate to annual
const milestoneRemaining = Math.max(0, milestoneMinSpend - milestoneYTDSpend);

// Lounge (card 0)
const domTotal0 = card0.lounge_access?.domestic_annual || 6;
const domUsed0 = card0.lounge_used?.domestic || 3;
const domRemaining0 = domTotal0 - domUsed0;
const intlTotal0 = card0.lounge_access?.international_annual || 4;
const intlUsed0 = card0.lounge_used?.international || 1;
const intlRemaining0 = intlTotal0 - intlUsed0;

// Caps — find from CD[i].limits.caps by category substring, with fallbacks
function findCap(cdIdx: number, keyword: string) {
  const caps = CD[cdIdx]?.limits?.caps || [];
  return caps.find((c: any) => c.name.toLowerCase().includes(keyword.toLowerCase()));
}

// Axis Flipkart caps from sim
const axisCaps = CD[1]?.limits?.caps || [];

// 3D PNG icons used as the round hero badge in the sheet header.
// We pick existing 3D assets that match the visual style of the Figma mocks.
export const HOOK_ICON: Record<string, string> = {
  CL1: "/legacy-assets/opt/0e60286a81e4.png", // gauge/gift fallback — overridden by emoji-style svg in screen
  C1:  "/legacy-assets/opt/0e60286a81e4.png", // gift box w/ warning badge
  C3:  "/legacy-assets/opt/0e60286a81e4.png",
  C2:  "/legacy-assets/opt/0e60286a81e4.png",
  F1:  "/categories/bills.png",                // receipt
  F4:  "/categories/bills.png",
  M1:  "/categories/milestones.png",           // podium/star
  B4a: "/categories/bills.png",
  B4b: "/categories/bills.png",
  B4c: "/categories/bills.png",
  B3:  "/categories/bills.png",
  P1:  "/legacy-assets/opt/0e60286a81e4.png",
};

export const CONSIDER_HOOKS: any[] = [
  // ────── CL1 — Credit Limit Reached ──────
  {
    id: "CL1", cat: "credit", cardBrand: "axis", cardName: card1.name + " Credit Card",
    title: "Credit Limit Reached on " + card1.name + " Card",
    sub: "Repay outstanding to continue using",
    urgency: "now", urgencyLabel: "Now",
    sheet: {
      template: "standard",
      sheetTitle: "Credit Limit Reached",
      heroIcon: "gauge",
      hero: {
        label: "Card limit",
        rightLabel: "₹" + f(card1.credit_limit),
        rightSuffix: card1CreditPct >= 100 ? "fully Used" : f(card1CreditPct) + "% Used",
        progressPct: card1CreditPct, progressTone: card1CreditPct >= 70 ? "red" : card1CreditPct >= 40 ? "amber" : "green",
      },
      sectionLabel: "Recent Bill Statement Generated",
      billStatement: {
        amountDue: "₹" + f(card1.credit_used),
        minDue: "₹" + f(Math.round(card1.credit_used * 0.078)),
        dueBy: "12 May 2026",
      },
      alert: {
        tone: "amber",
        text: card1PayoffAdvice,
      },
      primaryCta: "Pay Bill Now",
    },
  },

  // ────── C1 — Dining cap hit (HSBC Travel One) ──────
  (() => {
    const diningCap = findCap(0, "dining");
    const capTotal = diningCap?.total || 30000;
    const capUsed = diningCap ? diningCap.used : capTotal; // fallback: maxed out
    const capLeft = Math.max(0, capTotal - capUsed);
    const capPct = Math.min(100, Math.round((capUsed / capTotal) * 100));
    return {
    id: "C1", cat: "cap", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: "Dining rewards maxed out on " + card0.name + " Card",
    sub: "Switch dining spends to " + card2.name,
    urgency: "now", urgencyLabel: capPct >= 100 ? "In 0 days" : "Soon",
    sheet: {
      template: "alternatives",
      sheetTitle: "Dining rewards maxed out",
      heroIcon: "gift",
      alert: {
        tone: "amber",
        text: capPct >= 100 ? "Every dining spend on this card now earns 0%" : "Dining cap is " + capPct + "% used",
      },
      hero: {
        label: "Dining Rewards Cap",
        rightLabel: f(capLeft) + " / " + f(capTotal),
        rightSuffix: "Points left",
        progressPct: capPct, progressTone: capPct >= 70 ? "red" : "amber",
        meta: "Resets in 12 days",
      },
      sectionLabel: "Best Alternatives",
      alternatives: [
        { cardImg: card2.image, cardName: card2.name, rate: "5% Cashback on Dining" },
      ],
      details: [
        { q: "What is a reward cap?", a: "A reward cap is the maximum reward you can earn on a card — set by the bank, not by you. Cap types: Bucket cap (limit on a specific category) and Card-level cap (limit across all categories combined). Once hit, every spend earns 0% until the cycle resets." },
      ],
      primaryCta: "See alternatives on savings finder",
    },
  }; })(),

  // ────── C3 — All rewards maxed out (Axis Flipkart, multi-cap layout) ──────
  (() => {
    const caps = axisCaps.length > 0 ? axisCaps : [
      { name: "Dining spends", used: 30000, total: 30000 },
      { name: "Travel spends", used: 10000, total: 10000 },
      { name: "Shopping spends", used: 10000, total: 10000 },
    ];
    return {
    id: "C3", cat: "cap", cardBrand: "axis", cardName: card1.name + " Card",
    title: "All rewards maxed out on " + card1.name + " Card",
    sub: "Switch your spends to other cards",
    urgency: "now", urgencyLabel: "In 0 days",
    sheet: {
      template: "multi-cap",
      sheetTitle: "All Cashback maxed out",
      heroIcon: "gift",
      alert: {
        tone: "amber",
        text: "Any spend on this card now earns 0%",
      },
      multiCaps: caps.map((cap: any) => {
        const pct = Math.min(100, Math.round((cap.used / cap.total) * 100));
        const left = Math.max(0, cap.total - cap.used);
        return {
          label: cap.name.replace(/ spends$/i, "") + " Cashback Cap",
          rightLabel: "₹" + f(left) + " / ₹" + f(cap.total),
          rightSuffix: "left",
          progressPct: pct,
          progressTone: pct >= 70 ? "red" : "amber",
          meta: "Resets in 15 days",
        };
      }),
      details: [
        { q: "What is a reward cap?", a: "A reward cap is the maximum reward you can earn on a card — set by the bank, not by you. " + card1.name + " has hit its card-level cap. All spends will earn nothing until the cycle resets." },
      ],
      primaryCta: "See alternatives on savings finder",
    },
  }; })(),

  // ────── C2 — Travel cap approaching ──────
  (() => {
    const travelCap = findCap(0, "travel");
    const tCapUsed = travelCap?.used || 12600;
    const tCapTotal = travelCap?.total || 15000;
    const tCapLeft = Math.max(0, tCapTotal - tCapUsed);
    const tCapPct = Math.min(100, Math.round((tCapUsed / tCapTotal) * 100));
    return {
    id: "C2", cat: "cap", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: "Travel rewards maxing out soon — " + card0.name + " Card",
    sub: "₹" + f(tCapLeft) + " left before annual cap",
    urgency: "soon", urgencyLabel: "In 12 days",
    sheet: {
      template: "alternatives",
      sheetTitle: "Travel rewards maxing out soon",
      heroIcon: "gift",
      alert: {
        tone: "amber",
        text: "At your current pace, you'll hit the travel cap in 12 days",
      },
      hero: {
        label: "Travel Rewards Cap",
        rightLabel: "₹" + f(tCapUsed) + " / ₹" + f(tCapTotal),
        rightSuffix: "Used",
        progressPct: tCapPct, progressTone: tCapPct >= 70 ? "amber" : "green",
        meta: "Projected breach: 8 May 2026",
      },
      sectionLabel: "Best Alternatives",
      alternatives: [
        { cardImg: "/legacy-assets/cards/sbi-miles.png", cardName: "Axis Atlas", rate: "5x on travel" },
      ],
      primaryCta: "See alternatives on savings finder",
    },
  }; })(),

  // ────── F1 — Fee waiver opportunity ──────
  {
    id: "F1", cat: "fee", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: "Spend ₹" + f(feeRemaining0) + " more to waive ₹" + f(card0.annual_fee) + " fee on " + card0.name,
    sub: "Hit ₹" + (feeThreshold0 / 100000).toFixed(0) + "L annual spend before anniversary",
    urgency: "soon", urgencyLabel: "50 days left",
    sheet: {
      template: "fee-waiver",
      sheetTitle: "Fee Waiver",
      heroIcon: "receipt-check",
      hero: {
        label: "Annual Fee Waiver",
        rightLabel: "₹" + f(feeSpentYTD0) + " / ₹" + f(feeThreshold0),
        rightSuffix: "Spent",
        progressPct: feePct0, progressTone: "dark",
        meta: "50 Days left",
      },
      sectionLabel: "Best Categories to Spend",
      categories: [
        { img: "/categories/shopping.png", name: "Dining", rate: "Best Reward Rate - 5%" },
        { img: "/categories/groceries.png", name: "Groceries", rate: "Best Reward Rate - 5%" },
      ],
      details: [
        { q: "What is a Fee Waiver", a: "A fee waiver is when the bank cancels your annual fee — usually because you spent enough on the card to 'earn' it back. The clock starts on your card anniversary (15 June for this card). Cross the threshold and the renewal fee is reversed automatically. Most cards exclude fuel, rent, and wallet loads from spend counted toward the waiver." },
      ],
      primaryCta: "Find recommendations on savings finder",
    },
  },

  // ────── M1 — Milestone progress (timeline) ──────
  {
    id: "M1", cat: "milestone", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: "Spend ₹" + f(milestoneRemaining) + " more to unlock " + (milestone0?.reward || "travel voucher"),
    sub: card0.name + " milestone benefit",
    urgency: "soon", urgencyLabel: "In 30 days",
    sheet: {
      template: "milestone",
      sheetTitle: "Milestone benefits",
      heroIcon: "milestones",
      milestones: [
        { state: "claimed", title: (milestone0?.reward || "Travel Voucher") + " (Worth ₹" + f(milestoneValue) + ")", sub: "Spend ₹" + f(milestoneMinSpend) + " on this card in 120 Days" },
        { state: "active",  title: (milestone0?.reward || "Travel Voucher") + " (Worth ₹" + f(milestoneValue) + ")", sub: "Spend ₹" + f(milestoneMinSpend) + " on this card in 120 Days", chips: ["₹" + f(milestoneRemaining) + " More to Spend", "15 Days Left"] },
        { state: "locked",  title: (milestone0?.reward || "Travel Voucher") + " (Worth ₹" + f(milestoneValue) + ")", sub: "Spend ₹" + f(milestoneMinSpend) + " on this card in 120 Days" },
        { state: "locked",  title: (milestone0?.reward || "Travel Voucher") + " (Worth ₹" + f(milestoneValue) + ")", sub: "Spend ₹" + f(milestoneMinSpend) + " on this card in 120 Days" },
      ],
      primaryCta: "Find recommendations on savings finder",
    },
  },

  // ────── B4a — Domestic lounge expiring ──────
  {
    id: "B4a", cat: "benefit", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: domRemaining0 + " domestic lounge visits expiring on " + card0.name,
    sub: "Worth ₹" + f(domRemaining0 * 750) + " · Reset on card anniversary",
    urgency: "soon", urgencyLabel: "In 50 days",
    sheet: {
      template: "benefit",
      sheetTitle: "Benefits Expiring",
      heroIcon: "receipt-check",
      heroBig: { meta: "Expiring in 50 days", title: domRemaining0 + " domestic lounge visits" },
      whyTitle: "Why do you have this benefit?",
      whyText: "Your " + card0.name + " Card includes " + domTotal0 + " free domestic airport lounge visits per year. Resets on card anniversary.",
      howTitle: "How to use",
      howSteps: [
        "Tap card at lounge entrance",
        "Mastercard LoungeKey accepted at 1,300+ lounges",
        "Guest entry not included",
      ],
      primaryCta: "Find best redemption options",
    },
  },

  // ────── B4b — International lounge expiring ──────
  {
    id: "B4b", cat: "benefit", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: intlRemaining0 + " international lounge visits expiring on " + card0.name,
    sub: "Worth ₹" + f(intlRemaining0 * 1250) + " · Reset on card anniversary",
    urgency: "soon", urgencyLabel: "In 50 days",
    sheet: {
      template: "benefit",
      sheetTitle: "Benefits Expiring",
      heroIcon: "receipt-check",
      heroBig: { meta: "Expiring in 50 days", title: intlRemaining0 + " international lounge visits" },
      whyTitle: "Why do you have this benefit?",
      whyText: "Your " + card0.name + " Card includes " + intlTotal0 + " free international airport lounge visits per year via Mastercard LoungeKey, accessible at 1,300+ lounges worldwide.",
      howTitle: "How to use",
      howSteps: [
        "Plan an international trip",
        "Use on next layover",
        "LoungeKey works at 1,300+ lounges",
      ],
      primaryCta: "Find best redemption options",
    },
  },

  // ────── B4c — Chauffeur transfer (matches the Figma screenshot) ──────
  {
    id: "B4c", cat: "benefit", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: "1 chauffeur airport transfer expiring on " + card0.name,
    sub: "Worth ₹1,500 · Quarterly reset",
    urgency: "soon", urgencyLabel: "In 12 days",
    sheet: {
      template: "benefit",
      sheetTitle: "Benefits Expiring",
      heroIcon: "receipt-check",
      heroBig: { meta: "Expiring in 50 days", title: "1 chauffeur airport transfer" },
      whyTitle: "Why do you have this benefit?",
      whyText: "Your " + card0.name + " Card includes 4 free chauffeur airport rides per year. 1 per quarter.",
      howTitle: "How to use",
      howSteps: [
        "Book at least 24 hrs before pickup",
        "Domestic airports only - within city",
        "Either to-airport or from-airport, not both",
      ],
      primaryCta: "Find best redemption options",
    },
  },

  // ────── B3 — Meet & Greet evergreen ──────
  {
    id: "B3", cat: "benefit", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: "2 free airport meet & greets included this year",
    sub: card0.name + " — unused benefit",
    urgency: "info", urgencyLabel: "Evergreen",
    sheet: {
      template: "benefit",
      sheetTitle: "Benefits Expiring",
      heroIcon: "receipt-check",
      heroBig: { meta: "Available all year", title: "2 free airport meet & greets" },
      whyTitle: "Why do you have this benefit?",
      whyText: "Your " + card0.name + " Card includes 2 complimentary airport meet & greet services per year. Worth ~₹3,500 each.",
      howTitle: "How to use",
      howSteps: [
        "Download DragonPass app",
        "Register with card number",
        "Book 48 hours before flight",
      ],
      primaryCta: "Find best redemption options",
    },
  },

  // ────── P1 — Points expiring ──────
  {
    id: "P1", cat: "points", cardBrand: "hsbc", cardName: card0.name + " Card",
    title: f(ptsExpAmt) + " points (worth ₹" + f(ptsExpValue) + ") expiring on " + card0.name,
    sub: "Claim now before they expire",
    urgency: "soon", urgencyLabel: "In " + ptsExpDays + " days",
    cta: "Redeem",
    sheet: {
      template: "points",
      sheetTitle: "Points Expiring",
      heroIcon: "gift",
      hero: {
        label: "Expiring in " + ptsExpDays + " days",
        rightLabel: f(ptsExpAmt) + " pts",
        rightSuffix: "Worth ₹" + f(ptsExpValue),
      },
      sectionLabel: "Best redemption options",
      pointsOptions: [
        { name: "Statement Credit", rate: "1 pt = ₹" + card0.conv_rate.toFixed(2) + " · Instant", value: "₹" + f(ptsExpValue), best: true },
        { name: "Amazon Voucher",   rate: "1 pt = ₹0.25 · 24 hrs",  value: "₹" + f(Math.round(ptsExpAmt * 0.25)) },
        { name: "Air Miles Transfer", rate: "1 pt = 0.5 mile · 7 days", value: f(Math.round(ptsExpAmt * 0.5)) + " mi" },
      ],
      primaryCta: "Redeem ₹" + f(ptsExpValue),
    },
  },
];

const _countByCat = (cat: string) => CONSIDER_HOOKS.filter((h: any) => h.cat === cat).length;

export const TABS = [
  { key: "all",       label: "All",            count: CONSIDER_HOOKS.length },
  { key: "credit",    label: "Credit Limit",   count: _countByCat("credit") },
  { key: "cap",       label: "Caps Hit",       count: _countByCat("cap") },
  { key: "fee",       label: "Fee Waivers",    count: _countByCat("fee") },
  { key: "milestone", label: "Milestones",     count: _countByCat("milestone") },
  { key: "benefit",   label: "Benefits",       count: _countByCat("benefit") },
  { key: "points",    label: "Points Expiring", count: _countByCat("points") },
];
