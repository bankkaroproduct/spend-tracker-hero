// @ts-nocheck
import { useState } from "react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { CALC_BRANDS, CALC_CATS, CALC_CARDS, SPEND_BRANDS, CD, CARD_IMG_MAP } from "@/data/simulation/legacy";
import { USER_CARDS } from "@/data/simulation/inputs";
import { calculateResponses } from "@/data/simulation/mockApi";
import { calculateRewardsForInput, selectCalculatorMetrics } from "@/data/simulation/metrics";
import { useAppContext } from "@/store/AppContext";

const cardColors = { "HSBC Travel One": ["#0c2340", "#1a5276"], "Axis Flipkart": ["#5b2c8e", "#8b5cf6"], "HSBC Live+": ["#006d5b", "#00a086"] };
const howToEarn = { "HSBC Travel One": { "default": "Use your HSBC Travel One card directly at checkout. Earns 1 point per ₹150 on domestic spends, 6x on international. Redeem on HSBC Rewards catalogue for travel vouchers.", "MakeMyTrip": "Pay on MakeMyTrip with HSBC Travel One. Earns 3x points on travel bookings. Points best redeemed for flights via HSBC SmartBuy.", "Uber": "Book rides on Uber. Earns 2x points as a dining/transport merchant on HSBC Travel One." }, "Axis Flipkart": { "default": "Use Axis Flipkart at checkout. Cashback auto-credited to your next statement. No manual redemption needed.", "Flipkart": "Pay on Flipkart app/website. 5% cashback auto-credited. Works on all Flipkart purchases except gift cards & EMI.", "Myntra": "Shop on Myntra app/website. 4% cashback as preferred merchant. Cashback credited next billing cycle.", "Swiggy": "Order on Swiggy app. 4% cashback as preferred merchant. Doesn't apply to Instamart.", "Uber": "Book rides on Uber app. 4% cashback as preferred merchant. Credited to statement." }, "HSBC Live+": { "default": "Use HSBC Live+ anywhere. Flat 1.5% unlimited cashback on all spends, auto-credited to statement. No categories, no caps, no hassle." } };
const getHowTo = (cardName, brand) => howToEarn[cardName]?.[brand] || howToEarn[cardName]?.["default"] || "Use this card directly at the merchant checkout to earn rewards.";
const catSpendGuide = { "Shopping": "Best on Flipkart (5%), Amazon (2.5%), Myntra (7.5%). Use Axis Flipkart for Flipkart/Myntra, HSBC Live+ for Amazon.", "Groceries": "BigBasket & Instamart earn 1-4%. Use Axis Flipkart for Instamart (4% preferred), others earn base rate.", "Food Delivery": "Swiggy earns 4% on Axis Flipkart. Zomato/Dominos earn 2.5% on HSBC Live+ as partner.", "Travel": "Cleartrip earns 5% on Axis Flipkart. MakeMyTrip/Yatra earn 2.5% on HSBC Live+.", "Bills & Recharges": "Utility payments earn only 0.25% (1 RP/₹100). HSBC Travel One earns on insurance & utility; others exclude.", "Fuel": "All cards offer 1% surcharge waiver (₹400-₹4000). No reward points on fuel transactions.", "Entertainment": "BookMyShow earns 2.5% on HSBC Live+. HSBC Travel One gives 25% off movie tickets.", "Health": "Apollo 24|7 & Netmeds earn 2.5% on HSBC Live+ as 10X partners.", "Cab Rides": "Uber earns 4% on Axis Flipkart as preferred merchant. Ola earns base rate only.", "Dining Out": "HSBC Travel One offers Culinary Treats dining discounts at 1500+ restaurants." };

const CASHKARO_CTA_SHADOW = "0.290071px 0.290071px 0.410222px -0.489341px rgba(0, 0, 0, 0.26), 0.789939px 0.789939px 1.11714px -0.978681px rgba(0, 0, 0, 0.247), 1.73442px 1.73442px 2.45284px -1.46802px rgba(0, 0, 0, 0.23), 3.85002px 3.85002px 5.44475px -1.95736px rgba(0, 0, 0, 0.192), 9.13436px 9.13436px 13.8406px -2.4467px rgba(0, 0, 0, 0.2), -0.326227px -0.326227px 0px rgba(0, 0, 0, 0.686), inset 0.652454px 0.652454px 0.652454px rgba(255, 255, 255, 0.7), inset -0.652454px -0.652454px 0.652454px rgba(0, 0, 0, 0.23)";

const calcSectionTitleStyle = { fontSize: 10, lineHeight: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "rgba(68, 63, 63, 0.7)", marginBottom: 10, marginTop: 0 };

