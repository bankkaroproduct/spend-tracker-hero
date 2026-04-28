// @ts-nocheck
import { useState } from "react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { CALC_BRANDS, CALC_CATS, CALC_CARDS, SPEND_BRANDS, CD } from "@/data/simulation/legacy";
import { USER_CARDS } from "@/data/simulation/inputs";
import { calculateResponses } from "@/data/simulation/mockApi";
import { useAppContext } from "@/store/AppContext";

const cardColors = { "HSBC Travel One": ["#0c2340", "#1a5276"], "Axis Flipkart": ["#5b2c8e", "#8b5cf6"], "HSBC Live+": ["#006d5b", "#00a086"] };
const howToEarn = { "HSBC Travel One": { "default": "Use your HSBC Travel One card directly at checkout. Earns 1 point per ₹150 on domestic spends, 6x on international. Redeem on HSBC Rewards catalogue for travel vouchers.", "MakeMyTrip": "Pay on MakeMyTrip with HSBC Travel One. Earns 3x points on travel bookings. Points best redeemed for flights via HSBC SmartBuy.", "Uber": "Book rides on Uber. Earns 2x points as a dining/transport merchant on HSBC Travel One." }, "Axis Flipkart": { "default": "Use Axis Flipkart at checkout. Cashback auto-credited to your next statement. No manual redemption needed.", "Flipkart": "Pay on Flipkart app/website. 5% cashback auto-credited. Works on all Flipkart purchases except gift cards & EMI.", "Myntra": "Shop on Myntra app/website. 4% cashback as preferred merchant. Cashback credited next billing cycle.", "Swiggy": "Order on Swiggy app. 4% cashback as preferred merchant. Doesn't apply to Instamart.", "Uber": "Book rides on Uber app. 4% cashback as preferred merchant. Credited to statement." }, "HSBC Live+": { "default": "Use HSBC Live+ anywhere. Flat 1.5% unlimited cashback on all spends, auto-credited to statement. No categories, no caps, no hassle." } };
const CARD_IMG_MAP = {
  "Axis Flipkart": "/legacy-assets/cards/axis-flipkart.png",
  "HSBC Travel One": "/legacy-assets/cards/HSBC TravelOne Credit Card.png",
  "HSBC Live+": "/legacy-assets/cards/hsbc-live.png",
  "Amex Platinum": "/legacy-assets/cards/amex-platinum-travel.png",
};
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
  const [bestPlacesExpanded, setBestPlacesExpanded] = useState(false);

  const brandImgMap: Record<string,string>={"Amazon":"/brands/amazon.png","Flipkart":"/brands/flipkart.png","Myntra":"/brands/myntra.png","Swiggy":"/brands/swiggy.png","Zomato":"/brands/zomato.png","BigBasket":"/brands/bb.png","Adidas":"/brands/adiddas.png","MuscleBlaze":"/brands/muscle-blaze.png"};
  const allB = Object.entries(CALC_BRANDS).flatMap(([cat, bs]: any) => bs.map((b: any) => ({ ...b, category: cat })));
  const hits = searchQ.trim() ? allB.filter((b: any) => b.name.toLowerCase().includes(searchQ.toLowerCase())) : null;
  const bestR = (q: string) => Math.max(...CALC_CARDS.map((cc: any) => cc.rates[q] ?? cc.rates.default));
  const fmtA = (v: string) => { const n = v.replace(/[^\d]/g, ""); return n ? parseInt(n).toLocaleString("en-IN") : ""; };
  const catKeys = Object.keys(CALC_BRANDS);
  const topBrandNames = SPEND_BRANDS.slice(0, 8).map((b: any) => b.name);
  const topBrandsFromCalc = allB.filter((b: any) => topBrandNames.includes(b.name));
  const filteredBrands = calcFilter === "All" ? { "Your Top Brands": topBrandsFromCalc, ...CALC_BRANDS } : calcFilter === "Your Top Brands" ? { "Your Top Brands": topBrandsFromCalc } : { [calcFilter]: CALC_BRANDS[calcFilter] || [] };
  const dc = () => { const a = parseInt(calcAmt.replace(/,/g, "")) || 0; if (!a) return; const q = calcTab === "Brands" ? selBrand?.name : "general"; const r = CALC_CARDS.map((cc: any) => { const rt = calcTab === "Brands" ? (cc.rates[q] ?? cc.rates.default) : cc.rates.default; return { ...cc, rate: Math.round(rt * 100) / 100, saved: Math.round(a * rt / 100) }; }).sort((a: any, b: any) => b.saved - a.saved); setCalcResult({ results: r, query: selBrand?.name || "this category", amount: a, brandName: selBrand?.name }); setCalcPopup(false); setHowExpanded(null); };

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
      { name: "Amazon", icon: bAmazon?.icon ?? "📦", tileBg: "#FFE8DC", save: Math.round(amountNum * (bAmazon?.rate ?? 2.5) / 100) },
      { name: "Myntra", icon: bMyntra?.icon ?? "👗", tileBg: "#FFDCF4", save: Math.round(amountNum * (bMyntra?.rate ?? 7.5) / 100) },
      { name: "Shopclues", icon: "🧭", tileBg: "#D9FFF9", save: Math.round(amountNum * 4 / 100) },
      { name: "Swiggy", icon: bSwiggy?.icon ?? "🍔", tileBg: "#FFEFD6", save: Math.round(amountNum * (bSwiggy?.rate ?? 4) / 100) },
      { name: "Uber", icon: bUber?.icon ?? "🚗", tileBg: "#E8E5FF", save: Math.round(amountNum * (bUber?.rate ?? 4) / 100) },
      { name: "Tata CLiQ", icon: "🛍️", tileBg: "#FFE0E0", save: Math.round(amountNum * 3 / 100) },
    ];
    const bestRewardLabel = best.type?.toLowerCase().includes("point") ? `${best.rate}% REWARDS` : `${best.rate}% CASHBACK ON ${(calcResult.query || "").toUpperCase()}`;

    const walletCards = calcResult.results.slice(1).map((r: any) => {
      const rateLabel = r.type?.toLowerCase().includes("point")
        ? `₹100 → ${r.rate}RP`
        : `${r.rate}% CASHBACK`;
      return {
        name: r.name,
        rate: rateLabel,
        save: `₹${f(r.saved)}`,
        img: CARD_IMG_MAP[r.name] || null,
      };
    });
    const marketCards = [
      { name: "Amex Platinum", rate: "VARIES BY BRAND", save: "Varies", img: CARD_IMG_MAP["Amex Platinum"] },
    ];

    const cashkaroPct = 2;
    const cashkaroAmt = Math.round(calcResult.amount * cashkaroPct / 100);
    const totalWithCashkaro = best.saved + cashkaroAmt;
    return (
      <div className="slide-in" style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", background: "#F5F9FA", height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        <FL/>
        <div data-scroll="1" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", position: "relative" }}>
          {cashkaroExpanded && (
            <div onClick={() => setCashkaroExpanded(false)} style={{ position: "sticky", top: 0, height: 0, zIndex: 40, pointerEvents: "auto" }}>
              <div style={{ position: "absolute", inset: 0, height: "100vh", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
        </div>
          )}
          <div style={{ background: "linear-gradient(180deg, #2F117B -15.07%, #432054 112.18%)", padding: "0 0 28px", color: "#fff" }}>
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

            {/* Best places to use this card */}
            {(() => {
              const bestCard = CALC_CARDS.find((c: any) => c.name === best.name);
              if (!bestCard) return null;
              const brandRows = Object.entries(bestCard.rates)
                .filter(([k, v]: any) => k !== "default" && v > bestCard.rates.default)
                .map(([k, v]: any) => ({ name: k, rate: v, savings: Math.round(calcResult.amount * v / 100) }))
                .sort((a: any, b: any) => b.rate - a.rate)
                .slice(0, 6);
              const baseRate = bestCard.rates.default;
              const baseSavings = Math.round(calcResult.amount * baseRate / 100);
              return (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, marginTop: 8 }}>
                    <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 0, borderTop: "1px solid #E8F0F1" }} />
                    <div style={{ transform: "rotate(0.12deg)", position: "relative", zIndex: 1 }}>
                      <button type="button" onClick={() => setBestPlacesExpanded(v => !v)} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 31, padding: "8px 16px", borderRadius: 6, border: "1px solid #1733900F", background: "linear-gradient(90deg, #F5F9FF 0%, #FFFFFF 100%)", fontSize: 11, fontWeight: 600, color: "#222941", lineHeight: "15px", boxShadow: "0px 1px 2px 0px #0000000F", cursor: "pointer", fontFamily: FN, whiteSpace: "nowrap", boxSizing: "border-box" }}>
                        {bestPlacesExpanded ? "Hide Best Places" : "Best Places to Use"}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: bestPlacesExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6" stroke="#222941" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                  {bestPlacesExpanded && (
                    <div className="expand-down" style={{ background: "#fff", borderRadius: 10, border: "1px solid #E8F0F1", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)", overflow: "hidden" }}>
                      <div style={{ padding: "18px 16px 14px", textAlign: "center" }}>
                        <div className="legacy-serif" style={{ fontSize: 17, fontWeight: 700, color: "#222941", lineHeight: "22px" }}>Best places to use this card</div>
                        <div style={{ fontSize: 13, fontWeight: 400, color: "#808387", marginTop: 4, lineHeight: "18px" }}>Unlock maximum rewards</div>
                      </div>
                      <div style={{ height: 0, borderTop: "0.5px dashed rgba(0,0,0,0.1)", margin: "0 16px" }} />
                      {/* Table header */}
                      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px 10px", background: "#F5F8FA" }}>
                        <div style={{ flex: 1, fontSize: 9, fontWeight: 700, color: "#848CA0", letterSpacing: "0.2em", textTransform: "uppercase" }}>Brand</div>
                        <div style={{ width: 52, textAlign: "center", fontSize: 9, fontWeight: 700, color: "#848CA0", letterSpacing: "0.2em", textTransform: "uppercase" }}>Rate</div>
                        <div style={{ width: 64, textAlign: "right", fontSize: 9, fontWeight: 700, color: "#848CA0", letterSpacing: "0.2em", textTransform: "uppercase" }}>You Get</div>
                      </div>
                      {/* Brand rows */}
                      {brandRows.map((br: any, i: number) => (
                        <div key={br.name} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: i < brandRows.length - 1 ? "0.5px dashed rgba(0,0,0,0.1)" : "none" }}>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                            {brandImgMap[br.name] ? (
                              <img src={brandImgMap[br.name]} alt={br.name} style={{ width: 24, height: 24, objectFit: "contain", borderRadius: 4 }} />
                            ) : (
                              <div style={{ width: 24, height: 24, borderRadius: 4, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                                {br.name.charAt(0)}
                              </div>
                            )}
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#36405E" }}>{br.name}</span>
                          </div>
                          <div style={{ width: 52, textAlign: "center", fontSize: 12, fontWeight: 600, color: "#808387" }}>{br.rate}%</div>
                          <div style={{ width: 64, textAlign: "right", fontSize: 14, fontWeight: 600, color: "#008846" }}>{"₹"}{f(br.savings)}</div>
                        </div>
                      ))}
                      {/* Base rate row */}
                      <div style={{ margin: "0 12px 12px", padding: "10px 12px", background: "#FFFEF5", border: "1px solid #FFF3C4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#222941" }}>Base Rate - {baseRate}%</div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "#848CA0", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 2 }}>ON ANY OTHER BRAND</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#008846" }}>{"₹"}{f(baseSavings)}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ ...calcSectionTitleStyle, marginTop: 20 }}>Other cards in your wallet</div>
            {walletCards.map((card) => (
              <div key={card.name} style={{ background: "#fff", borderRadius: 10, border: "1px solid #E8F0F1", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                {card.img ? (
                  <img src={card.img} alt={card.name} style={{ width: 52, height: 34, objectFit: "cover", borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
                ) : (
                  <div style={{ width: 52, height: 34, borderRadius: 6, background: "linear-gradient(135deg,#2d3748,#1a202c)" }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#36405E", lineHeight: "18px" }}>{card.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#098039", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{card.rate}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#808387", lineHeight: "17px" }}>Save</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#008846", letterSpacing: "0.01em" }}>{card.save}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="rgba(34, 41, 65, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}

            <div style={{ ...calcSectionTitleStyle, marginTop: 18 }}>Best cards in the market</div>
            {marketCards.map((card) => (
              <div key={card.name} style={{ background: "#fff", borderRadius: 10, border: "1px solid #E8F0F1", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                {card.img ? (
                  <img src={card.img} alt={card.name} style={{ width: 52, height: 34, objectFit: "cover", borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
                ) : (
                  <div style={{ width: 52, height: 34, borderRadius: 6, background: "linear-gradient(135deg,#2d3748,#1a202c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                    {card.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#36405E", lineHeight: "18px" }}>{card.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#098039", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{card.rate}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#808387", lineHeight: "17px" }}>Save</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#008846", letterSpacing: "0.01em" }}>{card.save}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="rgba(34, 41, 65, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button type="button" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, height: 31, padding: "8px 16px", borderRadius: 6, border: "1px solid #1733900F", background: "linear-gradient(90deg, #F5F9FF 0%, #FFFFFF 100%)", fontSize: 11, fontWeight: 600, color: "#222941", lineHeight: "15px", boxShadow: "0px 1px 2px 0px #0000000F", cursor: "pointer", fontFamily: FN, transform: "rotate(0.12deg)", boxSizing: "border-box", whiteSpace: "nowrap" }}>
                View More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#222941" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 21px 22px" }}>
            <button type="button" style={{ width: "100%", maxWidth: 316, height: 48.51, borderRadius: 10.17, border: "none", background: "linear-gradient(90deg, #222941 0%, #101C43 100%)", padding: "15.26px 20.34px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8.48, boxShadow: CASHKARO_CTA_SHADOW, cursor: "pointer", fontFamily: FN }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#E8E8E8", lineHeight: "18px" }}>Shop on Flipkart via</span>
              <img src="/legacy-assets/Cashkaro.png" alt="CashKaro" style={{ height: 10, objectFit: "contain", display: "block" }} />
              <svg width="7" height="12" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Selection page */
  const catImgMap: Record<string,string>={"Shopping":"/categories/shopping.png","Groceries":"/categories/groceries.png","Food Delivery":"/categories/food.png","Travel":"/categories/travel.png","Bills & Recharges":"/categories/bills.png","Fuel":"/categories/fuel.png","Entertainment":"/categories/entertainment.png","Cab Rides":"/categories/cab.png","Dining Out":"/categories/dining.png"};
  const bgColors={"🛒":"#FFF4DC","📦":"#FFF3E0","👗":"#FCE4EC","💄":"#FCE4EC","🟠":"#FFF3E0","🔴":"#FFEBEE","🥦":"#E8F5E9","✈️":"#E3F2FD","🚗":"#F3E5F5","🎬":"#E8EAF6","💊":"#E0F7FA","📚":"#FAFAFA","🛡️":"#E8F5E9","⚡":"#FFFDE7","👔":"#E3F2FD","🏷️":"#F3E5F5","📱":"#FFF3E0","👓":"#E3F2FD","🟡":"#FFFDE7","🌍":"#E8F5E9","🏨":"#FFF8E1","🏍️":"#FFEBEE","🔵":"#E3F2FD","☕":"#EFEBE9","🍕":"#FFF3E0","🍔":"#FFF8E1","🍗":"#FFF3E0","🟢":"#E8F5E9","📡":"#E8EAF6","🏋️":"#FCE4EC","🩺":"#E0F7FA","🎓":"#F3E5F5","🏃":"#E8F5E9","🏠":"#FFF8E1","🧵":"#FCE4EC","💎":"#FFFDE7","💧":"#E3F2FD","🔥":"#FFF3E0","🟣":"#F3E5F5"};
  const catIcons={"Shopping":"🛍️","Groceries":"🥦","Food Delivery":"🍔","Travel":"✈️","Bills & Recharges":"📄","Fuel":"⛽","Entertainment":"🎬","Health":"💊","Education":"🎓","Insurance":"🛡️","Cab Rides":"🚗","Dining Out":"🍽️","Rent":"🏠","Fashion":"👗"};
  const catBg={"Shopping":"#EDE7F6","Groceries":"#E8F5E9","Food Delivery":"#FFF3E0","Travel":"#E3F2FD","Bills & Recharges":"#FFF8E1","Fuel":"#E0F2F1","Entertainment":"#FCE4EC","Health":"#E0F7FA","Education":"#F3E5F5","Insurance":"#E8F5E9","Cab Rides":"#F3E5F5","Dining Out":"#FFF3E0","Rent":"#FFF8E1","Fashion":"#FCE4EC"};

  return (<div key="calc" style={{fontFamily:FN,maxWidth:400,margin:"0 auto",background:"#f5f9fa"}}>
    <FL/>
    <div className="slide-in" style={{minHeight:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

    {/* ── HEADER ── */}
    <div style={{background:"linear-gradient(180deg, #2F117B -15.07%, #432054 112.18%)",padding:"0 0 24px",color:"#fff",flexShrink:0}}>
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
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#fff",borderRadius:12,border:`1.31px solid ${searchQ?"#432054":"#E2E8EF"}`,boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:16}}>
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
          const catKey = cat === "Shopping" ? "Online Shopping" : cat === "Cab Rides" ? "Cab & Transport" : cat === "Health" ? "Health & Wellness" : cat === "Fashion" ? "Fashion & Lifestyle" : cat === "Food Delivery" ? "Food Delivery" : cat;
          const examples = (CALC_BRANDS[catKey] || []).slice(0,3).map((b:any)=>b.name).join(", ");
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
      <div style={{background:"linear-gradient(360deg, #FFFFFF 87.42%, #EDE7F6 100%)",borderRadius:"24px 24px 0 0",padding:"12px 22px 36px",maxWidth:400,width:"100%",boxShadow:"0 -10px 40px rgba(0,0,0,0.15)",maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch"}} onClick={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()}>
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

        {/* Spend type toggle */}
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24}}>
          <label onClick={()=>setOneTimeSpend(!oneTimeSpend)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:600,color:oneTimeSpend?"#1a202c":"#6b7280"}}>
            <div style={{width:22,height:22,borderRadius:4,background:oneTimeSpend?"#1d4ed8":"#fff",border:oneTimeSpend?"none":"1.5px solid #D3D7DF",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {oneTimeSpend&&<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            One Time Spend
          </label>
          <label onClick={()=>setMultiTxnSpend(!multiTxnSpend)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:600,color:multiTxnSpend?"#1a202c":"#6b7280"}}>
            <div style={{width:22,height:22,borderRadius:4,background:multiTxnSpend?"#1d4ed8":"#fff",border:multiTxnSpend?"none":"1.5px solid #D3D7DF",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {multiTxnSpend&&<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            Multiple Transactions
          </label>
        </div>

        {/* CTA */}
        <button onClick={dc} disabled={!calcAmt} style={{width:"100%",height:48.51,borderRadius:10.17,border:"none",background:calcAmt?"linear-gradient(90deg, #222941 0%, #101C43 100%)":"#d1d5db",color:"#fff",fontSize:14,fontWeight:700,cursor:calcAmt?"pointer":"not-allowed",fontFamily:FN,display:"flex",alignItems:"center",justifyContent:"center",gap:8.48,boxShadow:calcAmt?"-0.33px -0.33px 0 rgba(0,0,0,0.686), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2)":"none",padding:"15.26px 20.34px"}}>
          Find my best card for this <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>}
  </div>);
};
