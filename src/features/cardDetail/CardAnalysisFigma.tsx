// @ts-nocheck
import { useMemo, useState } from "react";
import { FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { CD, CARDS } from "@/data/simulation/legacy";
import { USER_CARDS } from "@/data/simulation/inputs";
import { categoryImage } from "@/data/domain/buckets";

/**
 * CardAnalysisFigma — pixel-accurate rebuild of the Figma card-detail
 * "Card Analysis" tab content (User Card Details Page, frame 186:37517).
 *
 * Sections rendered (in order):
 *  1. Total Cashback Earned hero          (₹10,000 / "TOTAL CASHBACK EARNED ON THIS CARD")
 *  2. Period selector + view toggle pill  (Categories | Brands · Last 365 Days ▾)
 *  3. Top brands vertical bar chart       (5 bars w/ rupee labels + 3D icons)
 *  4. Categories list                     (6 white cards w/ icon + transactions + spent + saved)
 *  5. "Make this card work better"        (savings nudge banner)
 *  6. Limits and Capping                  (Credit Limit + 3 capping bars w/ neumorphic shadows)
 *  7. Usage Advise card                   (warning banner)
 *
 * Pure presentational — no state, no effects. Designed to slot directly
 * into the existing detailTab===0 (Card Analysis) branch.
 */

const IMG_MAP: Record<string, string> = {
  Shopping: categoryImage("Shopping"),
  Groceries: categoryImage("Groceries"),
  Bills: categoryImage("Bills"),
  Fuel: categoryImage("Fuel"),
  Travel: categoryImage("Travel"),
  Dining: categoryImage("Dining"),
  "Food Ordering": categoryImage("Food Ordering"),
  Entertainment: categoryImage("Entertainment"),
  "Cab Rides": categoryImage("Cab Rides"),
  Insurance: categoryImage("Insurance"),
  Rent: categoryImage("Rent"),
  Amazon: "/brands/amazon.webp",
  Flipkart: "/brands/flipkart.webp",
  Swiggy: "/brands/swiggy.webp",
  Zomato: "/brands/zomato.webp",
  BigBasket: "/brands/bb.webp",
  Myntra: "/brands/myntra.webp",
  Adidas: "/brands/adiddas.webp",
  MuscleBlaze: "/brands/muscle-blaze.webp",
  Starbucks: "/brands/swiggy.webp",
  "McDonald's": "/brands/zomato.webp",
  DMart: "/brands/bb.webp",
  Dominos: "/brands/zomato.webp",
  MakeMyTrip: categoryImage("Travel"),
  IndiGo: categoryImage("Flights"),
  Cleartrip: categoryImage("Travel"),
  OYO: categoryImage("Hotels"),
  "Booking.com": categoryImage("Hotels"),
  Uber: categoryImage("Cab Rides"),
  Blinkit: "/brands/bb.webp",
  Zepto: "/brands/bb.webp",
  "Swiggy Instamart": "/brands/swiggy.webp",
  Nykaa: "/brands/myntra.webp",
  Ajio: "/brands/myntra.webp",
  Croma: categoryImage("Shopping"),
  "Reliance Digital": categoryImage("Shopping"),
  Jio: categoryImage("Bills"),
  Airtel: categoryImage("Bills"),
  Shell: categoryImage("Fuel"),
  "HP Petrol": categoryImage("Fuel"),
  "Indian Oil": categoryImage("Fuel"),
  "CRED RentPay": categoryImage("Rent"),
  NoBroker: categoryImage("Rent"),
  "Star Health": categoryImage("Insurance"),
  "Nature's Basket": "/brands/bb.webp",
};

const CAP_STYLE = {
  good: { fill: "#4DC20D", inner: "1.5px 1.75px 4px #70FF45 inset" },
  alert: { fill: "#FFA666", inner: "1.5px 1.75px 4px #FFCB45 inset" },
  high: { fill: "#FF7D66", inner: "1.5px 1.75px 4px #FF5D45 inset" },
};

function capStyleForPct(pct: number) {
  if (pct < 40) return CAP_STYLE.good;
  if (pct < 70) return CAP_STYLE.alert;
  return CAP_STYLE.high;
}

// 3-square diamond divider used as section break inside cards (per CLAUDE.md spec)
function DiamondDivider({ color = "#A09784", lineWidth = 268 }: { color?: string; lineWidth?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6, opacity: 0.4, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 3.09, height: 3.09, background: color, transform: "rotate(-45deg)" }} />)}
      </div>
      <div style={{ flex: 1, height: 0, borderTop: `1px dashed ${color}` }} />
    </div>
  );
}

