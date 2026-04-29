// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Lock, Star } from "lucide-react";
import { FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";
import { CARDS, selectPortfolioMetrics } from "@/data/simulation/legacy";
import { SavingsInfoIcon, SavingsBreakdownSheet } from "@/features/legacy/LegacyShared";

// Lifted directly from CardDetailV2 — keeps tab section typography identical.
const SECTION_TITLE = { fontFamily: "'Blacklist','Google Sans',serif", fontSize: 20, fontWeight: 700, lineHeight: "140%", color: "rgba(54,64,96,0.9)" };
const TINY_LABEL = { fontFamily: "'Google Sans', system-ui, sans-serif", fontSize: 10, fontWeight: 500, lineHeight: "12px", letterSpacing: "0.1em", textTransform: "uppercase" as const };

const CARD_IMG_MAP: Record<string, string> = {
  "Axis Flipkart": "/legacy-assets/cards/axis-flipkart.webp",
  "HSBC Travel One": "/legacy-assets/cards/hsbc-travel-one.webp",
  "HSBC Live+": "/legacy-assets/cards/hsbc-live.webp",
  "HDFC Infinia": "/legacy-assets/cards/hdfc-infinia.webp",
  "HDFC Millennia": "/legacy-assets/cards/Hdfc swiggy.webp",
  "HDFC Millenia": "/legacy-assets/cards/Hdfc swiggy.webp",
  "IDFC First Select": "/legacy-assets/cards/idfc select.webp",
  "Amex Travel Platinum": "/legacy-assets/cards/amex-platinum-travel.webp",
  "American Express Travel Platinum": "/legacy-assets/cards/amex-platinum-travel.webp",
  "Axis Magnus": "/legacy-assets/cards/AU-Zenith.webp",
  "AU Zenith": "/legacy-assets/cards/AU-Zenith.webp",
  "ICICI Emeralde": "/legacy-assets/cards/icici-emeralde.webp",
  "SBI Miles": "/legacy-assets/cards/sbi-miles.webp",
  "HDFC Swiggy": "/legacy-assets/cards/Hdfc swiggy.webp",
};

/* PORTFOLIO_PROFILE and CATEGORIES are now computed dynamically from
   selectPortfolioMetrics(). See the useMemo block inside the component. */


// Per-card benefits / fees / eligibility — driven by the active card pill.
type CardBenefits = {
  milestones: { earned: string; desc: string; status: "claimable" | "locked"; unlock?: string }[];
  welcome: { title: string; desc: string }[];
  lounge: { title: string; desc: string }[];
};
const CARD_BENEFITS: Record<string, CardBenefits> = {
  "Amex Travel Platinum": {
    milestones: [
      { earned: "15,000 MR points", desc: "Spend ₹1,90,000 in 365 days", status: "claimable" },
      { earned: "25,000 MR points", desc: "Spend ₹4,00,000 in 365 days", status: "locked", unlock: "SPEND ₹1,32,750/YR MORE TO UNLOCK" },
    ],
    welcome: [
      { title: "BookMyShow worth ₹3,000", desc: "Unlocked after your first transaction" },
      { title: "10,000 bonus MR Points",  desc: "Credited after your first spend" },
    ],
    lounge: [
      { title: "8 domestic airport lounge visits/year (Max 2 per quarter)", desc: "" },
      { title: "No International Lounge benefit availble on this card",     desc: "" },
    ],
  },
  "AU Zenith": {
    milestones: [
      { earned: "This card offers no milestone benefits.", desc: "Instead it offers accelerated benefits on your spends.", status: "claimable" },
    ],
    welcome: [
      { title: "1 travel voucher worth ₹12,500 via Travel (Yatra) / Hotels / Luxe gift card", desc: "Unlocked after your first transaction" },
    ],
    lounge: [
      { title: "Unlimited domestic airport lounge access", desc: "" },
      { title: "Unlimited international lounge access", desc: "Via Priority Pass + guest visits (limited)" },
    ],
  },
  "HSBC Travel One": {
    milestones: [
      { earned: "This card offers no milestone benefits", desc: "", status: "claimable" },
    ],
    welcome: [
      { title: "BookMyShow worth ₹3,000", desc: "Unlocked after your first transaction" },
      { title: "10,000 bonus MR Points",  desc: "Credited after your first spend" },
    ],
    lounge: [
      { title: "8 domestic airport lounge visits/year (Max 2 per quarter)", desc: "" },
      { title: "No International Lounge benefit availble on this card",     desc: "" },
    ],
  },
};

type CardFeesT = {
  annual: { fee: string; spendToWaive: string; remaining: string };
  joining: { fee: string; note: string };
  bank: { label: string; value: string }[];
  late: { range: string; fee: string }[];
};
const CARD_FEES: Record<string, CardFeesT> = {
  "Amex Travel Platinum": {
    annual: { fee: "₹5,310 + GST", spendToWaive: "Spend ₹4,00,000 in a year to waive next year's fee", remaining: "SPEND ₹1,32,750/YR MORE TO WAIVE" },
    joining: { fee: "₹5,310 + GST", note: "Value returned via welcome voucher" },
    bank: [
      { label: "Forex Markups",        value: "2.00%" },
      { label: "APR Fees",             value: "3.0% per month" },
      { label: "ATM Withdrawl",        value: "₹0 (No fee)" },
      { label: "Reward Redemption Fees", value: "₹0" },
      { label: "Fuel Surcharge",       value: "1% waiver" },
      { label: "Railway Surcharge",    value: "1%" },
      { label: "Rent Payment Fee",     value: "1%" },
      { label: "Cheque Payment Fee",   value: "N/A" },
      { label: "Cash Payment Fees",    value: "₹100 per payment" },
    ],
    late: [
      { range: "₹0 - ₹100",     fee: "₹0" },
      { range: "₹101 - ₹500",   fee: "₹500" },
      { range: "₹501 - ₹5000",  fee: "₹750" },
      { range: "₹5001 - ₹10000", fee: "₹1,200" },
    ],
  },
  "AU Zenith": {
    annual: { fee: "₹12,500 + GST", spendToWaive: "Spend ₹25,00,000 in a year to waive next year's fee", remaining: "SPEND ₹1,32,750/YR MORE TO WAIVE" },
    joining: { fee: "₹12,500 + GST", note: "Value returned via welcome voucher" },
    bank: [
      { label: "Forex Markups",        value: "2.00%" },
      { label: "APR Fees",             value: "3.0% per month" },
      { label: "ATM Withdrawl",        value: "₹0 (No fee)" },
      { label: "Reward Redemption Fees", value: "₹0" },
      { label: "Fuel Surcharge",       value: "1% waiver" },
      { label: "Railway Surcharge",    value: "1%" },
      { label: "Rent Payment Fee",     value: "1%" },
      { label: "Cheque Payment Fee",   value: "N/A" },
      { label: "Cash Payment Fees",    value: "₹100 per payment" },
    ],
    late: [
      { range: "₹0 - ₹100",      fee: "₹0" },
      { range: "₹101 - ₹500",    fee: "₹500" },
      { range: "₹501 - ₹5000",   fee: "₹750" },
      { range: "₹5001 - ₹10000", fee: "₹1,200" },
    ],
  },
  "HSBC Travel One": {
    annual: { fee: "₹4,999 + GST", spendToWaive: "Spend ₹4,00,000 in a year to waive next year's fee", remaining: "SPEND ₹2,88,000/YR MORE TO WAIVE" },
    joining: { fee: "₹4,999 + GST", note: "Value returned via welcome voucher" },
    bank: [
      { label: "Forex Markups",     value: "0.99%" },
      { label: "APR Fees",          value: "3.49% per month" },
      { label: "ATM Withdrawl",     value: "2.5% (min ₹500)" },
      { label: "Reward Redemption Fees", value: "₹0" },
      { label: "Fuel Surcharge",    value: "1% waiver" },
      { label: "Railway Surcharge", value: "1%" },
      { label: "Rent Payment Fee",  value: "1%" },
      { label: "Cheque Payment Fee", value: "N/A" },
      { label: "Cash Payment Fees", value: "₹100 per payment" },
    ],
    late: [
      { range: "₹0 - ₹100",      fee: "₹0" },
      { range: "₹101 - ₹500",    fee: "₹500" },
      { range: "₹501 - ₹5000",   fee: "₹750" },
      { range: "₹5001 - ₹10000", fee: "₹1,200" },
    ],
  },
};

type CardElig = { age: string; salary: string; rating: string; ntc: string; existing: string };
const CARD_ELIG: Record<string, CardElig> = {
  "Amex Travel Platinum": { age: "21-60 Yrs", salary: "6 LPA",  rating: "725+", ntc: "Yes", existing: "Yes" },
  "AU Zenith":            { age: "21-60 Yrs", salary: "6 LPA",  rating: "725+", ntc: "Yes", existing: "Yes" },
  "HSBC Travel One":      { age: "21-60 Yrs", salary: "5 LPA",  rating: "700+", ntc: "Yes", existing: "Yes" },
};

const SectionTitle = ({ children, style = {} }: any) => (
  <div style={{ fontSize: 16, fontWeight: 700, color: "#1C2A33", letterSpacing: "-0.01em", lineHeight: "22px", ...style }}>{children}</div>
);

const CardThumbHero = ({ name }: { name: string }) => {
  const img = CARD_IMG_MAP[name];
  return (
    <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ width: 140.56, height: 93.71, borderRadius: 7.02, overflow: "hidden", border: "0.6px solid rgba(255,255,255,0.2)", boxShadow: "0px 13px 54px rgba(23,59,3,0.15)", background: "linear-gradient(135deg,#2d3748,#1a202c)" }}>
        {img && <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 500, color: "#FFFFFF", textAlign: "center" }}>{name}</div>
    </div>
  );
};