export const CalcScreen = () => {
  const {
    setScreen,
    selBrand, setSelBrand,
    calcAmt, setCalcAmt,
    calcPopup, setCalcPopup,
    calcResult, setCalcResult,
    searchQ, setSearchQ,
    calcTab, setCalcTab,
    calcFilter, setCalcFilter,
    howExpanded, setHowExpanded,
  } = useAppContext();

  const [oneTimeSpend, setOneTimeSpend] = useState(true);
  const [multiTxnSpend, setMultiTxnSpend] = useState(false);
  const [cashkaroExpanded, setCashkaroExpanded] = useState(false);
  const [tracksExpanded, setTracksExpanded] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [bestPlacesPopup, setBestPlacesPopup] = useState<string | null>(null); // card name when open

  const _metrics = selectCalculatorMetrics();
  const CALC_CARDS = _metrics.cards;
  const allB = Object.entries(CALC_BRANDS).flatMap(([cat, bs]: any) => bs.map((b: any) => ({ ...b, category: cat })));
  const hits = searchQ.trim() ? allB.filter((b: any) => b.name.toLowerCase().includes(searchQ.toLowerCase())) : null;
  const bestR = (q: string) => Math.max(...CALC_CARDS.map((cc: any) => cc.rates[q] ?? cc.rates.default));
  const fmtA = (v: string) => { const n = v.replace(/[^\d]/g, ""); return n ? parseInt(n).toLocaleString("en-IN") : ""; };
  const catKeys = Object.keys(CALC_BRANDS);
  const topBrandNames = SPEND_BRANDS.slice(0, 8).map((b: any) => b.name);
  const topBrandsFromCalc = allB.filter((b: any) => topBrandNames.includes(b.name));
  const filteredBrands = calcFilter === "All" ? { "Your Top Brands": topBrandsFromCalc, ...CALC_BRANDS } : calcFilter === "Your Top Brands" ? { "Your Top Brands": topBrandsFromCalc } : { [calcFilter]: CALC_BRANDS[calcFilter] || [] };
  const dc = () => {
    const a = parseInt(calcAmt.replace(/,/g, "")) || 0;
    if (!a) return;
    const isBrandMode = calcTab === "Brands";
    const r = calculateRewardsForInput(a, selBrand?.name || "this category", !isBrandMode);
    setCalcResult({ results: r, query: selBrand?.name || "this category", amount: a, brandName: selBrand?.name, isCategory: !isBrandMode });
    setCalcPopup(false);
    setHowExpanded(null);
  };

  const brandImgMap: Record<string,string>={"Amazon":"/brands/amazon.png","Flipkart":"/brands/flipkart.png","Myntra":"/brands/myntra.png","Swiggy":"/brands/swiggy.png","Zomato":"/brands/zomato.png","BigBasket":"/brands/bb.png","Adidas":"/brands/adiddas.png","MuscleBlaze":"/brands/muscle-blaze.png"};

  /* Results page */
  if (calcResult) {
    const best = calcResult.results[0];
    const bestCardImg = CARD_IMG_MAP[best.name];
    const amountNum = calcResult.amount;
    const pickBrand = (name: string) => allB.find((b: { name: string }) => b.name === name);
    const bAmazon = pickBrand("Amazon");
    const bMyntra = pickBrand("Myntra");
    const bSwiggy = pickBrand("Swiggy");
    const bUber = pickBrand("Uber");
    const altBrands = [
      { name: "Amazon", icon: bAmazon?.icon ?? "📦", tileBg: "#FFE8DC", save: Math.round(amountNum * (bAmazon?.rate ?? 0) / 100) },
      { name: "Myntra", icon: bMyntra?.icon ?? "👗", tileBg: "#FFDCF4", save: Math.round(amountNum * (bMyntra?.rate ?? 0) / 100) },
      { name: "Shopclues", icon: "🧭", tileBg: "#D9FFF9", save: 0 },
      { name: "Swiggy", icon: bSwiggy?.icon ?? "🍔", tileBg: "#FFEFD6", save: Math.round(amountNum * (bSwiggy?.rate ?? 0) / 100) },
      { name: "Uber", icon: bUber?.icon ?? "🚗", tileBg: "#E8E5FF", save: Math.round(amountNum * (bUber?.rate ?? 0) / 100) },
      { name: "Tata CLiQ", icon: "🛍️", tileBg: "#FFE0E0", save: 0 },
    ];
    const bestRewardLabel = best.type?.toLowerCase().includes("point") ? `${best.rate}% REWARDS` : `${best.rate}% CASHBACK ON ${(calcResult.query || "").toUpperCase()}`;

    const buildCard = (cfg: any) => {
      const monthSpend = calcResult.amount;
      const yearSpend = calcResult.amount * 12;
      const ptsM = cfg.type === "Points" ? Math.floor(monthSpend / cfg.spendUnit) * cfg.pointsPer : 0;
      const ptsY = cfg.type === "Points" ? Math.floor(yearSpend / cfg.spendUnit) * cfg.pointsPer : 0;
      const saveM = cfg.type === "Points" ? ptsM * cfg.rpValue : Math.round(monthSpend * cfg.cashbackPct / 100);
      const saveY = cfg.type === "Points" ? ptsY * cfg.rpValue : Math.round(yearSpend * cfg.cashbackPct / 100);
      return { ...cfg, ptsM, ptsY, saveM, saveY };
    };
    const walletCards = [
      buildCard({ name: "HSBC Travel One", type: "Points", spendUnit: 100, pointsPer: 2, rpValue: 1, rate: "₹100 → 2RP", img: CARD_IMG_MAP["HSBC Travel One"] }),
      buildCard({ name: "HSBC Live+", type: "Cashback", cashbackPct: 1.5, rate: "1.5% CASHBACK", img: CARD_IMG_MAP["HSBC Live+"] }),
    ];
    const marketCards = [
      buildCard({ name: "Amex Platinum", type: "Points", spendUnit: 100, pointsPer: 8, rpValue: 1, rate: "₹100 → 8RP", img: CARD_IMG_MAP["Amex Platinum"] }),
      buildCard({ name: "IndusInd Tiger", type: "Cashback", cashbackPct: 7, rate: "7% CASHBACK", img: null }),
      buildCard({ name: "IndusInd Rupay", type: "Cashback", cashbackPct: 6, rate: "6% CASHBACK", img: null }),
    ];
    // Only owned cards (wallet) have limits/caps/milestones — market cards aren't owned yet.
    const cardLimitsMap: Record<string, any> = {
      "HSBC Travel One":  { creditTotal: 250000, creditUsed: 95000, rewardTotal: 80000, rewardEarned: 22000, msName: "Domestic Lounge Access", msTarget: 100000, msSpent: 42000 },
      "HSBC Live+":       { creditTotal: 100000, creditUsed: 38000, rewardTotal: 60000, rewardEarned: 14000, msName: "BookMyShow Voucher",     msTarget: 75000,  msSpent: 38000 },
    };

    const renderCardRow = (card: any) => {
      const isExpanded = expandedCard === card.name;
      const limits = cardLimitsMap[card.name];
      const baseAmount = calcResult.amount;
      const points = card.ptsM;
      const cardSavings = card.saveM;
      const headlineSavings = card.saveM;

      const Bar = ({ segs }: any) => (
        <div style={{ width: "100%", height: 12, borderRadius: 4, background: "rgba(123,142,178,0.1)", boxShadow: "0px 1px 0px rgba(255,255,255,0.19), inset 1px 1px 2px rgba(0,0,0,0.11)", overflow: "hidden", display: "flex" }}>
          {segs.map((s: any, i: number) => <div key={i} style={{ width: `${Math.max(0, s.pct)}%`, background: s.color, height: "100%" }} />)}
        </div>
      );
      const LegRow = ({ items }: any) => (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 7 }}>
          {items.map((it: any, i: number) => (
            <div key={i} style={{ flex: 1, textAlign: i === 0 ? "left" : i === items.length - 1 ? "right" : "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: i === 0 ? "flex-start" : i === items.length - 1 ? "flex-end" : "center" }}>
                <span style={{ width: 7, height: 8, borderRadius: 2, background: it.color, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: it.valueColor || "#364060", lineHeight: "14px" }}>{it.value}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(54,64,96,0.7)", marginTop: 1, lineHeight: "14px" }}>{it.label}</div>
            </div>
          ))}
        </div>
      );

      return (
        <div key={card.name} style={{ marginBottom: 12 }}>
          <div onClick={() => setExpandedCard(isExpanded ? null : card.name)} style={{ background: "#fff", border: "1px solid #E8F0F1", borderBottom: isExpanded ? "0.8px solid rgba(206, 200, 200, 0.4)" : "1px solid #E8F0F1", borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: isExpanded ? 0 : 10, borderBottomRightRadius: isExpanded ? 0 : 10, boxShadow: isExpanded ? "0px 2px 8px rgba(0,0,0,0.08)" : "0px 2px 8px rgba(0,0,0,0.08)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            {card.img ? (
              <img src={card.img} alt={card.name} style={{ width: 52, height: 34, objectFit: "cover", borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            ) : (
              <div style={{ width: 52, height: 34, borderRadius: 6, background: "linear-gradient(135deg,#2d3748,#1a202c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                {card.name.split(" ").map((w: string) => w[0]).join("")}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#36405E", lineHeight: "18px" }}>{card.name}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#098039", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{card.rate}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#808387", lineHeight: "17px" }}>Save</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#008846", letterSpacing: "0.01em" }}>₹{f(headlineSavings)}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
              <path d="M6 9l6 6 6-6" stroke="rgba(34, 41, 65, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {isExpanded && (
            <div className="expand-down" style={{ background: "linear-gradient(180deg, #F7FAFD 0%, #FFFFFF 100%)", border: "1px solid #E8F0F1", borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)", padding: "16px 14px 18px" }}>
              {/* Breakdown card */}
              <div style={{ background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10, padding: "14px 16px", boxShadow: "0px 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13, color: "#46505F", lineHeight: "20px" }}>
                  <span>Total Spends</span>
                  <span style={{ fontWeight: 600, color: "#1C2A33" }}>₹{f(baseAmount)}</span>
                </div>

                {card.type === "Points" ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0 4px", fontSize: 13, color: "#46505F", lineHeight: "20px" }}>
                      <div>
                        <div>Points Earned</div>
                        <div onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, fontWeight: 500, color: "#3B82F6", borderBottom: "1px dashed #3B82F6", display: "inline-block", marginTop: 1, cursor: "pointer", lineHeight: "14px" }}>See How?</div>
                      </div>
                      <span style={{ fontWeight: 600, color: "#1C2A33" }}>{f(points)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0 4px", fontSize: 13, color: "#46505F", lineHeight: "20px" }}>
                      <div>
                        <div>Value of 1 Point</div>
                        <div onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, fontWeight: 500, color: "#3B82F6", borderBottom: "1px dashed #3B82F6", display: "inline-block", marginTop: 1, cursor: "pointer", lineHeight: "14px" }}>See How?</div>
                      </div>
                      <span style={{ fontWeight: 600, color: "#1C2A33" }}>₹{card.rpValue}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 0 0", marginTop: 8, fontSize: 12, color: "#808387", borderTop: "1px dashed #D5DBE3" }}>
                      <span>₹{f(points)} x {card.rpValue}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 0", fontSize: 14, fontWeight: 700, color: "#1C2A33", lineHeight: "20px" }}>
                      <span>Total Savings</span>
                      <span style={{ color: "#008846", fontSize: 16 }}>₹{f(cardSavings)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 4px", fontSize: 13, color: "#46505F", lineHeight: "20px" }}>
                      <span>Cashback %</span>
                      <span style={{ fontWeight: 600, color: "#1C2A33" }}>{card.cashbackPct}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 0", marginTop: 6, borderTop: "1px dashed #D5DBE3", fontSize: 14, fontWeight: 700, color: "#1C2A33", lineHeight: "20px" }}>
                      <span>Total Savings</span>
                      <span style={{ color: "#008846", fontSize: 16 }}>₹{f(cardSavings)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Best Place to Shop (per-card) — only relevant in category flow */}
              {calcResult.isCategory && (() => {
                const popCardRates = (CALC_CARDS.find((c: any) => c.name === card.name) as any)?.rates;
                const fallbackRate = card.type === "Points" ? (card.pointsPer / card.spendUnit) * card.rpValue * 100 : (card.cashbackPct ?? 0);
                const lookup = (brandName: string) => popCardRates ? (popCardRates[brandName] ?? popCardRates.default ?? fallbackRate) : fallbackRate;
                const popTable = (categoryBrands as any[])
                  .map(b => { const rate = lookup(b.name); return { name: b.name, icon: b.icon, rate, you: Math.round(calcResult.amount * rate / 100) }; })
                  .sort((a, b) => b.rate - a.rate);
                const top = popTable[0];
                if (!top) return null;
                return (
                  <div style={{ marginTop: 12, background: "linear-gradient(180deg, #FFF8E8 0%, #FFFCF4 100%)", border: "1px solid #F2E2B8", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#8A6D1F", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: "11px" }}>Best place to shop</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1C2A33", lineHeight: "16px" }}>{top.name}{spendCategory === "Online Shopping" || spendCategory === "Ordering Food" || spendCategory === "Groceries" ? " App" : ""}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setBestPlacesPopup(card.name); }} style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid #B8965E", background: "transparent", color: "#B8965E", fontSize: 9, fontWeight: 700, cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontFamily: FN }}>i</button>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#098039", marginTop: 4, letterSpacing: "0.04em" }}>{top.rate}% · ₹{f(top.you)} on ₹{f(calcResult.amount)}</div>
                    </div>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: "#fff", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0px 1px 3px rgba(0,0,0,0.06)" }}>
                      {brandImgMap[top.name] ? <img src={brandImgMap[top.name]} alt={top.name} style={{ width: 28, height: 28, objectFit: "contain" }} /> : <span style={{ fontSize: 22 }}>{top.icon}</span>}
                    </div>
                  </div>
                );
              })()}

              {/* Limits and Milestones */}
              {limits && (() => {
                const cardTotal = limits.creditTotal;
                const cardUsed = limits.creditUsed;
                const cardTxn = Math.min(calcResult.amount, Math.max(0, cardTotal - cardUsed));
                const cardAvail = Math.max(0, cardTotal - cardUsed - cardTxn);
                const rTotal = limits.rewardTotal;
                const rEarned = limits.rewardEarned;
                const rTxn = card.saveM;
                const rRem = Math.max(0, rTotal - rEarned - rTxn);
                const msTarget = limits.msTarget;
                const msSpent = limits.msSpent;
                const msTxn = Math.min(calcResult.amount, Math.max(0, msTarget - msSpent));
                const msRem = Math.max(0, msTarget - msSpent - msTxn);

                return (
                  <div style={{ marginTop: 12, background: "#fff", border: "1px solid #E8F0F1", borderRadius: 10, padding: "16px 16px 18px", boxShadow: "0px 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ ...calcSectionTitleStyle, marginBottom: 14 }}>Limits and Caps</div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#222941", lineHeight: "18px" }}>Card limit</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#364060", lineHeight: "14px" }}>₹{f(cardTotal - cardUsed)} / ₹{f(cardTotal)} <span style={{ fontWeight: 400, color: "rgba(54,64,96,0.7)" }}>available</span></span>
                    </div>
                    <Bar segs={[
                      { pct: (cardUsed / cardTotal) * 100, color: "#14569D" },
                      { pct: (cardTxn / cardTotal) * 100, color: "#9FB1F8" },
                      { pct: (cardAvail / cardTotal) * 100, color: "#7B8EB21A" },
                    ]} />
                    <LegRow items={[
                      { color: "#14569D", value: `₹${f(cardUsed)}`, label: "Used" },
                      { color: "#9FB1F8", value: `₹${f(cardTxn)}`, label: "this Txn" },
                      { color: "#7B8EB21A", value: `₹${f(cardAvail)}`, label: "available after" },
                    ]} />

                    <div style={{ borderTop: "0.5px dashed rgba(0,0,0,0.3)", margin: "16px 0" }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#222941", lineHeight: "18px" }}>Reward Cap</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#364060", lineHeight: "14px" }}>₹{f(Math.max(0, rTotal - rEarned))} / ₹{f(rTotal)} <span style={{ fontWeight: 400, color: "rgba(54,64,96,0.7)" }}>remaining</span></span>
                    </div>
                    <Bar segs={[
                      { pct: (rEarned / rTotal) * 100, color: "#149D9D" },
                      { pct: (rTxn / rTotal) * 100, color: "#9FE2F8" },
                      { pct: (rRem / rTotal) * 100, color: "#7B8EB21A" },
                    ]} />
                    <LegRow items={[
                      { color: "#149D9D", value: `₹${f(rEarned)}`, label: "Earned" },
                      { color: "#9FE2F8", value: `₹${f(rTxn)}`, label: "this Txn", valueColor: "#008846" },
                      { color: "#7B8EB21A", value: `₹${f(rRem)}`, label: "remaining after" },
                    ]} />

                    <div style={{ ...calcSectionTitleStyle, marginTop: 18, marginBottom: 14 }}>Milestones and Waivers</div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#222941", lineHeight: "18px" }}>{limits.msName}</span>
                      <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(54,64,96,0.7)", lineHeight: "14px" }}>Spend ₹{f(msTarget)}</span>
                    </div>
                    <Bar segs={[
                      { pct: (msSpent / msTarget) * 100, color: "#149D36" },
                      { pct: (msTxn / msTarget) * 100, color: "#9FF8C7" },
                      { pct: (msRem / msTarget) * 100, color: "#7B8EB21A" },
                    ]} />
                    <LegRow items={[
                      { color: "#149D36", value: `₹${f(msSpent)}`, label: "Spent" },
                      { color: "#9FF8C7", value: `₹${f(msTxn)}`, label: "After this Txn" },
                      { color: "#7B8EB21A", value: `₹${f(msRem)} more`, label: "to spend after" },
                    ]} />
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      );
    };

    const cashkaroPct = 2;
    const cashkaroAmt = Math.round(calcResult.amount * cashkaroPct / 100);
    const totalWithCashkaro = best.saved + cashkaroAmt;

    // Resolve the spend category context (brand → its category, or category directly)
    const resolveCategory = (q: string) => {
      if (!q) return null;
      // direct category match
      if (CALC_BRANDS[q]) return q;
      for (const cat of Object.keys(CALC_BRANDS)) {
        if (CALC_BRANDS[cat].some((b: any) => b.name === q)) return cat;
      }
      return null;
    };
    const spendCategory = resolveCategory(calcResult.query);
    const categoryBrands = spendCategory ? CALC_BRANDS[spendCategory] : [];
    // Compute YOU-GET amount on the BEST card for every brand in this category
    const bestCardRates = CALC_CARDS.find((c: any) => c.name === best.name)?.rates || {};
    const brandTable = categoryBrands.map((b: any) => {
      const rt = bestCardRates[b.name] ?? bestCardRates.default ?? 0;
      return { name: b.name, icon: b.icon, rate: rt, you: Math.round(calcResult.amount * rt / 100) };
    }).sort((a: any, b: any) => b.rate - a.rate);
    const baseRate = bestCardRates.default ?? 0;
    const baseAmt = Math.round(calcResult.amount * baseRate / 100);
    const bestPlace = brandTable[0]; // highest YOU-GET brand for this card
    return (
      <div className="slide-in" style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", background: "#F5F9FA", height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        <FL/>
        <div data-scroll="1" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", position: "relative" }}>
          {cashkaroExpanded && (
            <div onClick={() => setCashkaroExpanded(false)} style={{ position: "sticky", top: 0, height: 0, zIndex: 40, pointerEvents: "auto" }}>
              <div style={{ position: "absolute", inset: 0, height: "100vh", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
            </div>
          )}
          <div style={{ background: "linear-gradient(360deg, #4F2E0B -6.51%, #D78D04 87.99%)", padding: "0 0 28px", color: "#fff" }}>
            <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0", fontFamily: "-apple-system, system-ui", fontSize: 15, fontWeight: 700 }}>
              <span>9:41</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#fff"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></g></svg>
                <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#fff"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z"/><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z"/><circle cx="8" cy="10" r="1.2"/></g></svg>
                <svg width="18" height="11" viewBox="0 0 18 11" fill="none"><rect x="0.5" y="0.5" width="15" height="10" rx="2" stroke="#fff"/><rect x="2.4" y="2.4" width="9.8" height="6.2" rx="1.2" fill="#fff"/><rect x="16" y="3.5" width="1.7" height="4" rx="0.8" fill="#fff"/></svg>
              </div>
            </div>
            <div style={{ padding: "12px 20px 0" }}>
              <div onClick={() => setCalcResult(null)} className="legacy-tap" style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 18 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </div>
              <div className="legacy-serif" style={{ fontSize: 20, lineHeight: 1.35, fontWeight: 700, color: "#EAEDF7", paddingRight: 12 }}>
                Here is the best card to use for ₹{f(calcResult.amount)} spends on {calcResult.query}
              </div>
            </div>
          </div>

          <div style={{ padding: "16px 16px 24px" }}>
            <div style={{ position: "relative", background: "#fff", borderRadius: 10, border: "1px solid #E8F0F1", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)", padding: "20px 20px 22px", marginBottom: tracksExpanded ? 0 : 36, borderBottomLeftRadius: tracksExpanded ? 0 : 10, borderBottomRightRadius: tracksExpanded ? 0 : 10, borderBottom: tracksExpanded ? "none" : "none" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", paddingBottom: 18, borderBottom: "0.8px solid rgba(206, 200, 200, 0.4)" }}>
                {bestCardImg ? (
                  <img src={bestCardImg} alt={best.name} style={{ width: 96, height: 64, objectFit: "cover", borderRadius: 6, boxShadow: "0 2px 8px rgba(20, 21, 72, 0.12)" }} />
                ) : (
                  <div style={{ width: 96, height: 64, borderRadius: 6, background: "linear-gradient(135deg,#2d3748,#1a202c)" }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "#36405E", lineHeight: "18px" }}>{best.name} Credit Card</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#098039", marginTop: 10, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "11px" }}>{bestRewardLabel}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 4px 0", fontSize: 11, color: "#808387", lineHeight: "17px" }}>
                <span>Your Spends</span><span style={{ fontWeight: 600, fontSize: 12, color: "#808387", letterSpacing: "0.01em" }}>₹{f(calcResult.amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 4px 0", fontSize: 11, color: "#808387", lineHeight: "17px" }}>
                <span>Cashback %</span><span style={{ fontWeight: 600, fontSize: 12, color: "#808387", letterSpacing: "0.01em" }}>{best.rate}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 4px 0", fontSize: 12, fontWeight: 600, color: "#1C2A33", letterSpacing: "0.01em" }}>
                <span>Total Savings</span><span style={{ color: "#008846", fontSize: 14 }}>₹{f(best.saved)}</span>
              </div>

              {/* BEST PLACE TO SHOP sub-panel — only relevant in category flow */}
              {calcResult.isCategory && bestPlace && (
                <div style={{ marginTop: 16, background: "linear-gradient(180deg, #FFF8E8 0%, #FFFCF4 100%)", border: "1px solid #F2E2B8", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#8A6D1F", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: "11px" }}>Best place to shop</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1C2A33", lineHeight: "16px" }}>{bestPlace.name}{spendCategory === "Online Shopping" || spendCategory === "Ordering Food" || spendCategory === "Groceries" ? " App" : ""}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setBestPlacesPopup(best.name); }} style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid #B8965E", background: "transparent", color: "#B8965E", fontSize: 9, fontWeight: 700, cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontFamily: FN }}>i</button>
                    </div>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "#fff", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0px 1px 3px rgba(0,0,0,0.06)" }}>
                    {brandImgMap[bestPlace.name] ? <img src={brandImgMap[bestPlace.name]} alt={bestPlace.name} style={{ width: 28, height: 28, objectFit: "contain" }} /> : <span style={{ fontSize: 22 }}>{bestPlace.icon}</span>}
                  </div>
                </div>
              )}

              {/* Anchor line + toggle button */}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: -15.5, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 2 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 0, borderTop: "1px solid #E8F0F1" }} />
                <div style={{ transform: "rotate(0.12deg)", pointerEvents: "auto", position: "relative" }}>
                  <button type="button" onClick={() => setTracksExpanded(v => !v)} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 31, padding: "8px 16px", borderRadius: 6, border: "1px solid #1733900F", background: "linear-gradient(90deg, #F5F9FF 0%, #FFFFFF 100%)", fontSize: 11, fontWeight: 600, color: "#222941", lineHeight: "15px", boxShadow: "0px 1px 2px 0px #0000000F", cursor: "pointer", fontFamily: FN, whiteSpace: "nowrap", boxSizing: "border-box" }}>
                    {tracksExpanded ? "Hide Limits and Milestones" : "Track Limits and Milestones"}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: tracksExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6" stroke="#222941" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {tracksExpanded && (() => {
              const bestIdx = CALC_CARDS.findIndex((c: any) => c.name === best.name);
              const bestCardData = USER_CARDS[bestIdx] || USER_CARDS[0];
              const bestCD = CD[bestIdx] || CD[0];

              // Days left until next card anniversary
              const act = new Date(bestCardData.activation_date);
              const nextAnniv = new Date(act);
              nextAnniv.setFullYear(new Date("2026-04-26").getFullYear());
              if (nextAnniv < new Date("2026-04-26")) nextAnniv.setFullYear(nextAnniv.getFullYear() + 1);
              const daysLeft = Math.round((nextAnniv.getTime() - new Date("2026-04-26").getTime()) / 86400000);

              // Card limit
              const cardLimitTotal = bestCD.limits.creditTotal;
              const cardLimitUsed = bestCD.limits.creditUsed;
              const cardLimitTxn = Math.min(calcResult.amount, cardLimitTotal - cardLimitUsed);
              const cardLimitAvailAfter = cardLimitTotal - cardLimitUsed - cardLimitTxn;
              const cardLimitAvail = cardLimitTotal - cardLimitUsed;

              // Reward cap — try bucket-specific cap first, else use first cap from CD
              const selectedBucket = selBrand?.name || "";
              const bucketBD = calculateResponses[bestIdx]?.spending_breakdown;
              let rewardCapTotal = 0;
              let rewardCapEarned = 0;
              if (bucketBD) {
                // Find a matching bucket for the selected brand
                const matchedBucket = Object.keys(bucketBD).find((k: string) => {
                  const bd = bucketBD[k];
                  return typeof bd?.maxCap === "number" && bd.maxCap > 0;
                });
                if (matchedBucket && typeof bucketBD[matchedBucket].maxCap === "number") {
                  rewardCapTotal = bucketBD[matchedBucket].maxCap;
                  rewardCapEarned = Math.round(bucketBD[matchedBucket].savings || 0);
                }
              }
              if (rewardCapTotal === 0 && bestCD.limits.caps.length > 0) {
                rewardCapTotal = bestCD.limits.caps[0].total || 0;
                rewardCapEarned = bestCD.limits.caps[0].used || 0;
              }
              const rewardCapTxn = best.saved;
              const rewardCapRemAfter = Math.max(0, rewardCapTotal - rewardCapEarned - rewardCapTxn);

              // Annual Fee Waiver
              const afwTarget = bestCardData.fee_waiver_threshold || 0;
              const afwSpent = bestCD.totalSpend || 0;
              const afwTxn = afwTarget > 0 ? Math.min(calcResult.amount, Math.max(0, afwTarget - afwSpent)) : 0;
              const afwRem = afwTarget > 0 ? Math.max(0, afwTarget - afwSpent - afwTxn) : 0;
              const showAfw = afwTarget > 0;

              // Milestone (e.g. Bookmyshow Voucher)
              const firstMilestone = bestCardData.milestone_benefits?.[0];
              const bmsTarget = firstMilestone?.minSpend || 0;
              const bmsSpent = bestCD.totalSpend || 0;
              const bmsTxn = bmsTarget > 0 ? Math.min(calcResult.amount, Math.max(0, bmsTarget - bmsSpent)) : 0;
              const bmsRem = bmsTarget > 0 ? Math.max(0, bmsTarget - bmsSpent - bmsTxn) : 0;
              const showBms = bmsTarget > 0;

              const StackedBar = ({ segs, height = 12, radius = 4 }: any) => (
                <div style={{ width: "100%", height, borderRadius: radius, background: "rgba(123, 142, 178, 0.1)", boxShadow: "0px 1px 0px rgba(255, 255, 255, 0.19), inset 1px 1px 2px rgba(0, 0, 0, 0.11)", overflow: "hidden", display: "flex" }}>
                  {segs.map((s: any, i: number) => (
                    <div key={i} style={{ width: `${s.pct}%`, background: s.color, height: "100%" }} />
                  ))}
                </div>
              );
              const Legend = ({ items }: any) => (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, gap: 7 }}>
                  {items.map((it: any, i: number) => (
                    <div key={i} style={{ flex: 1, textAlign: i === 0 ? "left" : i === items.length - 1 ? "right" : "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: i === 0 ? "flex-start" : i === items.length - 1 ? "flex-end" : "center" }}>
                        <span style={{ width: 7, height: 8, borderRadius: 2, background: it.color, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: it.valueColor || "#364060", lineHeight: "14px" }}>{it.value}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(54, 64, 96, 0.7)", marginTop: 1, lineHeight: "14px" }}>{it.label}</div>
                    </div>
                  ))}
                </div>
              );
              const Divider = () => <div style={{ borderTop: "0.5px dashed rgba(0, 0, 0, 0.3)", margin: "18px 0" }} />;

              return (
                <div className="expand-down" style={{ background: "#fff", border: "1px solid #E8F0F1", borderTop: "none", borderRadius: 10, borderTopLeftRadius: 0, borderTopRightRadius: 0, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)", padding: "20px 16px 22px", marginTop: 0, marginBottom: 36 }}>
                  <div style={{ ...calcSectionTitleStyle, marginBottom: 18 }}>Limits and Caps</div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#222941", lineHeight: "18px" }}>Card limit</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#364060", lineHeight: "14px" }}>₹{f(cardLimitAvail)} / ₹{f(cardLimitTotal)} <span style={{ fontWeight: 400, color: "rgba(54, 64, 96, 0.7)" }}>available</span></span>
                  </div>
                  <StackedBar segs={[
                    { pct: (cardLimitUsed / cardLimitTotal) * 100, color: "#14569D" },
                    { pct: (cardLimitTxn / cardLimitTotal) * 100, color: "#9FB1F8" },
                    { pct: (cardLimitAvailAfter / cardLimitTotal) * 100, color: "#7B8EB21A" },
                  ]} />
                  <Legend items={[
                    { color: "#14569D", value: `₹${f(cardLimitUsed)}`, label: "Used" },
                    { color: "#9FB1F8", value: `₹${f(cardLimitTxn)}`, label: "this Txn" },
                    { color: "#7B8EB21A", value: `₹${f(cardLimitAvailAfter)}`, label: "available after" },
                  ]} />

                  {rewardCapTotal > 0 && (<>
                  <Divider />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#222941", lineHeight: "18px" }}>Reward Cap</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#364060", lineHeight: "14px" }}>₹{f(rewardCapTotal - rewardCapEarned)} / ₹{f(rewardCapTotal)} <span style={{ fontWeight: 400, color: "rgba(54, 64, 96, 0.7)" }}>remaining</span></span>
                  </div>
                  <StackedBar segs={[
                    { pct: (rewardCapEarned / rewardCapTotal) * 100, color: "#149D9D" },
                    { pct: (rewardCapTxn / rewardCapTotal) * 100, color: "#9FE2F8" },
                    { pct: (rewardCapRemAfter / rewardCapTotal) * 100, color: "#7B8EB21A" },
                  ]} />
                  <Legend items={[
                    { color: "#149D9D", value: `₹${f(rewardCapEarned)}`, label: "Earned" },
                    { color: "#9FE2F8", value: `₹${f(rewardCapTxn)}`, label: "this Txn", valueColor: "#008846" },
                    { color: "#7B8EB21A", value: `₹${f(rewardCapRemAfter)}`, label: "remaining after" },
                  ]} />
                  </>)}

                  {(showBms || showAfw) && (
                    <div style={{ ...calcSectionTitleStyle, marginTop: 20, marginBottom: 18 }}>Milestones and Waivers</div>
                  )}

                  {showBms && (<>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#222941", lineHeight: "18px" }}>{firstMilestone.reward}</span>
                    <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(54, 64, 96, 0.7)", lineHeight: "14px" }}>Spend ₹{f(bmsTarget)} ({daysLeft} Days Left)</span>
                  </div>
                  <StackedBar segs={[
                    { pct: (bmsSpent / bmsTarget) * 100, color: "#149D36" },
                    { pct: (bmsTxn / bmsTarget) * 100, color: "#9FF8C7" },
                    { pct: (bmsRem / bmsTarget) * 100, color: "#7B8EB21A" },
                  ]} />
                  <Legend items={[
                    { color: "#149D36", value: `₹${f(bmsSpent)}`, label: "Spent" },
                    { color: "#9FF8C7", value: `₹${f(bmsTxn)}`, label: "After this Txn" },
                    { color: "#7B8EB21A", value: `₹${f(bmsRem)} more`, label: "to spend after" },
                  ]} />
                  </>)}

                  {showBms && showAfw && <Divider />}

                  {showAfw && (<>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#222941", lineHeight: "18px" }}>Annual Fee Waiver</span>
                    <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(54, 64, 96, 0.7)", lineHeight: "14px" }}>Spend ₹{f(afwTarget)} ({daysLeft} Days Left)</span>
                  </div>
                  <StackedBar segs={[
                    { pct: (afwSpent / afwTarget) * 100, color: "#212121" },
                    { pct: (afwTxn / afwTarget) * 100, color: "#CCCCCC" },
                    { pct: (afwRem / afwTarget) * 100, color: "#7B8EB21A" },
                  ]} />
                  <Legend items={[
                    { color: "#212121", value: `₹${f(afwSpent)}`, label: "Spent" },
                    { color: "#CCCCCC", value: `₹${f(afwTxn)}`, label: "After this Txn" },
                    { color: "#7B8EB21A", value: `₹${f(afwRem)} more`, label: "to spend after" },
                  ]} />
                  </>)}
                </div>
              );
            })()}

            <div style={{ ...calcSectionTitleStyle, marginTop: 20 }}>Other cards in your wallet</div>
            {walletCards.map(renderCardRow)}

            <div style={{ ...calcSectionTitleStyle, marginTop: 18 }}>Best cards in the market</div>
            {marketCards.map(renderCardRow)}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button type="button" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, height: 31, padding: "8px 16px", borderRadius: 6, border: "1px solid #1733900F", background: "linear-gradient(90deg, #F5F9FF 0%, #FFFFFF 100%)", fontSize: 11, fontWeight: 600, color: "#222941", lineHeight: "15px", boxShadow: "0px 1px 2px 0px #0000000F", cursor: "pointer", fontFamily: FN, transform: "rotate(0.12deg)", boxSizing: "border-box", whiteSpace: "nowrap" }}>
                View More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#222941" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {!calcResult.isCategory && (
              <>
                <div style={{ ...calcSectionTitleStyle, marginTop: 22 }}>Alternate brands to spend on</div>
                <div style={{ position: "relative", marginRight: -16 }}>
                  <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, paddingRight: 24, scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
                    {altBrands.map((b) => (
                      <div key={b.name} style={{ flex: "0 0 auto", width: 101, minHeight: 123, background: "#FCFCFC", borderRadius: 16, border: "1.31px solid #E2E8EF", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)", padding: "4px 4px 13px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, boxSizing: "border-box" }}>
                        <div style={{ width: 93, height: 69, borderRadius: 14, background: b.tileBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, lineHeight: 1 }}>
                          {brandImgMap[b.name]?<img src={brandImgMap[b.name]} alt={b.name} style={{width:40,height:40,objectFit:"contain"}}/>:b.icon}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#001C3D", textAlign: "center", letterSpacing: "0.02em", lineHeight: "18px" }}>{b.name}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#098039", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "11px", textAlign: "center" }}>SAVE ₹{f(b.save)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 8, width: 40, pointerEvents: "none", background: "linear-gradient(270deg, #F5F9FA 10%, rgba(245,249,250,0) 100%)" }} />
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, width: "100%", background: "#FFFFFF", borderTop: "1px solid #DFE7FF", boxShadow: "0px -3px 5px rgba(63, 95, 103, 0.1)", boxSizing: "border-box", display: "flex", flexDirection: "column", position: "relative", zIndex: 50 }}>
          <div onClick={() => setCashkaroExpanded(v => !v)} style={{ height: 30, background: "linear-gradient(180deg, rgba(244, 142, 87, 0.2) 0%, rgba(252, 209, 186, 0.2) 100%)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 0 19px", cursor: "pointer" }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#001C3D", letterSpacing: "0.02em", lineHeight: "18px" }}>Save upto ₹{f(totalWithCashkaro)} on shopping via CashKaro</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, color: "#001C3D", letterSpacing: "0.02em", borderBottom: "1px dashed #001C3D", lineHeight: "18px", cursor: "pointer" }}>
              {cashkaroExpanded ? "See Less" : "See More"}
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" style={{ transform: cashkaroExpanded ? "rotate(0deg)" : "rotate(180deg)" }}><path d="M6 9l6 6 6-6" stroke="#001C3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          {cashkaroExpanded && (
            <div style={{ padding: "18px 21px 6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0", fontSize: 13, color: "#46505F", lineHeight: "20px" }}>
                <span>Savings with {best.name}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#1C2A33" }}>₹{f(best.saved)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0 10px", fontSize: 13, color: "#46505F", lineHeight: "20px", borderBottom: "1px dashed #D5DBE3" }}>
                <span>Cashback with CashKaro ({cashkaroPct}%)</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#1C2A33" }}>+ ₹{f(cashkaroAmt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 0", fontSize: 14, fontWeight: 700, color: "#1C2A33" }}>
                <span>Total Savings</span>
                <span style={{ color: "#008846", fontSize: 16 }}>₹{f(totalWithCashkaro)}</span>
              </div>
            </div>
          )}
          <div style={{ padding: "14px 16px 22px" }}>
            <button type="button" style={{ width: "100%", height: 48.51, borderRadius: 10.17, border: "none", background: "linear-gradient(90deg, #222941 0%, #101C43 100%)", padding: "15.26px 20.34px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8.48, boxShadow: CASHKARO_CTA_SHADOW, cursor: "pointer", fontFamily: FN }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#E8E8E8", lineHeight: "18px" }}>Shop on Flipkart via</span>
              <img src="/legacy-assets/Cashkaro.png" alt="CashKaro" style={{ height: 10, objectFit: "contain", display: "block" }} />
              <svg width="7" height="12" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* Best places to use this card popup (card-aware) */}
        {bestPlacesPopup && (() => {
          const popCardRates = (CALC_CARDS.find((c: any) => c.name === bestPlacesPopup) as any)?.rates;
          // Fallback to the card config's headline rate if the card isn't in CALC_CARDS (market cards).
          const popCardCfg = [...walletCards, ...marketCards].find((c: any) => c.name === bestPlacesPopup);
          const fallbackRate = popCardCfg ? (popCardCfg.type === "Points" ? (popCardCfg.pointsPer / popCardCfg.spendUnit) * popCardCfg.rpValue * 100 : (popCardCfg.cashbackPct ?? 0)) : 0;
          const lookup = (brandName: string) => popCardRates ? (popCardRates[brandName] ?? popCardRates.default ?? fallbackRate) : fallbackRate;
          const popTable = (categoryBrands as any[])
            .map(b => { const rate = lookup(b.name); return { name: b.name, icon: b.icon, rate, you: Math.round(calcResult.amount * rate / 100) }; })
            .sort((a, b) => b.rate - a.rate);
          const popBaseRate = popCardRates ? (popCardRates.default ?? fallbackRate) : fallbackRate;
          const popBaseAmt = Math.round(calcResult.amount * popBaseRate / 100);
          return (
            <div onClick={() => setBestPlacesPopup(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }}>
              <div onClick={(e) => e.stopPropagation()} className="fade-up" style={{ width: "100%", maxWidth: 360, background: "#FFFFFF", borderRadius: 16, boxShadow: "0px 20px 50px rgba(0,0,0,0.25)", padding: "20px 18px 18px", fontFamily: FN }}>
                <div style={{ textAlign: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1C2A33", lineHeight: "20px" }}>Best places to use this card</div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#7B8197", marginTop: 4, lineHeight: "14px" }}>{bestPlacesPopup} · Unlock maximum rewards</div>
                </div>

                <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", padding: "0 4px 8px", borderBottom: "1px solid #EEF2F7" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#7B8197", letterSpacing: "0.12em", textTransform: "uppercase" }}>Brand</span>
                  <div style={{ display: "flex", gap: 36 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#7B8197", letterSpacing: "0.12em", textTransform: "uppercase" }}>Rate</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#7B8197", letterSpacing: "0.12em", textTransform: "uppercase" }}>You Get</span>
                  </div>
                </div>

                <div style={{ maxHeight: 320, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
                  {popTable.slice(0, 8).map((b: any, i: number) => (
                    <div key={b.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 4px", borderBottom: i === Math.min(popTable.length, 8) - 1 ? "none" : "1px dashed #EEF2F7" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {brandImgMap[b.name] ? <img src={brandImgMap[b.name]} alt={b.name} style={{ width: 20, height: 20, objectFit: "contain" }} /> : <span style={{ fontSize: 14 }}>{b.icon}</span>}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#1C2A33", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#46505F", minWidth: 32, textAlign: "right" }}>{b.rate}%</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: b.you > 0 ? "#008846" : "#9CA3AF", minWidth: 50, textAlign: "right" }}>₹{f(b.you)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 6, padding: "12px 12px", background: "#F7F9FC", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1C2A33" }}>Base Rate - {popBaseRate}%</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#7B8197", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>On any other {(spendCategory || "").toLowerCase()} brand</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: popBaseAmt > 0 ? "#008846" : "#9CA3AF" }}>₹{f(popBaseAmt)}</span>
                </div>

                <button type="button" onClick={() => setBestPlacesPopup(null)} style={{ width: "100%", marginTop: 16, height: 42, borderRadius: 10, border: "none", background: "linear-gradient(90deg, #222941 0%, #101C43 100%)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FN }}>Got it</button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  /* Selection page */
  // Unified taxonomy — 11 card-usable categories. Friends and Family is excluded
  // from the calculator (no card maps to it).
  const catImgMap: Record<string,string>={"Shopping":"/cdn/categories/Shopping.webp","Groceries":"/cdn/categories/Groceries.webp","Dining Out":"/cdn/categories/Dining Out.webp","Food Ordering":"/cdn/categories/Food Ordering.webp","Bills":"/cdn/categories/Bills.webp","Fuel":"/cdn/categories/Fuel.webp","Flights":"/cdn/categories/Flights.webp","Hotels":"/cdn/categories/Hotels.webp","Entertainment":"/cdn/categories/Entertainment.webp","Rent":"/cdn/categories/Rent.webp","Insurance":"/cdn/categories/Insurance.webp"};
  const bgColors={"🛒":"#FFF4DC","📦":"#FFF3E0","👗":"#FCE4EC","💄":"#FCE4EC","🟠":"#FFF3E0","🔴":"#FFEBEE","🥦":"#E8F5E9","✈️":"#E3F2FD","🚗":"#F3E5F5","🎬":"#E8EAF6","💊":"#E0F7FA","📚":"#FAFAFA","🛡️":"#E8F5E9","⚡":"#FFFDE7","👔":"#E3F2FD","🏷️":"#F3E5F5","📱":"#FFF3E0","👓":"#E3F2FD","🟡":"#FFFDE7","🌍":"#E8F5E9","🏨":"#FFF8E1","🏍️":"#FFEBEE","🔵":"#E3F2FD","☕":"#EFEBE9","🍕":"#FFF3E0","🍔":"#FFF8E1","🍗":"#FFF3E0","🟢":"#E8F5E9","📡":"#E8EAF6","🏋️":"#FCE4EC","🩺":"#E0F7FA","🎓":"#F3E5F5","🏃":"#E8F5E9","🏠":"#FFF8E1","🧵":"#FCE4EC","💎":"#FFFDE7","💧":"#E3F2FD","🔥":"#FFF3E0","🟣":"#F3E5F5","🛩️":"#E3F2FD","🥛":"#FFF8E1","🥡":"#FFF3E0","👶":"#FCE4EC","💳":"#F3E5F5","📞":"#FFF3E0","🏡":"#FFF8E1","🌐":"#E3F2FD","🍽️":"#FFE8DC","🍴":"#FFE8DC","🍻":"#FFEBEE"};
  const catIcons={"Shopping":"🛍️","Groceries":"🥦","Dining Out":"🍽️","Food Ordering":"🍔","Bills":"📄","Fuel":"⛽","Flights":"✈️","Hotels":"🏨","Entertainment":"🎬","Rent":"🏠","Insurance":"🛡️"};
  const catBg={"Shopping":"#EDE7F6","Groceries":"#E8F5E9","Dining Out":"#FFE8DC","Food Ordering":"#FFF3E0","Bills":"#FFF8E1","Fuel":"#E0F2F1","Flights":"#E3F2FD","Hotels":"#FFF8E1","Entertainment":"#FCE4EC","Rent":"#EAEAEA","Insurance":"#E8F5E9"};

  return (<div key="calc" style={{fontFamily:FN,maxWidth:400,margin:"0 auto",background:"#f5f9fa"}}>
    <FL/>
    <div className="slide-in" style={{minHeight:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

    {/* ── HEADER ── */}
    <div style={{background:"linear-gradient(360deg, #4F2E0B -6.51%, #D78D04 87.99%)",padding:"0 0 24px",color:"#fff",flexShrink:0}}>
      <div style={{height:44,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 28px 0",fontFamily:"-apple-system, system-ui",fontSize:15,fontWeight:700}}>
        <span>9:41</span>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#fff"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></g></svg>
          <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#fff"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z"/><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z"/><circle cx="8" cy="10" r="1.2"/></g></svg>
          <svg width="18" height="11" viewBox="0 0 18 11" fill="none"><rect x="0.5" y="0.5" width="15" height="10" rx="2" stroke="#fff"/><rect x="2.4" y="2.4" width="9.8" height="6.2" rx="1.2" fill="#fff"/><rect x="16" y="3.5" width="1.7" height="4" rx="0.8" fill="#fff"/></svg>
        </div>
      </div>

      <div style={{padding:"12px 16px 0"}}>
        <div onClick={()=>setScreen("home")} style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:12}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
      </div>

      {/* Toggle */}
      <div style={{margin:"0 16px",display:"flex",borderRadius:10,background:"rgba(255,255,255,0.2)",padding:3}}>
        {["Brands","Categories"].map(t=>(
          <div key={t} onClick={()=>{setCalcTab(t);setSelBrand(null);setSearchQ("");setCalcFilter("All");}} style={{flex:1,textAlign:"center",padding:"10px 0",borderRadius:8,cursor:"pointer",background:calcTab===t?"#fff":"transparent",color:calcTab===t?"#8B5E14":"rgba(255,255,255,0.85)",fontSize:13,fontWeight:700,transition:"all 0.2s"}}>{t}</div>
        ))}
      </div>

      {/* Title */}
      <div className="legacy-serif" style={{padding:"18px 16px 0",fontSize:20,lineHeight:1.35,fontWeight:700,color:"#FEFEFE"}}>
        {calcTab==="Brands"?"Select the brand on which you would like to spend":"Select the category you would like to spend on"}
      </div>
    </div>

    {/* ── CONTENT ── */}
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",padding:"16px 16px 100px"}}>

      {/* Search */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#fff",borderRadius:12,border:`1.31px solid ${searchQ?"#D78D04":"#E2E8EF"}`,boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:16}}>
        <span style={{color:"#9ca3af",fontSize:14}}>🔍</span>
        <input placeholder={calcTab==="Brands"?"Enter Brand name":"Search categories"} value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{border:"none",background:"none",outline:"none",fontSize:13,color:C.text,fontFamily:FN,width:"100%",fontWeight:500}}/>
        {searchQ&&<span onClick={()=>setSearchQ("")} style={{color:"#9ca3af",cursor:"pointer",fontSize:14}}>✕</span>}
      </div>

      {/* Filter chips */}
      {calcTab==="Brands"&&(
        <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",msOverflowStyle:"none",marginBottom:18,paddingBottom:2}}>
          {["All","Popular brands",...catKeys.slice(0,6)].map(fl=>{
            const isActive=calcFilter===(fl==="Popular brands"?"Your Top Brands":fl);
            const key=fl==="Popular brands"?"Your Top Brands":fl;
            return(
              <div key={fl} onClick={()=>setCalcFilter(key)} style={{padding:"8px 14px",borderRadius:20,background:isActive?"#1f2937":"#fff",color:isActive?"#fff":"#6b7280",fontSize:11,fontWeight:600,border:`1.31px solid ${isActive?"#1f2937":"#E2E8EF"}`,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{fl}</div>
            );
          })}
        </div>
      )}

      {/* Brand grid */}
      {calcTab==="Brands"?<>
        {Object.entries(hits?{Results:hits}:filteredBrands).map(([cat,bs]:any)=>(<div key={cat} style={{marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:600,color:"#4a5568",marginBottom:12}}>{cat}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {bs.map((b:any)=>{const sl=selBrand?.name===b.name;
            return(<button key={b.name} onClick={()=>{setSelBrand(b);setCalcPopup(true);setCalcAmt("");setOneTimeSpend(true);setMultiTxnSpend(false);}} style={{width:101,height:103,display:"flex",flexDirection:"column",alignItems:"center",padding:4,gap:4,background:sl?"#EFF6FF":"#FCFCFC",border:`1.31px solid ${sl?"#3B82F6":"#E2E8EF"}`,borderRadius:16,cursor:"pointer",fontFamily:FN,position:"relative",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
              {sl&&<div style={{position:"absolute",top:6,right:6,width:16,height:16,borderRadius:"50%",background:"#3B82F6",color:"#fff",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✓</div>}
              <div style={{width:93,height:69,borderRadius:14,background:bgColors[b.icon]||"#F5F5F5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{brandImgMap[b.name]?<img src={brandImgMap[b.name]} alt={b.name} style={{width:40,height:40,objectFit:"contain"}}/>:b.icon}</div>
              <div style={{fontSize:11,fontWeight:600,color:"#1a202c",textAlign:"center",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",width:"100%",padding:"0 2px"}}>{b.name}</div>
            </button>);})}
          </div>
        </div>))}
      </>:
      /* Category list */
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {Object.entries(CALC_CATS).filter(([cat]:any)=>!searchQ.trim()||cat.toLowerCase().includes(searchQ.toLowerCase())).map(([cat,rate]:any)=>{
          const examples = (CALC_BRANDS[cat] || []).slice(0,3).map((b:any)=>b.name).join(", ");
          return (
            <button key={cat} onClick={()=>{setSelBrand({name:cat,icon:catIcons[cat]||"other",rate});setCalcPopup(true);setCalcAmt("");setOneTimeSpend(true);setMultiTxnSpend(false);}} style={{width:"100%",height:66,display:"flex",alignItems:"center",gap:14,padding:"12px 12px 14px 12px",background:"#FFFFFF",border:"none",borderRadius:8,cursor:"pointer",fontFamily:FN,boxShadow:"0px 0.62px 4.35px 0px #3F42461C",textAlign:"left",boxSizing:"border-box"}}>
              <div style={{width:38.71,height:40,borderRadius:4.42,border:"1.11px solid #EDEDED",background:catBg[cat]||"#F5F5F5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxSizing:"border-box"}}>{catImgMap[cat]?<img src={catImgMap[cat]} alt={cat} style={{width:36,height:36,objectFit:"contain"}}/>:catIcons[cat]||"❓"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:"#1C2A33",lineHeight:"18px"}}>{cat}</div>
                {examples && <div style={{fontSize:11,color:"#808387",marginTop:3,lineHeight:"14px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{examples}</div>}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="rgba(34, 41, 65, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          );
        })}
      </div>}
    </div>
    </div>

    {calcPopup&&selBrand&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,touchAction:"none",overscrollBehavior:"none"}} onClick={e=>{if(e.target===e.currentTarget){setCalcPopup(false);}}} onTouchMove={e=>e.preventDefault()}>
      <div style={{background:"linear-gradient(360deg, #FFFFFF 87.42%, #FFF4DC 100%)",borderRadius:"24px 24px 0 0",padding:"12px 22px 36px",maxWidth:400,width:"100%",boxShadow:"0 -10px 40px rgba(0,0,0,0.15)",maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch"}} onClick={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(0,0,0,0.1)",margin:"0 auto 16px"}}/>

        {/* Brand header */}
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
          <div style={{width:48,height:48,borderRadius:14,background:catBg[selBrand.name]||bgColors[selBrand.icon]||"#f5f5f5",border:"1.31px solid #E2E8EF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{brandImgMap[selBrand.name]?<img src={brandImgMap[selBrand.name]} alt={selBrand.name} style={{width:32,height:32,objectFit:"contain"}}/>:catImgMap[selBrand.name]?<img src={catImgMap[selBrand.name]} alt={selBrand.name} style={{width:38,height:38,objectFit:"contain"}}/>:selBrand.icon}</div>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#1a202c"}}>{selBrand.name}</div>
            <div style={{fontSize:12,fontWeight:700,color:"#059669",marginTop:3,letterSpacing:"0.04em"}}>BEST REWARD RATE - {calcTab==="Brands"?bestR(selBrand.name):selBrand.rate}%</div>
          </div>
        </div>

        {/* Label */}
        <div style={{fontSize:14,fontWeight:500,color:"#4a5568",marginBottom:8}}>Enter the amount you want to spend</div>

        {/* Input field */}
        <div style={{height:56,borderRadius:8,border:"1px solid #D3D7DF",background:"#FCFEFF",padding:"0 16px",display:"flex",alignItems:"center",marginBottom:16}}>
          <input type="text" inputMode="numeric" placeholder="₹" value={calcAmt?"₹"+calcAmt:""} onChange={e=>{const v=e.target.value.replace(/₹/g,"");setCalcAmt(fmtA(v));}} style={{border:"none",background:"none",outline:"none",fontSize:20,fontWeight:700,color:"#1a202c",fontFamily:FN,width:"100%"}}/>
        </div>

        {/* Quick amounts */}
        <div style={{display:"flex",gap:8.48,marginBottom:20}}>
          {["1,000","5,000","10,000","20,000"].map(a=>{
            const isActive=calcAmt===a;
            return(<button key={a} onClick={()=>setCalcAmt(a)} style={{flex:1,padding:"10px 0",background:isActive?"#EFF6FF":"#fff",border:`1px solid ${isActive?"#3B82F6":"#D3D7DF"}`,borderRadius:10.17,fontSize:12,fontWeight:600,color:isActive?"#3B82F6":"#6b7280",cursor:"pointer",fontFamily:FN}}>₹{a}</button>);
          })}
        </div>

        {/* Spend type toggle hidden — kept the state hooks intact in case the
            downstream calculator still references oneTimeSpend / multiTxnSpend. */}

        {/* CTA */}
        <button onClick={dc} disabled={!calcAmt} style={{width:"100%",height:48.51,borderRadius:10.17,border:"none",background:calcAmt?"linear-gradient(90deg, #222941 0%, #101C43 100%)":"#d1d5db",color:"#fff",fontSize:14,fontWeight:700,cursor:calcAmt?"pointer":"not-allowed",fontFamily:FN,display:"flex",alignItems:"center",justifyContent:"center",gap:8.48,boxShadow:calcAmt?"-0.33px -0.33px 0 rgba(0,0,0,0.686), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2)":"none",padding:"15.26px 20.34px"}}>
          Find my best card for this <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>}
  </div>);
};