function CapBar({ label, used, total, pct, fill, inner, exceeded }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 10, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: FN, fontWeight: 500, fontSize: 12, lineHeight: "150%", color: "#222941" }}>{label}</span>
          <Info size={12} strokeWidth={2} color="#0064E0" style={{ opacity: 0.5 }} />
        </div>
        <span style={{ fontFamily: FN, fontWeight: 400, fontSize: 9, lineHeight: "140%", letterSpacing: "0.1em", textTransform: "uppercase", color: exceeded ? "#FF5D45" : "#364060" }}>
          {used}/{total} {exceeded ? "EXCEEDED" : "USED"}
        </span>
      </div>
      <div style={{
        width: "100%", height: 16,
        background: "rgba(123, 142, 178, 0.1)",
        boxShadow: "0px 1px 0px rgba(255,255,255,0.19), inset 1px 1px 2px rgba(0,0,0,0.11)",
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: fill,
          boxShadow: `0px 2.75px 5px rgba(0,0,0,0.12), ${inner}, -2px -2px 3.75px rgba(255,255,255,0.6) inset`,
          borderRadius: 4,
        }} />
      </div>
    </div>
  );
}

export function CardAnalysisFigma({ uc, ptName, onSaveMore, onRowClick }: { uc: any; ptName?: string; onSaveMore?: () => void; onRowClick?: (args: { view: "categories" | "brands"; name: string }) => void }) {
  const [view, setView] = useState<"categories" | "brands">("categories");
  const isCash = ptName !== "Reward Points";
  // Strip ₹ prefix from saved/spent labels for points cards so values render as raw points
  const formatSaved = (s: string) => isCash ? s : s.replace(/^₹/, "");
  const formatSpent = (s: string) => isCash ? s : s.replace(/^₹/, "").replace(/^(\d)/, "$1");

  const cardIndex = useMemo(() => CARDS.findIndex((c: any) => c.name === uc?.name), [uc?.name]);
  const cd = (CD?.[cardIndex] || {}) as any;
  const txns = (cd.txns || []) as any[];
  const convRate = USER_CARDS[cardIndex]?.conv_rate || 1;
  const toDisplayUnit = (rupees: number) => isCash ? rupees : Math.round(rupees / convRate);
  const earned30d = useMemo(() => {
    const rupees = txns.reduce((s: number, t: any) => s + (t.saved || 0), 0);
    return toDisplayUnit(rupees);
  }, [txns, convRate, isCash]);

  const { dataset, capBars, totalEarned } = useMemo(() => {
    const txCountByBrand: Record<string, number> = {};
    const txCountByCat: Record<string, number> = {};
    for (const t of txns) {
      if (t?.brand) txCountByBrand[t.brand] = (txCountByBrand[t.brand] || 0) + 1;
      const cat = t?.category || "Other";
      txCountByCat[cat] = (txCountByCat[cat] || 0) + 1;
    }

    const base = view === "categories" ? (cd.categories || []) : (cd.brands || []);
    const rows = (Array.isArray(base) ? base : []).slice(0, 6).map((r: any) => {
      const name = r.name || "Other";
      const spend = Math.round(r.spend || 0);
      const savedRaw = Math.round(r.saved || 0);
      const savedDisplay = toDisplayUnit(savedRaw);
      const txnsCount = view === "categories" ? (txCountByCat[name] || 0) : (txCountByBrand[name] || 0);
  const img = IMG_MAP[name] || (view === "categories" ? categoryImage("Shopping") : null);
      return {
        name,
        img,
        icon: r.icon,
        saved: isCash ? `₹${f(savedDisplay)}` : `${f(savedDisplay)}`,
        txns: `${txnsCount} Transactions`,
        spent: `${f(spend)} SPENT`,
        _saved: savedDisplay,
      };
    });

    const maxSaved = Math.max(1, ...rows.map((r: any) => r._saved || 0));
    const withBars = rows.map((r: any) => ({
      ...r,
      barH: Math.round((r._saved / maxSaved) * 200),
    }));

    const caps = (cd?.limits?.caps || []).map((c: any) => {
      const usedRupees = Math.round(c.used || 0);
      const totalRupees = Math.round(c.total || 0);
      // For points cards, render caps in RP (the cap is enforced in points; mockApi
      // stores it as rupee-equivalent for math). Cashback cards stay in ₹.
      const usedDisplay = toDisplayUnit(usedRupees);
      const totalDisplay = toDisplayUnit(totalRupees);
      const rawPct = totalRupees > 0 ? (usedRupees / totalRupees) * 100 : 0;
      const exceeded = rawPct > 100;
      const pct = Math.min(100, Math.round(rawPct));
      const st = exceeded ? { fill: "#FF7D66", inner: "1.5px 1.75px 4px #FF5D45 inset" } : capStyleForPct(pct);
      const unit = isCash ? "₹" : " RP";
      return {
        label: c.name || "Spends",
        used: isCash ? `${unit}${f(usedDisplay)}` : `${f(usedDisplay)}${unit}`,
        total: isCash ? `${unit}${f(totalDisplay)}` : `${f(totalDisplay)}${unit}`,
        pct,
        exceeded,
        fill: st.fill,
        inner: st.inner,
      };
    });

    const earnedRupees = Math.round(cd.totalSaved || 0);
    const earnedDisplay = toDisplayUnit(earnedRupees);
    const totalEarned = isCash ? `₹${f(earnedDisplay)}` : `${f(earnedDisplay)}`;
    return { dataset: withBars, capBars: caps, totalEarned };
  }, [txns, cd, view, isCash]);

  return (
    <div style={{ padding: "0", display: "flex", flexDirection: "column" }}>

      {/* ───── 0. Reward Points hero card (only for points cards) ───── */}
      {!isCash && (<>
        <div style={{ padding: "24px 16px 0" }}>
          <div style={{ filter: "drop-shadow(0px 0.62px 4.35px rgba(64,63,70,0.05))", display: "flex", flexDirection: "column" }}>
            {/* Top half — points balance */}
            <div style={{
              boxSizing: "border-box",
              background: "linear-gradient(97.69deg, #FBFCFE 19.64%, #F1F6FE 89.39%)",
              borderWidth: "1px 1px 0 1px",
              borderStyle: "solid",
              borderColor: "#D5E0F9",
              boxShadow: "0px 0.62px 4.35px rgba(63,66,70,0.11)",
              borderRadius: "8px 8px 0 0",
              padding: "24px 16px",
              display: "flex", flexDirection: "row", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 66, height: 65, borderRadius: "50%",
                background: "#DCE7FD",
                border: "2.54px solid rgba(255,255,255,0.6)",
                flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                <img src="/legacy-assets/opt/0e60286a81e4.webp" alt="" style={{ width: 50, height: 50, objectFit: "contain" }}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: FN, fontWeight: 400, fontSize: 12, lineHeight: "120%", color: "#0A2E4C" }}>Rewards Points you currently have</span>
                  <span className="legacy-serif" style={{ fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 800, fontSize: 25, lineHeight: "28px", color: "#0A2E4C" }}>{f(uc.availPts || 0)}</span>
                </div>
                <span style={{ fontFamily: FN, fontWeight: 500, fontSize: 11, lineHeight: "120%", color: "#037B5E" }}>+{f(earned30d)} Earned in last 30 days</span>
              </div>
            </div>
            {/* Bottom half — expiring claim row (hidden if no points expiring) */}
            {uc.points_expiring && uc.points_expiring.amount > 0 && (
            <div style={{
              boxSizing: "border-box",
              background: "linear-gradient(124.24deg, rgba(255,255,255,0.3) 56.13%, rgba(238,243,245,0.3) 73.6%), #FFFFFF",
              border: "1px solid #D5E0F9",
              borderRadius: "0 0 12px 12px",
              padding: "12px 16px",
              display: "flex", flexDirection: "row", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 30, height: 32, background: "#FEF6EB", borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <path d="M8 0.75L15.25 13.25H0.75L8 0.75Z" stroke="#F79A18" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M8 5.5V8.5" stroke="#F79A18" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="10.75" r="0.75" fill="#F79A18"/>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: FN, fontWeight: 500, fontSize: 12, lineHeight: "21px", color: "#F79A18" }}>{f(uc.points_expiring.amount)} Points Expiring</span>
                <span style={{ fontFamily: FN, fontWeight: 400, fontSize: 11, lineHeight: "160%", color: "#808387" }}>In {uc.points_expiring.days_until} Days</span>
              </div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0, cursor: "pointer" }}>
                <span style={{ fontFamily: FN, fontWeight: 600, fontSize: 12, lineHeight: "18px", color: "#232A42" }}>Claim Now</span>
                <ChevronRight size={12} strokeWidth={1.8} color="#232A42" />
              </div>
            </div>
            )}
          </div>
        </div>
        {/* Green-tinted divider strip between the two hero sections */}
        <div style={{ height: 10, background: "rgba(23,73,47,0.06)", marginTop: 32 }} />
      </>)}

      {/* ───── 1. Total earned hero (title left, period pill right) ───── */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "32px 16px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
          <div className="legacy-serif" style={{
            fontFamily: "'Blacklist','Google Sans',serif",
            fontWeight: 800, fontSize: 22, lineHeight: "24px", color: "#0A4C10",
          }}>
            {totalEarned}
          </div>
          <div style={{
            fontFamily: FN, fontWeight: 500, fontSize: 10, lineHeight: "17px",
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#7B8398",
          }}>
            Total {isCash ? "Cashback" : "Reward Points"} Earned on this card
          </div>
        </div>
        <div style={{
          display: "flex", flexDirection: "row", alignItems: "center", gap: 6,
          padding: "8px 14px",
          background: "#F4F8FF",
          boxShadow: "0.44px 0.44px 0.63px -0.75px rgba(0,0,0,0.26), 1.21px 1.21px 1.71px -1.5px rgba(0,0,0,0.247), 2.66px 2.66px 3.76px -2.25px rgba(0,0,0,0.23), 10px 10px 21.21px -3.75px rgba(0,0,0,0.055), inset 1px 1px 1px #FFFFFF, inset -1px -1px 0px rgba(0,0,0,0.1)",
          borderRadius: 6,
          flexShrink: 0,
          marginTop: 2,
        }}>
          <span style={{ fontFamily: FN, fontWeight: 600, fontSize: 10, lineHeight: "150%", color: "#222941" }}>Last 365 Days</span>
          <ChevronDown size={11} strokeWidth={1.8} color="#222941" />
        </div>
      </div>

      {/* ───── 2. Categories / Brands segmented toggle (full width) ───── */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{
          display: "flex", flexDirection: "row", alignItems: "stretch",
          padding: 2, gap: 0,
          background: "rgba(6, 60, 109, 0.03)",
          boxShadow: "0px 1px 0px rgba(255,255,255,0.25), inset 0px 1px 2px rgba(6,60,109,0.15)",
          borderRadius: 8,
          width: "100%",
        }}>
          {[
            { key: "categories", label: "Categories" },
            { key: "brands",     label: "Brands"     },
          ].map(t => {
            const active = view === t.key;
            return (
              <div key={t.key} onClick={() => setView(t.key as any)} style={{
                flex: 1, padding: "8px 16px", display: "flex", justifyContent: "center", alignItems: "center",
                background: active ? "#F4F8FF" : "transparent",
                boxShadow: active ? "0.44px 0.44px 0.63px -0.75px rgba(0,0,0,0.26), 1.21px 1.21px 1.71px -1.5px rgba(0,0,0,0.247), 2.66px 2.66px 3.76px -2.25px rgba(0,0,0,0.23), 10px 10px 21.21px -3.75px rgba(0,0,0,0.055), inset 1px 1px 1px #FFFFFF, inset -1px -1px 0px rgba(0,0,0,0.1)" : "none",
                borderRadius: 6,
                fontFamily: FN, fontWeight: active ? 500 : 400, fontSize: 12, lineHeight: "140%", letterSpacing: "-0.01em",
                color: active ? "rgba(74, 83, 112, 0.9)" : "rgba(74, 83, 112, 0.7)",
                cursor: "pointer",
                transition: "background 0.18s ease, box-shadow 0.18s ease, color 0.18s ease",
              }}>{t.label}</div>
            );
          })}
        </div>
      </div>

      {/* ───── 3. Vertical bar chart — column = label / icon / bar ───── */}
      <div style={{ position: "relative", margin: "16px 16px 8px", height: 280, padding: "8px 8px 0", overflow: "hidden" }}>
        {/* Faint dashed horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <div key={p} style={{
            position: "absolute", left: 8, right: 8,
            top: `calc(8px + ${p} * (280px - 16px))`, height: 0,
            borderTop: "1px dashed rgba(5,34,73,0.12)",
          }} />
        ))}
        {/* Columns */}
        <div style={{
          position: "absolute", left: 16, right: 16, top: 8, bottom: 0,
          display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
        }}>
          {dataset.slice(0, 5).map((b, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              width: 50, flexShrink: 0,
            }}>
              <span style={{
                fontFamily: FN, fontWeight: 600, fontSize: 11, lineHeight: "16px",
                color: b.barH > 0 ? "#3A4252" : "rgba(58,66,82,0.4)",
                marginBottom: 4,
              }}>{formatSaved(b.saved)}</span>
              <img src={b.img} alt="" style={{ width: 42, height: 42, objectFit: "contain", marginBottom: 4 }} />
              <div style={{
                width: 40, height: Math.max(b.barH, 4),
                background: "linear-gradient(180deg, #10A783 0%, #007156 100%)",
                border: "1px solid #007156",
                boxShadow: "inset 0px 2px 0px rgba(255,255,255,0.4)",
                borderRadius: "8px 8px 0 0",
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* ───── 4. Top categories list ───── */}
      <div style={{ padding: "28px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {dataset.map((b, i) => (
          <div key={i} onClick={() => onRowClick && onRowClick({ view, name: b.name })} style={{
            display: "flex", flexDirection: "column", padding: "12px 14px 14px 12px",
            background: "#FFFFFF", boxShadow: "0px 0.62px 4.35px rgba(63,66,70,0.11)", borderRadius: 8,
            cursor: onRowClick ? "pointer" : "default",
          }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 13 }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{
                  width: 38.71, height: 40, borderRadius: 4.42, border: "1.11px solid #EDEDED",
                  background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, overflow: "hidden", position: "relative",
                }}>
                  {/* Render a safe fallback first, then overlay the logo if we have it. */}
                  <span style={{ fontSize: 16, lineHeight: "16px", color: "#364060" }}>
                    {b.icon || (b.name ? b.name[0] : "•")}
                  </span>
                  {b.img && (
                    <img
                      src={b.img}
                      alt=""
                      style={{ width: 32, height: 32, objectFit: "contain", position: "absolute" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span style={{ fontFamily: FN, fontWeight: 600, fontSize: 12, lineHeight: "150%", color: "#364060" }}>{b.name}</span>
                  <span style={{ fontFamily: FN, fontWeight: 500, fontSize: 10, lineHeight: "140%", color: "#808387" }}>{b.txns}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{
                    fontFamily: FN, fontWeight: 600, fontSize: 12, lineHeight: "150%", letterSpacing: "-0.01em",
                    color: (b.saved === "₹0" || b.saved === "0") ? "#9BA3B5" : "#017559",
                    textAlign: "right",
                  }}>{formatSaved(b.saved)}</span>
                  <span style={{
                    fontFamily: FN, fontWeight: 600, fontSize: 9, lineHeight: "120%",
                    letterSpacing: "0.1em", textTransform: "uppercase", color: "#808387", textAlign: "right",
                  }}>{b.spent}</span>
                </div>
                <ChevronRight size={12} strokeWidth={1.5} color="#222941" style={{ flexShrink: 0 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ───── 5. Make this card work better ───── */}
      <div onClick={() => onSaveMore && onSaveMore()} style={{
        margin: "28px 16px 0",
        position: "relative",
        background: "linear-gradient(180deg, #FFFFFF 0%, #FDF9F9 26.22%)",
        boxShadow: "0px 0px 8px rgba(126,6,6,0.1)",
        borderRadius: 8,
        padding: "19px 18px",
        cursor: onSaveMore ? "pointer" : "default",
      }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
          {/* layered card icon */}
          <div style={{ position: "relative", width: 38, height: 56, flexShrink: 0, marginTop: 2 }}>
            <div style={{ position: "absolute", left: 0,  top: 0,  width: 30, height: 40, background: "#C23434", borderRadius: 4 }} />
            <div style={{ position: "absolute", left: 8,  top: 16, width: 30, height: 40, background: "#ED8B3A", borderRadius: 4 }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{
              fontFamily: FN, fontWeight: 600, fontSize: 9, lineHeight: "11px",
              letterSpacing: "0.2em", textTransform: "uppercase", color: "#808387",
            }}>Make this cards work better</span>
            <span style={{
              fontFamily: FN, fontWeight: 500, fontSize: 14, lineHeight: "150%", color: "#364060",
            }}>You can save upto <strong style={{ fontWeight: 700 }}>₹{f(cd.potential || 0)}</strong> with this card if used the right way</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}><DiamondDivider color="#A09784" /></div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "row", alignItems: "center", gap: 7 }}>
          <span style={{
            fontFamily: FN, fontWeight: 600, fontSize: 10, lineHeight: "150%",
            letterSpacing: "0.15em", textTransform: "uppercase", color: "#C23434",
          }}>See how you can save more</span>
          <ChevronRight size={9} strokeWidth={2} color="#C23434" />
        </div>
      </div>

      {/* ───── thin section break before Limits ───── */}
      <div style={{ height: 10, background: "rgba(23,73,47,0.06)", marginTop: 32 }} />

      {/* ───── 6. Limits and Capping ───── */}
      <div style={{ padding: "28px 16px 0", display: "flex", flexDirection: "column", gap: 24 }}>
        <h2 className="legacy-serif" style={{
          margin: 0, fontFamily: "'Blacklist','Google Sans',serif",
          fontWeight: 700, fontSize: 20, lineHeight: "140%", letterSpacing: "-0.01em",
          color: "rgba(54, 64, 96, 0.9)",
        }}>Limits and Capping</h2>

        {/* Credit limit row */}
        {(()=>{const clPct = cd.limits?.creditTotal > 0 ? Math.round((cd.limits.creditUsed / cd.limits.creditTotal) * 100) : 0; const clStyle = capStyleForPct(clPct); return(
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
            <span style={{ fontFamily: FN, fontWeight: 500, fontSize: 12, lineHeight: "150%", color: "#222941" }}>{clPct}% Credit Limit Used</span>
            <span style={{ fontFamily: FN, fontWeight: 400, fontSize: 9, lineHeight: "140%", letterSpacing: "0.1em", textTransform: "uppercase", color: "#364060" }}>₹{f(cd.limits?.creditUsed || 0)}/₹{f(cd.limits?.creditTotal || 0)} USED</span>
          </div>
          <div style={{
            width: "100%", height: 16,
            background: "rgba(123, 142, 178, 0.1)",
            boxShadow: "0px 1px 0px rgba(255,255,255,0.19), inset 1px 1px 2px rgba(0,0,0,0.11)",
            borderRadius: 4, overflow: "hidden", position: "relative",
          }}>
            <div style={{
              width: `${clPct}%`, height: "100%",
              background: clStyle.fill,
              boxShadow: `0px 2.75px 5px rgba(0,0,0,0.12), ${clStyle.inner}, -2px -2px 3.75px rgba(255,255,255,0.6) inset`,
              borderRadius: 4,
            }} />
          </div>
        </div>
        );})()}

        {/* Dashed full-width divider */}
        <div style={{ width: "100%", height: 0, borderTop: "1px dashed rgba(5,34,73,0.15)" }} />

        {/* Capping eyebrow + diamond */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
          <span style={{
            fontFamily: FN, fontWeight: 600, fontSize: 9.28, lineHeight: "11px",
            letterSpacing: "0.2em", textTransform: "uppercase", color: "#2F374B",
          }}>Capping on reward Spends</span>
          <div style={{ flex: 1 }}><DiamondDivider color="#848CA0" /></div>
        </div>

        {/* 3 capping bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 23 }}>
          {capBars.map((c: any, i: number) => <CapBar key={i} {...c} />)}
        </div>
      </div>

      {/* ───── 7. Usage Advise ───── */}
      <div style={{
        margin: "40px 16px 28px",
        background: "linear-gradient(180deg, #FFFFFF 0%, #FDFAF9 26.22%)",
        boxShadow: "0px 0px 8px rgba(126,104,6,0.1)",
        borderRadius: 8,
        padding: "19px 18px",
      }}>
        <span style={{
          fontFamily: FN, fontWeight: 600, fontSize: 9, lineHeight: "11px",
          letterSpacing: "0.2em", textTransform: "uppercase", color: "#808387", display: "block", marginBottom: 8,
        }}>Usage Advise</span>
        <span style={{
          fontFamily: FN, fontWeight: 500, fontSize: 14, lineHeight: "150%", color: "#364060",
        }}>{(()=>{ const approaching = (cd.limits?.caps || []).find((c: any) => c.total > 0 && (c.used / c.total) > 0.7); return approaching ? `Your Max Cap on ${approaching.name} is approaching soon. Limit usage of this card on ${approaching.name} to avoid losing benefits` : "Review your spending patterns to maximize rewards"; })()}</span>
      </div>
    </div>
  );
}