export const PortfolioResultsScreen = () => {
  const { setScreen, portfolioNew } = useAppContext();
  // BUG-28: previously fell back to a hardcoded 3-card portfolio, showing ghost
  // cards when the user had selected nothing. Now redirect back to create.
  useEffect(() => {
    if (!portfolioNew || portfolioNew.length === 0) {
      setScreen?.("portfolio-create");
    }
  }, [portfolioNew, setScreen]);
  const newCards = (portfolioNew && portfolioNew.length > 0) ? portfolioNew : [];
  const ownedCardNames = CARDS.map((c: any) => c.name);
  const allPortfolioCards: string[] = [...newCards, ...ownedCardNames];

  const portfolio = useMemo(() => selectPortfolioMetrics(newCards), [newCards.join(",")]);
  const PORTFOLIO_PROFILE = portfolio.cards;
  const CATEGORIES = [{key:"Milestones", icon:"⭐"}, ...portfolio.categories];
  const TIMELINE = portfolio.timeline;
  const totalSpend = portfolio.totalSpend;
  const totalSavings = portfolio.totalSavings;

  // Tabs ─ pill sub-nav follows new cards
  const [tab, setTab] = useState<"how" | "benefits" | "fee" | "elig">("how");
  const [activeCard, setActiveCard] = useState<string>(newCards[0] || allPortfolioCards[0]);
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [activeCat, setActiveCat] = useState<string>("Shopping");
  const [breakdownOpen, setBreakdownOpen] = useState<any>(null);
  const cardsUsageRef = useRef<HTMLDivElement | null>(null);
  const catsRailRef = useRef<HTMLDivElement | null>(null);
  const onCategoryTagClick = useCallback((tag: string) => {
    if (CATEGORIES.find((c: any) => c.key === tag)) setActiveCat(tag);
    requestAnimationFrame(() => {
      const target = catsRailRef.current || cardsUsageRef.current;
      if (!target) return;
      let scroller: HTMLElement | null = target.parentElement;
      while (scroller && scroller !== document.body) {
        const oy = getComputedStyle(scroller).overflowY;
        if ((oy === "auto" || oy === "scroll") && scroller.scrollHeight > scroller.clientHeight) break;
        scroller = scroller.parentElement;
      }
      if (!scroller) scroller = (document.scrollingElement || document.documentElement) as HTMLElement;
      const tR = target.getBoundingClientRect();
      const sR = scroller.getBoundingClientRect();
      const desired = Math.max(0, scroller.scrollTop + (tR.top - sR.top) - 8);
      try { scroller.scrollTo({ top: desired, behavior: "smooth" }); } catch { scroller.scrollTop = desired; }
    });
  }, [CATEGORIES]);
  useEffect(() => {
    const rail = catsRailRef.current;
    if (!rail) return;
    const target = rail.querySelector(`[data-cat="${activeCat}"]`) as HTMLElement | null;
    if (!target) return;
    const rR = rail.getBoundingClientRect();
    const tR = target.getBoundingClientRect();
    const offsetInRail = (tR.left - rR.left) + rail.scrollLeft;
    const desired = Math.max(0, offsetInRail - (rR.width - tR.width) / 2);
    try { rail.scrollTo({ left: desired, behavior: "smooth" }); } catch { rail.scrollLeft = desired; }
  }, [activeCat]);
  const cat = CATEGORIES.find(c => c.key === activeCat) || CATEGORIES[1];
  const catWidth = (key: string) => key === "Milestones" ? 72 : key === "Shopping" ? 82 : 75;
  const activeIdx = CATEGORIES.findIndex(c => c.key === activeCat);
  let spotlightLeft = 10;
  for (let j = 0; j < activeIdx; j++) spotlightLeft += catWidth(CATEGORIES[j].key) + 2;
  spotlightLeft += (catWidth(activeCat) - 78) / 2;
  const [showApply, setShowApply] = useState(false);
  const [eligType, setEligType] = useState<"Salaried" | "Self Employed">("Self Employed");
  const [applyChoice, setApplyChoice] = useState<string>(newCards[0] || "");
  const [carouselPage, setCarouselPage] = useState(0);

  const totalCardsCount = allPortfolioCards.length;

  const benefits = CARD_BENEFITS[activeCard] || CARD_BENEFITS["Amex Travel Platinum"];
  const fees = CARD_FEES[activeCard] || CARD_FEES["AU Zenith"];
  const elig = CARD_ELIG[activeCard] || CARD_ELIG["AU Zenith"];

  return (
    <div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", background: "#F4F9FA", height: "100vh", display: "flex", flexDirection: "column" }}>
      <FL />
      <div data-scroll="1" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>

        {/* ─────── HERO HEADER ─────── */}
        <div style={{ background: "linear-gradient(180deg, #010904 -15%, #00356A 112%)", color: "#fff", padding: "0 0 28px", position: "relative" }}>
          {/* Status bar */}
          <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0", fontFamily: "-apple-system, system-ui", fontSize: 15, fontWeight: 700 }}>
            <span>9:41</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#fff"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></g></svg>
              <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#fff"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z" /><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z" /><circle cx="8" cy="10" r="1.2" /></g></svg>
              <svg width="18" height="11" viewBox="0 0 18 11" fill="none"><rect x="0.5" y="0.5" width="15" height="10" rx="2" stroke="#fff" /><rect x="2.4" y="2.4" width="9.8" height="6.2" rx="1.2" fill="#fff" /><rect x="16" y="3.5" width="1.7" height="4" rx="0.8" fill="#fff" /></svg>
            </div>
          </div>

          {/* Back + title */}
          <div style={{ position: "relative", padding: "12px 16px 0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
            <div onClick={() => setScreen("portfolio-create")} style={{ position: "absolute", left: 16, top: 12, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Your Portfolio</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{totalCardsCount} Cards in total</div>
            </div>
          </div>

          {/* Card carousel — show 3 cards horizontal-scroll */}
          <div data-scroll="1" style={{ display: "flex", gap: 18, padding: "0 18px", overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", marginBottom: 14 }}>
            {/* Show ALL 6 cards: 3 new (added in step 1) + 3 owned wallet cards */}
            {allPortfolioCards.map(c => <CardThumbHero key={c} name={c} />)}
          </div>

          {/* Pagination indicator — one dot per card, first active */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 22 }}>
            {allPortfolioCards.map((_, i) => (
              <div key={i} style={{ width: i === 0 ? 12 : 6, height: 6, borderRadius: 30, background: i === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)" }} />
            ))}
          </div>

          {/* Save upto / amount / cta */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 32px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Save Upto</div>
            <div className="legacy-serif" style={{ fontSize: 32, fontWeight: 800, lineHeight: "120%", letterSpacing: "-0.01em", background: "linear-gradient(180deg, #82FF8E 10.83%, #00E217 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0px 2px 4px rgba(73,203,133,0.2))", marginBottom: 6 }}>₹{f(totalSavings)}/yr</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 24 }}>by adding these Cards to your setup</div>
            <button onClick={() => setShowApply(true)} style={{ width: 187, height: 41, padding: "12px 20px", borderRadius: 10.17, border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 8.48, boxShadow: "0px 2px 6px rgba(0,0,0,0.15), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)", cursor: "pointer", fontFamily: FN }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>Apply for these cards</span>
              <svg width="6" height="9" viewBox="0 0 6 9" fill="none"><path d="M1 1l4 3.5L1 8" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        {/* ─────── TABS (Figma-accurate) ─────── */}
        <div style={{ background: "#FAFEFF", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 8px" }}>
          <div style={{ width: "100%", borderTop: "0.8px dashed #E3EBED" }} />
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0 12px" }}>
            {[
              { k: "how",      l: "How to use" },
              { k: "benefits", l: "Benefits" },
              { k: "fee",      l: "Fee" },
              { k: "elig",     l: "Eligibility and T&C" },
            ].map(t => {
              const active = tab === t.k;
              return (
                <div key={t.k} onClick={() => setTab(t.k as any)} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", padding: "14px 0 0", cursor: "pointer", position: "relative", flex: "0 0 auto" }}>
                  <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, lineHeight: "20px", letterSpacing: "0.1px", color: active ? "#36405E" : "#676F88", whiteSpace: "nowrap", padding: "0 0 14px" }}>{t.l}</span>
                  {active && <div style={{ position: "absolute", left: 2, right: 2, bottom: 0, height: 3, background: "#36405E", borderRadius: "100px 100px 0 0" }} />}
                </div>
              );
            })}
          </div>
          <div style={{ width: "100%", borderTop: "0.8px solid rgba(202,196,208,0.7)" }} />
        </div>

        {/* ─────── PER-TAB CARD PILL SUB-NAV (only for benefits/fee/elig) ─────── */}
        {tab !== "how" && (
          <div data-scroll="1" style={{ background: "#fff", display: "flex", gap: 10, padding: "16px 16px 8px", overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {[...newCards, "HSBC Travel One"].map(c => {
              const active = activeCard === c;
              return (
                <button key={c} onClick={() => setActiveCard(c)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 6, border: active ? "1px solid #1F2741" : "1px solid #E2E8EF", background: active ? "#1F2741" : "#fff", fontFamily: FN, fontSize: 12, fontWeight: 600, color: active ? "#fff" : "#1C2A33", cursor: "pointer" }}>{c}</button>
              );
            })}
          </div>
        )}

        {/* ─────── HOW TO USE TAB CONTENT (Figma-accurate) ─────── */}
        {tab === "how" && (<>
          {/* ── SECTION A: SPENDS DISTRIBUTION ── (CardDetailV2-exact, left-aligned title) */}
          <div style={{ padding: "28px 16px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={SECTION_TITLE}>Spends Distribution</div>
            <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 400, lineHeight: "160%", color: "#808387" }}>Based on your spend over last 365 days</div>
          </div>

          {/* Total + stacked bar */}
          <div style={{ padding: "16px 17px 24px", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            <div style={{ width: "100%", padding: "0 4px", display: "flex", justifyContent: "space-between", boxSizing: "border-box" }}>
              <span style={TINY_LABEL}>Total spends</span>
              <span style={{ ...TINY_LABEL, fontWeight: 700 }}>₹{f(totalSpend)}</span>
            </div>
            <div style={{ width: "100%", height: 56, background: "#FFFFFF", borderRadius: 12, padding: 4, display: "flex", gap: 4, boxShadow: "inset 0 0.9px 1.8px rgba(0,0,0,0.15), inset 0.9px -1.8px 1.8px rgba(0,0,0,0.08)", boxSizing: "border-box" }}>
              {PORTFOLIO_PROFILE.filter(w => w.pct > 0).map((w, i) => (
                <div key={i} title={w.name} style={{ flexBasis: `${w.pct}%`, height: 48, borderRadius: 10, background: `linear-gradient(180deg,${w.c1} 0%,${w.c2} 100%)`, boxShadow: "inset 0 3.5px 3.4px rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 36 }}>
                  <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 700, lineHeight: "140%", color: "#FFFFFF" }}>{w.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Header strip — YOU SPEND / SAVINGS */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F3F6F7", border: "1px solid #E7ECEF", marginTop: 24 }}>
            <span style={TINY_LABEL}>You spend</span>
            <span style={{ ...TINY_LABEL, fontWeight: 700 }}>Savings</span>
          </div>

          {/* Per-card rows */}
          {PORTFOLIO_PROFILE.map((w, i) => {
            const isFirst = i === 0;
            const wImg = CARD_IMG_MAP[w.name];
            return (
              <div key={i} style={{ padding: "18px 16px", background: isFirst ? "#ECEBFF" : "#FFFFFF", borderBottom: "1px dashed rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                  <div style={{ width: 54, height: 36, borderRadius: 2.7, overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg,${w.c1},${w.c2})`, border: "0.225px solid rgba(255,255,255,0.2)", filter: "drop-shadow(0px 4.4px 2.6px rgba(20,21,72,0.1)) drop-shadow(0px 2px 2px rgba(20,21,72,0.17))" }}>
                    {wImg && <img src={wImg} alt={w.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2.04, background: `linear-gradient(180deg,${w.c1},${w.c2})`, boxShadow: "inset 0 3.5px 3.4px rgba(255,255,255,0.25)", flexShrink: 0 }} />
                      <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.01em", color: "rgba(54,64,96,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</span>
                    </div>
                    <span style={{ fontFamily: FN, fontSize: 14, fontWeight: 500, lineHeight: "145%", color: "#364060" }}>₹{f(w.spend)}</span>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: FN, fontSize: 14, fontWeight: 500, lineHeight: "145%", color: "#139366" }}>{w.save > 0 ? `Save ₹${f(w.save)}` : "-"}</span>
                    {w.breakdown && w.save > 0 && (
                      <SavingsInfoIcon onClick={(e: any) => { e.stopPropagation(); setBreakdownOpen({
                        cardName: (w.name + " Credit Card").toUpperCase(),
                        last4: w.last4,
                        cardImg: wImg || CARD_IMG_MAP[w.name],
                        newCard: !!w.newCard,
                        spend: "₹" + f(w.spend) + " / yr",
                        save: "₹" + f(w.save) + "/yr",
                        savingsOnSpends: w.breakdown.savingsOnSpends,
                        milestoneBenefits: w.breakdown.milestoneBenefits,
                        annualFee: w.breakdown.annualFee,
                      }); }} />
                    )}
                  </span>
                </div>
                {w.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {w.tags.map((t, j) => (
                      <div key={j} onClick={() => onCategoryTagClick(t)} style={{ padding: "6px 12px", background: "#FFFFFF", border: "1px solid rgba(99,90,200,0.18)", borderRadius: 999, fontFamily: FN, fontSize: 11, fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.005em", color: "#6560A1", cursor: "pointer", boxShadow: "0 1px 2px rgba(63,66,70,0.04)" }}>{t}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Total footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "linear-gradient(90deg, #F5F9FA 0%, #F0FFEB 100%)", borderTop: "1px solid rgba(19,147,102,0.2)", borderBottom: "1px solid rgba(19,147,102,0.2)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: FN, fontSize: 14, fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.01em", color: "rgba(54,64,96,0.6)" }}>Total:</span>
              <span style={{ fontFamily: FN, fontSize: 14, fontWeight: 700, lineHeight: "150%", letterSpacing: "-0.01em", color: "#364060" }}>₹{f(totalSpend)}/yr</span>
            </div>
            <span style={{ fontFamily: FN, fontSize: 14, fontWeight: 700, lineHeight: "100%", color: "#139366" }}>₹{f(totalSavings)}/yr</span>
          </div>

          {/* ── SECTION B: CARDS USAGE ── (left-aligned title, T-shape spotlight band) */}
          <div ref={cardsUsageRef} style={{ padding: "32px 16px 16px", scrollMarginTop: 12 }}>
            <div style={SECTION_TITLE}>See how to spend on</div>
          </div>
          <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 91, height: 109, backgroundImage: "linear-gradient(180deg, rgba(69,137,255,0.3) 0%, rgba(184,202,247,0.3) 45%, rgba(245,249,250,0.3) 100%)", backgroundSize: "100% 218px", backgroundPosition: "0 -91px", backgroundRepeat: "no-repeat", zIndex: 0 }} />
            <div className="cards-usage-spotlight" style={{ position: "absolute", top: 0, left: spotlightLeft, width: 78, height: 94, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundImage: "linear-gradient(180deg, rgba(69,137,255,0.3) 0%, rgba(184,202,247,0.3) 45%, rgba(245,249,250,0.3) 100%)", backgroundSize: "100% 218px", backgroundPosition: "0 0", backgroundRepeat: "no-repeat", transition: "left 220ms cubic-bezier(0.32,0.72,0,1)", zIndex: 0 }} />
            <div ref={catsRailRef} data-scroll="1" style={{ position: "absolute", top: 12, left: 0, right: 0, display: "flex", gap: 2, padding: "0 10px", overflowX: "auto", zIndex: 1 }}>
              {CATEGORIES.map((c, i) => {
                const active = activeCat === c.key;
                return (
                  <div key={i} data-cat={c.key} onClick={() => c.key !== "Milestones" && setActiveCat(c.key)} style={{ flex: "0 0 auto", width: catWidth(c.key), height: 84, padding: "5px", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: c.key === "Milestones" ? "default" : "pointer", position: "relative" }}>
                    <div style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {c.key === "Milestones" ? (
                        <Star size={32} fill="#FFD82C" color="#EF8F03" strokeWidth={1.5} />
                      ) : (
                        <img src={c.icon} alt={c.key} style={{ width: 48, height: 48, objectFit: "contain" }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                      )}
                    </div>
                    <span style={{ fontFamily: FN, fontSize: 12, fontWeight: active ? 700 : 400, lineHeight: active ? "16px" : "14px", textAlign: "center", letterSpacing: "0.01em", color: active ? "#0064E0" : "#000000" }}>{c.key}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", top: 114, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px", zIndex: 1 }}>
              <span style={{ fontFamily: FN, fontSize: 14, fontWeight: 500, lineHeight: "16px", color: "rgba(54,64,96,0.8)", textAlign: "center" }}>Save Upto</span>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 4, marginTop: 4 }}>
                <span style={{ fontFamily: "'IBM Plex Serif',Georgia,serif", fontSize: 30, fontWeight: 700, lineHeight: "110%", color: "#146CD5" }}>₹</span>
                <span className="legacy-serif" style={{ fontFamily: "'Blacklist','Google Sans',serif", fontSize: 32, fontWeight: 800, lineHeight: "120%", letterSpacing: "0.02em", color: "#146CD5" }}>{f(cat.save || 0)}/yr</span>
              </div>
              <div style={{ fontFamily: FN, fontSize: 12, fontWeight: 400, lineHeight: "150%", color: "rgba(0,0,0,0.6)", textAlign: "center", marginTop: 4 }}>Based on {cat.key} Spends of ₹{f(cat.spend || 0)}/yr</div>
            </div>
          </div>

          {/* "Cards to use" white box */}
          {cat.cards && (
            <div style={{ margin: "8px 17px 0", background: "#FFFFFF", borderRadius: 16, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 1px 0 rgba(255,255,255,0.19), inset 0 0.9px 1.8px rgba(0,0,0,0.15), inset 0.9px -1.8px 1.8px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                <span style={TINY_LABEL}>Cards to use</span>
                <span style={{ ...TINY_LABEL, fontWeight: 700 }}>You spend</span>
              </div>
              <div style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.1)" }} />
              {CATEGORIES.find(c => c.key === activeCat)?.cards?.map((cc, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 54, height: 36, borderRadius: 2.7, overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg,${cc.c1},${cc.c2})`, border: "0.225px solid rgba(255,255,255,0.2)", filter: "drop-shadow(0px 8px 3.2px rgba(20,21,72,0.03)) drop-shadow(0px 4.4px 2.6px rgba(20,21,72,0.1)) drop-shadow(0px 2px 2px rgba(20,21,72,0.17)) drop-shadow(0px 0.4px 1px rgba(20,21,72,0.2))" }}>
                      {CARD_IMG_MAP[cc.name] && <img src={CARD_IMG_MAP[cc.name]} alt={cc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 9, height: 9, borderRadius: 2.2, background: `linear-gradient(180deg,${cc.c1} 0%,${cc.c2} 100%)`, boxShadow: "inset 0 3.9px 3.7px rgba(255,255,255,0.25)", flexShrink: 0 }} />
                          <span style={{ fontFamily: FN, fontSize: 13, fontWeight: 500, lineHeight: "18px", color: "#36405E" }}>{cc.name}</span>
                        </div>
                        <span style={{ fontFamily: FN, fontSize: 11, fontWeight: 500, lineHeight: "18px", color: "#36405E", whiteSpace: "nowrap" }}>₹{f(cc.spend)}</span>
                      </div>
                      <span style={{ fontFamily: FN, fontSize: 11, fontWeight: 400, lineHeight: "145%", color: "#808387" }}>{cc.caption}</span>
                    </div>
                  </div>
                  {i < cat.cards!.length - 1 && <div style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.1)" }} />}
                </div>
              ))}
              <div style={{ height: 0, borderTop: "1px dashed rgba(0,0,0,0.1)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: "0 4px" }}><span style={TINY_LABEL}>Spend distribution</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  {CATEGORIES.find(c => c.key === activeCat)?.cards?.map((cc, i) => (
                    <div key={i} style={{ flex: `${cc.share} 1 0`, minWidth: 60, height: 24, borderRadius: 6.04, background: `linear-gradient(180deg,${cc.c1} 0%,${cc.c2} 100%)`, boxShadow: "inset 0 3.5px 3.4px rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 700, lineHeight: "140%", color: "#FFFFFF" }}>{cc.share}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION C: SPEND WITH THESE CARDS ── */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F3F6F7", border: "1px solid #E7ECEF" }}>
              <span style={TINY_LABEL}>How to spend</span>
              <span style={{ ...TINY_LABEL, fontWeight: 700 }}>{period === "monthly" ? "Per month" : "Per year"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 8px 8px 16px", background: "linear-gradient(90deg, #F5F9FA 0%, #D6E6FB 100%)" }}>
              <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, lineHeight: "135%", letterSpacing: "-0.02em", color: "#495270" }}>Filter Spends &amp; Savings</span>
              <div style={{ display: "flex", background: "#FFFFFF", borderRadius: 8, boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.11), inset 0 0.9px 1.8px rgba(0,0,0,0.15)", height: 28 }}>
                {(["monthly", "yearly"] as const).map((p, i) => (
                  <div key={p} onClick={() => setPeriod(p)} style={{ padding: "5px 16px", borderRadius: p === "monthly" ? "8px 0 0 8px" : "0 8px 8px 0", display: "flex", alignItems: "center", cursor: "pointer", borderRight: i === 0 ? "1px solid rgba(43,84,134,0.2)" : "none" }}>
                    <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, lineHeight: "150%", color: period === p ? "#0064E0" : "#1C2A33" }}>{p === "monthly" ? "Monthly" : "Yearly"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ position: "relative", padding: "24px 16px 8px" }}>
              {TIMELINE.map((t, i) => (
                <div key={i} style={{ position: "relative", display: "flex", gap: 12, paddingBottom: i === TIMELINE.length - 1 ? 0 : 24 }}>
                  <div style={{ position: "relative", width: 56, flexShrink: 0 }}>
                    {t.kind === "card" ? (
                      <div style={{ width: 56, height: 37, borderRadius: 2.8, overflow: "hidden", background: `linear-gradient(135deg,${(t as any).c1},${(t as any).c2})`, filter: "drop-shadow(0px 4.5px 2.7px rgba(20,21,72,0.1))" }}>
                        {CARD_IMG_MAP[(t as any).card] && <img src={CARD_IMG_MAP[(t as any).card]} alt={(t as any).card} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                    ) : (
                      <div style={{ width: 24, height: 24, marginLeft: 16, borderRadius: "50%", border: "0.5px solid #B98F8F", background: "#FCF5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Lock size={11} color="#B98F8F" strokeWidth={2} />
                      </div>
                    )}
                    {i < TIMELINE.length - 1 && <div style={{ position: "absolute", left: 28, top: t.kind === "card" ? 44 : 30, bottom: -24, width: 0, borderLeft: "1px dashed #C1CBD0" }} />}
                  </div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, lineHeight: "150%", color: "#36405E" }}>{t.title}</div>
                      <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 400, lineHeight: "155%", color: "#808387", marginTop: 4 }}>{t.caption}</div>
                    </div>
                    {t.kind === "card" && (
                      <span style={{ fontFamily: FN, fontSize: 14, fontWeight: 700, lineHeight: "18px", color: "#139366", marginLeft: 8, whiteSpace: "nowrap" }}>₹{f(period === "monthly" ? (t as any).monthly : (t as any).yearly)}/{period === "monthly" ? "mn" : "yr"}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ─────── BENEFITS TAB CONTENT (lifted from CardDetailV2) ─────── */}
        {tab === "benefits" && (<>
          {/* ── MILESTONE BENEFITS ── */}
          <div style={{ padding: "24px 16px 0" }}>
            <div style={SECTION_TITLE}>Milestone Benefits</div>
          </div>
          <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column" }}>
            {benefits.milestones.map((m, i) => {
              const isClaim = m.status === "claimable";
              const isLast = i === benefits.milestones.length - 1;
              const nextIsLocked = !isLast && benefits.milestones[i + 1].status !== "claimable";
              const ROW_GAP = 19;
              return (
                <div key={i} style={{ display: "flex", gap: 14, position: "relative", marginBottom: isLast ? 0 : ROW_GAP }}>
                  <div style={{ width: 30, flexShrink: 0, position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                    {isClaim ? (
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#08CF6F", border: "1px solid #08CF6F", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 14, position: "relative", zIndex: 1 }}>
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      </div>
                    ) : (
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#F5FCF9", border: "0.6px solid #8FB9AA", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 11, position: "relative", zIndex: 1 }}>
                        <Lock size={14} color="#8FB9AA" strokeWidth={2} />
                      </div>
                    )}
                    {!isLast && (
                      <div style={{ position: "absolute", top: isClaim ? 14 + 24 : 11 + 30, bottom: -ROW_GAP - (nextIsLocked ? 11 : 14), left: "50%", width: 0, borderLeft: nextIsLocked ? "1px dashed #C1CBD0" : "1px solid #08CF6F" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, background: "#FFFFFF", border: isClaim ? "1px solid #25DC9B" : "none", boxShadow: "0 0.6px 4.4px rgba(63,66,70,0.11)", borderRadius: 8, padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontFamily: FN, fontSize: 14, fontWeight: 500, lineHeight: "21px", color: "#36405E" }}>{m.earned}</div>
                      {m.desc && <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 400, lineHeight: "155%", color: "#808387" }}>{m.desc}</div>}
                    </div>
                    {isClaim && m.unlock === undefined && (
                      <div style={{ alignSelf: "flex-start", padding: "8px", background: "linear-gradient(90deg, #E0F9ED 0%, rgba(224,249,237,0) 100%), linear-gradient(90deg, #FEFEDD 0%, rgba(249,249,224,0) 100%)", borderRadius: 4 }}>
                        <span style={{ fontFamily: FN, fontSize: 9, fontWeight: 700, lineHeight: "120%", letterSpacing: "0.1em", textTransform: "uppercase", color: "#08CF6F" }}>Claimable on current distribution</span>
                      </div>
                    )}
                    {m.unlock && (
                      <div style={{ alignSelf: "flex-start", padding: "8px", background: "linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)", borderRadius: 4 }}>
                        <span style={{ fontFamily: FN, fontSize: 9, fontWeight: 700, lineHeight: "120%", letterSpacing: "0.1em", textTransform: "uppercase", color: "#0897CF" }}>{m.unlock}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ height: 10, background: "rgba(23,73,47,0.06)" }} />

          {/* ── WELCOME BENEFITS ── */}
          <div style={{ padding: "24px 16px 16px" }}>
            <div style={SECTION_TITLE}>Welcome Benefits</div>
          </div>
          <div style={{ padding: "0 16px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
            {benefits.welcome.map((w, i) => (
              <div key={i} style={{ background: "#FFFFFF", boxShadow: "0 0.6px 4.4px rgba(63,66,70,0.11)", borderRadius: 8, padding: "12px 12px 14px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 45, height: 42, background: "#F7F5F5", flexShrink: 0, borderRadius: 4 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontFamily: FN, fontSize: 14, fontWeight: 500, lineHeight: "21px", color: "#36405E" }}>{w.title}</div>
                  <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 400, lineHeight: "160%", color: "#808387" }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 10, background: "rgba(23,73,47,0.06)" }} />

          {/* ── LOUNGE & ADDITIONAL BENEFITS ── */}
          <div style={{ padding: "24px 16px 16px" }}>
            <div style={SECTION_TITLE}>Lounge and Additional Benefits</div>
          </div>
          <div style={{ padding: "0 16px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
            {benefits.lounge.map((l, i) => {
              const muted = (l.title || "").toLowerCase().includes("no ");
              return (
                <div key={i} style={{ background: "linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF", border: "1px solid #E8EBED", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: muted ? "center" : "flex-start", gap: 16, opacity: muted ? 0.7 : 1 }}>
                  <div style={{ width: 45, height: 42, background: "#F7F5F5", flexShrink: 0, borderRadius: 4 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontFamily: FN, fontSize: muted ? 12 : 14, fontWeight: 500, lineHeight: muted ? "150%" : "21px", color: muted ? "rgba(54,64,94,0.8)" : "#36405E" }}>{l.title}</div>
                    {l.desc && <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 400, lineHeight: "160%", color: "#808387" }}>{l.desc}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {/* ─────── FEE TAB CONTENT ─────── */}
        {tab === "fee" && (
          <div style={{ padding: "12px 16px 32px" }}>
            <SectionTitle style={{ marginBottom: 14 }}>Fees & Waivers</SectionTitle>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 12, padding: "16px 14px", background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#FEE2E2", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1C2A33" }}>Annual Fee ({fees.annual.fee})</div>
                  <div style={{ fontSize: 11, color: "#7B8197", marginTop: 4 }}>{fees.annual.spendToWaive}</div>
                  <div style={{ marginTop: 10, fontSize: 9, fontWeight: 700, color: "#3B82F6", background: "#EFF6FF", padding: "6px 10px", borderRadius: 6, letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-block" }}>{fees.annual.remaining}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, padding: "16px 14px", background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#FEE2E2", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1C2A33" }}>Joining Fee ({fees.joining.fee})</div>
                  <div style={{ fontSize: 11, color: "#7B8197", marginTop: 4 }}>{fees.joining.note}</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 9, fontWeight: 700, color: "#7B8197", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Additional Bank Fee</div>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
              {fees.bank.map((b, i) => (
                <div key={i} style={{ display: "flex", borderBottom: i === fees.bank.length - 1 ? "none" : "1px solid #F1F3F7" }}>
                  <div style={{ flex: 1, padding: "14px 16px", fontSize: 12, fontWeight: 500, color: "#1C2A33", background: "#F7F8F9" }}>{b.label}</div>
                  <div style={{ flex: 1, padding: "14px 16px", fontSize: 12, fontWeight: 500, color: "#46505F", borderLeft: "1px solid #EEEEEE" }}>{b.value}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 9, fontWeight: 700, color: "#7B8197", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Fee on Late Bill Payment</div>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", background: "#F7F8F9" }}>
                <div style={{ flex: 1, padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#7B8197", letterSpacing: "0.05em", textTransform: "uppercase" }}>Amount Due</div>
                <div style={{ flex: 1, padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#7B8197", letterSpacing: "0.05em", textTransform: "uppercase", borderLeft: "1px solid #EEEEEE" }}>Late Payment Fee</div>
              </div>
              {fees.late.map((l, i) => (
                <div key={i} style={{ display: "flex", borderTop: "1px solid #F1F3F7" }}>
                  <div style={{ flex: 1, padding: "14px 16px", fontSize: 12, fontWeight: 500, color: "#1C2A33" }}>{l.range}</div>
                  <div style={{ flex: 1, padding: "14px 16px", fontSize: 12, fontWeight: 500, color: "#46505F", borderLeft: "1px solid #EEEEEE" }}>{l.fee}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────── ELIGIBILITY AND T&C TAB CONTENT ─────── */}
        {tab === "elig" && (
          <div style={{ padding: "12px 16px 32px" }}>
            <SectionTitle style={{ marginBottom: 14 }}>Eligibility Criteria</SectionTitle>

            {/* Salaried/Self Employed toggle */}
            <div style={{ display: "flex", padding: 4, background: "#F1F4F9", borderRadius: 10, marginBottom: 16 }}>
              {(["Salaried", "Self Employed"] as const).map(t => {
                const a = eligType === t;
                return (
                  <div key={t} onClick={() => setEligType(t)} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: a ? "#1C2A33" : "#7B8197", background: a ? "#fff" : "transparent", boxShadow: a ? "0 1px 2px rgba(0,0,0,0.06)" : "none", cursor: "pointer", textAlign: "center" }}>{t}</div>
                );
              })}
            </div>

            {/* 5-tile criteria grid (2 large + 3 small) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10, padding: "14px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7B8197" }}>Age<br />Criteria</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1C2A33", marginTop: 12 }}>{elig.age}</div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10, padding: "14px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7B8197" }}>Salary<br />Criteria</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1C2A33", marginTop: 12 }}>{elig.salary}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
              <div style={{ background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10, padding: "12px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7B8197" }}>Credit<br />Rating*</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1C2A33", marginTop: 12 }}>{elig.rating}</div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10, padding: "12px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7B8197" }}>New to credit<br />allowed</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1C2A33", marginTop: 12 }}>{elig.ntc}</div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10, padding: "12px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7B8197" }}>Existing Bank<br />Customer<br />Allowed</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1C2A33", marginTop: 6 }}>{elig.existing}</div>
              </div>
            </div>

            <SectionTitle style={{ marginBottom: 14 }}>Check if you are eligible</SectionTitle>
            <div style={{ background: "#fff", border: "1px solid #E8F0F1", borderRadius: 12, padding: "16px" }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1C2A33", marginBottom: 6 }}>Pin Code</div>
                <input placeholder="Enter 6 Digits" style={{ width: "100%", height: 42, padding: "0 14px", border: "1px solid #D3E4FA", borderRadius: 8, fontSize: 13, fontFamily: FN, boxSizing: "border-box", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1C2A33", marginBottom: 6 }}>Monthly In Hand Income</div>
                <input placeholder="Enter amount" style={{ width: "100%", height: 42, padding: "0 14px", border: "1px solid #D3E4FA", borderRadius: 8, fontSize: 13, fontFamily: FN, boxSizing: "border-box", outline: "none" }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1C2A33", marginBottom: 8 }}>Select Income Type</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {(["Salaried", "Self Employed"] as const).map(t => {
                  const a = eligType === t;
                  return (
                    <div key={t} onClick={() => setEligType(t)} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: a ? "1px solid #1F2741" : "1px solid #D3E4FA", background: a ? "#EFF6FF" : "#fff", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1C2A33" }}>
                      <span style={{ fontSize: 18 }}>{t === "Salaried" ? "💼" : "🧰"}</span>{t}
                    </div>
                  );
                })}
              </div>
              <button disabled style={{ width: "100%", height: 42, borderRadius: 10, border: "none", background: "#EFF6FF", color: "#3B82F6", fontSize: 13, fontWeight: 700, cursor: "not-allowed", fontFamily: FN }}>Check Eligibility</button>
              <div style={{ fontSize: 10, fontWeight: 500, color: "#F87171", marginTop: 12, lineHeight: 1.5 }}>Don't worry! Entering this information will not affect your Credit Score and we will not share this info with anyone</div>
            </div>

            <SectionTitle style={{ marginTop: 28 }}>Terms and Conditions</SectionTitle>
          </div>
        )}
      </div>

      {/* ─────── APPLY POPUP ─────── */}
      {showApply && (
        <div onClick={() => setShowApply(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }}>
          <div onClick={e => e.stopPropagation()} className="fade-up" style={{ width: "100%", background: "#FFFFFF", borderRadius: "24px 24px 0 0", padding: "16px 22px 30px", boxShadow: "0 -10px 40px rgba(0,0,0,0.15)", maxWidth: 400, fontFamily: FN }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.1)", margin: "0 auto 16px" }} />
            <div className="legacy-serif" style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#1C2A33", marginBottom: 18 }}>Choose the card you want to apply</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {newCards.map(c => {
                const a = applyChoice === c;
                return (
                  <div key={c} onClick={() => setApplyChoice(c)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: a ? "1px solid #16A34A" : "1px solid #E8F0F1", background: a ? "linear-gradient(180deg,#F7FAF7 0%,#ECF9F0 26%)" : "#fff", boxShadow: a ? "0 1px 6px rgba(22,163,74,0.1)" : "0 1px 4px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                    <div style={{ width: 52, height: 34, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: "1px solid #E5E7EB" }}>
                      {CARD_IMG_MAP[c] && <img src={CARD_IMG_MAP[c]} alt={c} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: a ? "#16A34A" : "#1C2A33" }}>{c}</div>
                    {a && (
                      <div style={{ width: 20, height: 20, borderRadius: 10, background: "linear-gradient(151deg,#0ED28D 7.75%,#14875F 91.86%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="8" viewBox="0 0 12 9" fill="none"><path d="M1 4l3 3 7-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowApply(false)} style={{ width: "100%", height: 48, borderRadius: 10, border: "none", background: "linear-gradient(90deg, #222941 0%, #101C43 100%)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FN }}>Take me to the application page →</button>
          </div>
        </div>
      )}
      {breakdownOpen && (
        <SavingsBreakdownSheet data={breakdownOpen} onClose={() => setBreakdownOpen(null)} />
      )}
    </div>
  );
};
