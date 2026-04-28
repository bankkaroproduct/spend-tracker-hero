// @ts-nocheck
import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, createContext, useContext } from "react";
import { NavBar } from "@/components/shared/NavBar";
import { BottomSheets } from "@/components/sheets/BottomSheets";
import { useAppContext } from "@/store/AppContext";
import { useWebHaptics } from "web-haptics/react";
import "./legacy.css";
import {
  ASSET_BASE,
  ChevronRight,
} from "./LegacyShared";
import { SAVINGS_BARS, CARD_PROMO, SPEND_DIST_WITH_ULTIMATE, SPEND_DIST_WITHOUT_ULTIMATE, TOTAL_ACC, ALL_ACTIONS, OPT_BRANDS, SPEND_CATS } from "@/data/simulation/legacy";
import { f } from "@/lib/format";
import { ALL_INPUT_BUCKETS, ANNUAL_BUCKETS, LOUNGE_BUCKETS, RESPONSE_ONLY_BUCKETS, BUCKET_TO_CATEGORY, SPEND_PROFILE, BUCKET_TO_MERCHANT } from "@/data/simulation/inputs";
import { calculateResponses, getBestCardForBucket, getBestMarketCardForBucket } from "@/data/simulation/mockApi";

const HapticCtx = createContext({ trigger: () => {} });
const useHaptic = () => useContext(HapticCtx);

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView(0.1);
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO — Starfield, 3 animated bars, glass tray
   ═══════════════════════════════════════════════════════════ */

function OptStatusBarDark() {
  return (
    <div style={{ position: "relative", height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0", color: "#f5f9fa", fontFamily: "-apple-system, system-ui", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#f5f9fa"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></g></svg>
        <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#f5f9fa"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z" /><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z" /><circle cx="8" cy="10" r="1.2" /></g></svg>
        <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" stroke="#f5f9fa" strokeOpacity="0.5" fill="none" /><rect x="2" y="2" width="18" height="7" rx="1.2" fill="#f5f9fa" /><path d="M23 3v5c0.7-0.3 1.2-1 1.2-2.5S23.7 3.3 23 3z" fill="#f5f9fa" fillOpacity="0.45" /></svg>
      </div>
    </div>
  );
}

function Starfield() {
  const stars = useMemo(() => {
    const rng = (seed) => { let x = seed; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
    const r = rng(42);
    return Array.from({ length: 55 }, () => ({ x: r() * 100, y: r() * 100, s: 0.6 + r() * 1.4, o: 0.25 + r() * 0.65, d: r() * 3 }));
  }, []);
  return (
    <>
      {stars.map((s, i) =>
        <div key={i} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, borderRadius: "50%", background: "#ffffff", opacity: s.o, boxShadow: `0 0 ${s.s * 2}px rgba(255,255,255,${s.o})`, animation: `legacy-twinkle 3.2s ease-in-out ${s.d}s infinite`, pointerEvents: "none" }} />
      )}
    </>
  );
}

function ThumbsUp({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M2 10h4v11H2zM22 11a2 2 0 00-2-2h-5.6l.8-3.9a1.5 1.5 0 00-.5-1.5 1.6 1.6 0 00-2.2.2L7 9v12h12a2 2 0 002-1.7l1-6.8a2 2 0 000-2.5z" /></svg>;
}

function Crown({ size = 26 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M3 8.5a1 1 0 011.6-.8L8 10l3.2-4.6a1 1 0 011.6 0L16 10l3.4-2.3a1 1 0 011.6.8L20 18.5a1 1 0 01-1 .8H5a1 1 0 01-1-.8L3 8.5z" /></svg>;
}

function SavingsBar({ height, amount, icon, delay, glow, leftOffset }) {
  const barWidth = 82;
  return (
    <div style={{ position: "absolute", bottom: 58, left: leftOffset, width: barWidth, height, zIndex: 2 }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: height + 8, textAlign: "center", fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 700, color: "#8ef08e", textShadow: "0 0 10px rgba(80,255,140,0.65)", whiteSpace: "nowrap" }}>₹{amount}</div>
      {glow && <div style={{ position: "absolute", left: -14, right: -14, top: -4, bottom: -4, borderRadius: "22px 22px 8px 8px", background: "radial-gradient(ellipse at 50% 50%, rgba(120,255,160,0.35) 0%, rgba(40,200,90,0.15) 50%, rgba(0,0,0,0) 80%)", filter: "blur(8px)", animation: `legacy-haloPulse 3s ease-in-out ${delay + 800}ms infinite`, pointerEvents: "none" }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: barWidth, height, borderRadius: "12px 12px 4px 4px", background: glow ? "linear-gradient(180deg, #b6f28e 0%, #5dd066 40%, #0e9c3a 100%)" : "linear-gradient(180deg, #34b053 0%, #0d6a24 100%)", border: "1px solid rgba(140,230,150,0.45)", boxShadow: glow ? "inset 0 3px 8px rgba(220,255,220,0.75), inset 0 -16px 22px rgba(5,70,28,0.4), 0 0 22px rgba(80,255,140,0.35)" : "inset 0 2px 6px rgba(200,255,200,0.55), inset 0 -12px 18px rgba(5,60,22,0.38)", transformOrigin: "bottom", animation: `legacy-growY 700ms cubic-bezier(.2,.8,.2,1) ${delay}ms backwards${glow ? ", legacy-barGlow 3s ease-in-out " + (delay + 800) + "ms infinite" : ""}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 10, background: "linear-gradient(180deg, rgba(230,255,220,0.55) 0%, rgba(200,255,200,0) 100%)", borderRadius: "12px 12px 0 0", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: 5, top: 8, bottom: 10, width: 5, background: "linear-gradient(90deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)", borderRadius: 3, pointerEvents: "none" }} />
        {icon && <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, display: "flex", justifyContent: "center", color: "rgba(240,255,240,0.98)", filter: "drop-shadow(0 1px 2px rgba(0,60,20,0.4))" }}>{icon}</div>}
      </div>
    </div>
  );
}

function DashedBaseline({ y }) {
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 1, borderTop: "1px dashed rgba(255,255,255,0.18)", pointerEvents: "none" }} />;
}

function OptHero({ onBack }) {
  const haptic = (p) => { try { navigator?.vibrate?.(10); } catch(e) {} };
  return (
    <div style={{ position: "relative", background: "radial-gradient(ellipse at 50% 30%, rgb(48,22,78) 0%, rgb(18,10,40) 55%, rgb(6,4,18) 100%)", paddingBottom: 8, overflow: "hidden", height: 498 }}>
      <Starfield />
      <OptStatusBarDark />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 0", color: "#fff", position: "relative", zIndex: 2 }}>
        <div onClick={() => { haptic("light"); onBack(); }} className="legacy-tap" aria-label="Back" style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "24px 20px 0" }}>
        <div className="legacy-serif" style={{ fontSize: 22, fontWeight: 600, color: "rgb(234,237,247)", letterSpacing: "-0.01em" }}>You can save upto</div>
        <div className="legacy-serif" style={{ marginTop: 6, fontSize: 40, fontWeight: 700, color: "#4ce08a", letterSpacing: "-0.02em", textShadow: "0 0 24px rgba(76,224,138,0.5), 0 2px 6px rgba(0,0,0,0.35)" }}>₹{f(SAVINGS_BARS.bar3)}/yr</div>
      </div>
      <div style={{ position: "relative", height: 300, marginTop: 18 }}>
        <DashedBaseline y={80} />
        <DashedBaseline y={140} />
        <DashedBaseline y={200} />
        <SavingsBar leftOffset={34} height={72} amount={f(SAVINGS_BARS.bar1)} delay={120} />
        <SavingsBar leftOffset={154} height={150} amount={f(SAVINGS_BARS.bar2)} icon={<ThumbsUp />} delay={280} />
        <SavingsBar leftOffset={274} height={206} amount={f(SAVINGS_BARS.bar3)} icon={<Crown />} delay={440} glow />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 74, zIndex: 5, background: "linear-gradient(180deg, rgba(120,220,140,0.18) 0%, rgba(40,160,90,0.22) 40%, rgba(10,90,50,0.28) 100%)", borderTop: "1px solid rgba(180,255,200,0.55)", borderBottom: "1px solid rgba(8,80,40,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2), 0 -8px 20px rgba(0,0,0,0.25)", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: "linear-gradient(180deg, rgba(200,255,210,0.65) 0%, rgba(200,255,210,0) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, top: 2, bottom: 2, width: 24, background: "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0))", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 2, bottom: 2, width: 24, background: "linear-gradient(270deg, rgba(255,255,255,0.08), rgba(255,255,255,0))", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
            {[{ w: 82, left: 34, label: ["Current", "Savings"] }, { w: 82, left: 154, label: ["Spends", "Optimized"] }, { w: 82, left: 274, label: ["Optimized +", "Ultimate Card"] }].map((c, i) =>
              <div key={i} style={{ position: "absolute", left: c.left, width: c.w, textAlign: "center", color: "rgba(200,255,210,0.95)", fontFamily: "var(--legacy-sans)", fontSize: 11.5, fontWeight: 500, lineHeight: 1.3, textShadow: "0 1px 2px rgba(0,40,20,0.5)" }}>
                {c.label.map((l, j) => <div key={j}>{l}</div>)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 30, background: "linear-gradient(180deg, transparent 0%, rgba(245,249,250,0.15) 100%)", pointerEvents: "none" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERE'S HOW — Timeline rail + action cards
   ═══════════════════════════════════════════════════════════ */

function RailIcon({ kind }) {
  const paths = {
    crown: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 8l3.5 3L12 5l5.5 6L21 8l-2 10H5L3 8z" fill="none" stroke="rgb(54,64,96)" strokeWidth="1.6" strokeLinejoin="round" /><path d="M5 20h14" stroke="rgb(54,64,96)" strokeWidth="1.6" strokeLinecap="round" /></svg>,
    tune: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(54,64,96)" strokeWidth="1.6" strokeLinecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2.2" fill="#fff" /><circle cx="8" cy="17" r="2.2" fill="#fff" /></svg>,
    gift: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(54,64,96)" strokeWidth="1.6" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="1" /><path d="M3 7h18v3H3z" fill="#fff" /><path d="M12 7v13" /><path d="M12 7c-1-3-5-3-5-1s2 2 5 1zM12 7c1-3 5-3 5-1s-2 2-5 1z" fill="#fff" /></svg>,
  };
  return (
    <div style={{ width: 34, height: 34, borderRadius: 9, background: "#fff", boxShadow: "0 2px 6px rgba(63,66,70,0.14), 0 0 0 1px rgba(54,64,96,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>{paths[kind]}</div>
  );
}

function ExpanderFooter({ label, onClick }) {
  return (
    <button onClick={onClick} className="legacy-tap" style={{ width: "100%", padding: "13px 16px", background: "rgba(246,248,251,1)", border: "none", borderTop: "1px solid rgba(36,45,74,0.06)", fontFamily: "var(--legacy-sans)", fontSize: 13, color: "rgba(54,64,96,0.85)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
      {label}
      <svg width="11" height="7" viewBox="0 0 11 7" fill="none"><path d="M1 1.5l4.5 4.5L10 1.5" stroke="rgba(54,64,96,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

function HowCard({ art, tint, title, savePrefix, saveAmount, extraBadge, footer, onFooterClick }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(63,66,70,0.08), 0 0 0 1px rgba(36,45,74,0.04)", overflow: "hidden" }}>
      <div style={{ padding: 14, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 84, height: 104, borderRadius: 12, flexShrink: 0, background: tint || "rgba(147,206,220,0.12)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <img src={art} alt="" style={{ width: 76, height: 92, objectFit: "contain" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="legacy-serif" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.22, color: "rgb(34,41,65)", textWrap: "pretty" }}>{title}</div>
          {saveAmount && (
            <div style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, background: "linear-gradient(90deg, #E7FFEF 0%, #FFF 100%)", display: "inline-flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "var(--legacy-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(54,64,96,0.55)", lineHeight: 1.2 }}>{savePrefix || "SAVE UPTO"}</span>
              <span style={{ marginTop: 2, fontFamily: "var(--legacy-sans)", fontSize: 14, fontWeight: 700, color: "#0B9251", lineHeight: 1.3 }}>{saveAmount}</span>
            </div>
          )}
          {extraBadge && (
            <div style={{ marginTop: 10, padding: "8px 14px", display: "inline-block", borderRadius: 8, background: "linear-gradient(90deg, #E7FFEF 0%, #FFF 100%)", color: "#0B9251", fontFamily: "var(--legacy-sans)", fontSize: 14, fontWeight: 700 }}>{extraBadge}</div>
          )}
        </div>
      </div>
      {footer && <ExpanderFooter label={footer} onClick={onFooterClick} />}
    </div>
  );
}

function HereIsHow({ onUltimate, onExisting, onRedeem }) {
  const containerRef = useRef(null);
  const lastIconRef = useRef(null);
  const [railBottom, setRailBottom] = useState(152);

  useLayoutEffect(() => {
    if (!containerRef.current || !lastIconRef.current) return;
    const recalc = () => {
      const cBox = containerRef.current.getBoundingClientRect();
      const iBox = lastIconRef.current.getBoundingClientRect();
      setRailBottom(Math.max(0, cBox.bottom - iBox.top));
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(containerRef.current);
    window.addEventListener("resize", recalc);
    return () => { ro.disconnect(); window.removeEventListener("resize", recalc); };
  }, []);

  const items = [
    { rail: "crown", art: `${ASSET_BASE}/opt/bd964fe0e574.png`, tint: "linear-gradient(135deg, rgba(255,219,128,0.18), rgba(255,219,128,0.05))", title: <>Get the ultimate credit card<br />for your spends</>, saveAmount: `₹${f(SAVINGS_BARS.ultimate_uplift)}/yr`, footer: "See Your Ultimate Card", onClick: onUltimate },
    { rail: "tune", art: `${ASSET_BASE}/opt/3e2622354da6.png`, tint: "linear-gradient(135deg, rgba(147,206,220,0.18), rgba(147,206,220,0.04))", title: <>Use your existing credit<br />cards in the right way</>, saveAmount: `₹${f(SAVINGS_BARS.flow1_delta)}/yr`, footer: "See Optimization", onClick: onExisting },
    { rail: "gift", art: `${ASSET_BASE}/opt/0e60286a81e4.png`, tint: "linear-gradient(135deg, rgba(184,123,255,0.18), rgba(255,206,120,0.06))", title: <>Claim and Redeem your<br />expiring benefits</>, extraBadge: "Extra Savings", footer: "See Expiring Benefits", onClick: onRedeem },
  ];

  return (
    <div style={{ padding: "28px 16px 8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "0 0 24px" }}>
        <span style={{ width: 64, height: 1, background: "rgba(120,138,150,0.5)" }} />
        <span style={{ width: 4, height: 4, transform: "rotate(45deg)", background: "rgba(120,138,150,0.8)" }} />
        <span style={{ fontFamily: "var(--legacy-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.28em", color: "rgb(108,124,142)" }}>HERE'S HOW</span>
        <span style={{ width: 4, height: 4, transform: "rotate(45deg)", background: "rgba(120,138,150,0.8)" }} />
        <span style={{ width: 64, height: 1, background: "rgba(120,138,150,0.5)" }} />
      </div>
      <div ref={containerRef} style={{ position: "relative", paddingLeft: 48 }}>
        <div style={{ position: "absolute", left: 48 / 2 - 0.75, top: 50, bottom: railBottom, width: 0, borderLeft: "1.5px dashed rgba(54,64,96,0.22)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <div key={i} style={{ position: "relative" }}>
                <div ref={isLast ? lastIconRef : null} style={{ position: "absolute", left: -48 + (48 - 34) / 2, top: 16, zIndex: 2 }}>
                  <RailIcon kind={item.rail} />
                </div>
                <HowCard art={item.art} tint={item.tint} title={item.title} savePrefix={item.savePrefix} saveAmount={item.saveAmount} extraBadge={item.extraBadge} footer={item.footer} onFooterClick={item.onClick} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD OPTIMIZATIONS — Recommended ultimate card showcase
   ═══════════════════════════════════════════════════════════ */

function CardOptimizations({ onViewDetails }) {
  const dinersImg = `${ASSET_BASE}/cards/Diners club  Credit Card.png`;
  const promoImg = (CARD_PROMO?.name || "").toLowerCase().includes("diners")
    ? dinersImg
    : (CARD_PROMO?.image || `${ASSET_BASE}/opt/swiggy-blck-card.webp`);
  return (
    <div style={{ padding: "32px 16px 4px", background: "rgb(245,249,250)" }}>
      <h2 className="legacy-serif" style={{ margin: 0, textAlign: "center", fontSize: 24, fontWeight: 700, color: "rgba(54,64,96,0.9)", letterSpacing: "-0.01em" }}>Card Optimizations</h2>
      <div style={{ position: "relative", marginTop: 20, borderRadius: 16, overflow: "hidden", paddingBottom: 24 }}>
        <img src={`${ASSET_BASE}/opt/card-opt-bg.webp`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
        <div style={{ position: "relative", margin: "0 auto", width: 260, display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 2 }}>
          <img src={`${ASSET_BASE}/opt/recommended-tag.webp`} alt="Recommended Ultimate Card" style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 4px 12px rgba(76,66,222,0.25))" }} />
        </div>
        <div style={{ position: "relative", textAlign: "center", marginTop: 14, zIndex: 2, padding: "0 16px" }}>
          <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "rgb(110,120,145)" }}>{CARD_PROMO.name.split(" ")[0].toUpperCase()}</div>
          <div style={{ marginTop: 4, fontFamily: "var(--legacy-sans)", fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", color: "rgb(0,0,0)" }}>{CARD_PROMO.name.toUpperCase()}</div>
        </div>
        <div style={{ position: "relative", width: "100%", maxWidth: 268, margin: "18px auto 0", zIndex: 2 }}>
          <img src={promoImg} alt={CARD_PROMO.name} style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, boxShadow: "0 12px 32px rgba(34,34,64,0.28), 0 2px 6px rgba(0,0,0,0.15)" }} />
          <img src={`${ASSET_BASE}/opt/best-card-badge.webp`} alt="Your best credit card" style={{ position: "absolute", left: "50%", bottom: -32, transform: "translateX(-50%)", zIndex: 3, padding: "1px 0px 0px", height: 110, width: 110, objectFit: "scale-down" }} />
        </div>
        <div style={{ position: "relative", textAlign: "center", marginTop: 52, zIndex: 2, padding: "0px 16px 4px", margin: "36px 0px 7px" }}>
          <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(68,63,63,0.7)" }}>SAVE UPTO</div>
          <div style={{ marginTop: 2, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 }}>
            <span className="legacy-serif" style={{ fontSize: 34, fontWeight: 700, color: "rgb(76,66,222)", textShadow: "0 2px 6px rgba(76,66,222,0.15)" }}>₹</span>
            <span className="legacy-serif" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.01em", color: "rgb(76,66,222)", textShadow: "0 2px 6px rgba(76,66,222,0.15)" }}>{f(SAVINGS_BARS.bar3)}/yr</span>
          </div>
          <div style={{ marginTop: 6, fontFamily: "var(--legacy-sans)", fontSize: 13, color: "rgba(0,0,0,0.6)" }}>Add this Ultimate Card to your setup</div>
        </div>
        <button onClick={onViewDetails} className="legacy-tap" style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "18px auto 24px", padding: "13px 28px", background: "linear-gradient(180deg, rgb(34,41,65) 0%, rgb(16,28,67) 100%)", color: "rgb(232,232,232)", border: "none", borderRadius: 12, fontFamily: "var(--legacy-sans)", fontSize: 14, fontWeight: 700, boxShadow: "0 2px 8px rgba(16,28,67,0.3), inset 0 1px 0 rgba(255,255,255,0.1)", cursor: "pointer" }}>
          View all Details
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M1.5 1l5 5-5 5" stroke="rgb(232,232,232)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SPEND'S DISTRIBUTION — Toggle, segmented bar, card rows
   ═══════════════════════════════════════════════════════════ */

function UltimateToggle({ on, onChange, saveExtra }) {
  return (
    <button onClick={() => onChange(!on)} className="legacy-tap" style={{ width: "100%", margin: 0, padding: "14px 16px", background: "linear-gradient(90deg, #F5F9FA 0%, #ECEBFF 100%)", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 14, fontWeight: 700, color: "rgb(86,54,190)", letterSpacing: "-0.005em" }}>Show With Ultimate Card</div>
        <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--legacy-sans)", fontSize: 12, fontWeight: 500, color: "rgba(54,64,96,0.7)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 8l3.5 3L12 5l5.5 6L21 8l-2 10H5L3 8z" fill="rgba(54,64,96,0.5)" /></svg>
          Save Extra ₹{saveExtra}
        </div>
      </div>
      <div style={{ width: 44, height: 26, borderRadius: 13, background: on ? "rgb(110,82,233)" : "rgb(199,203,218)", position: "relative", transition: "background .2s ease", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)" }}>
        <div style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left .2s cubic-bezier(.2,.8,.2,1)" }} />
      </div>
    </button>
  );
}

function SegmentedDistBar({ segments }) {
  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", alignItems: "stretch", height: 48, gap: 2, borderRadius: 10, overflow: "hidden", background: "rgba(0,0,0,0.04)", padding: 4, borderStyle: "solid", borderWidth: "0.5px", borderColor: "rgba(36, 45, 74, 0.247)" }}>
        {segments.map((s, i) =>
          <div key={i} style={{ flex: s.pct, background: s.grad, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -8px 12px rgba(0,0,0,0.12)", animation: `legacy-growX 650ms cubic-bezier(.2,.8,.2,1) ${100 + i * 80}ms backwards`, transformOrigin: "left" }}>{s.pct}%</div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 8 }}>
        <span style={{ width: 18, height: 3, borderRadius: 2, background: "rgb(54,64,96)" }} />
        <span style={{ width: 10, height: 3, borderRadius: 2, background: "rgba(54,64,96,0.2)" }} />
      </div>
    </div>
  );
}

function CategoryChip({ label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px 5px 11px", border: "1px solid rgba(54,64,96,0.18)", borderRadius: 6, background: "#fff", fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: 500, color: "rgb(54,64,96)", whiteSpace: "nowrap" }}>
      {label}
      <svg width="9" height="6" viewBox="0 0 9 6" fill="none"><path d="M1 1l3.5 3.5L8 1" stroke="rgba(54,64,96,0.75)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

function CardDot({ color }) {
  return <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />;
}

function DistRow({ cardImg, cardName, dotColor, spend, save, categories, highlight, crownAfter }) {
  return (
    <div style={{ background: highlight ? "linear-gradient(90deg, rgba(231,226,255,0.5), rgba(243,240,255,0.2))" : "transparent", padding: "20px 16px" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <img src={cardImg} alt={cardName} style={{ borderRadius: 3, objectFit: "cover", boxShadow: "0 2px 4px rgba(0,0,0,0.15)", flexShrink: 0, width: 56, height: 36 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CardDot color={dotColor} />
            <span style={{ fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 600, color: "rgb(54,64,96)" }}>{cardName}</span>
            {crownAfter && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 8l3.5 3L12 5l5.5 6L21 8l-2 10H5L3 8z" fill="rgba(54,64,96,0.5)" /></svg>}
          </div>
          <div style={{ marginTop: 4, fontFamily: "var(--legacy-sans)", color: "rgb(34,41,65)", fontSize: 14, fontWeight: 600, margin: "8px 0px 0px", letterSpacing: "-0.2px" }}>₹{spend}</div>
        </div>
        <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 700, color: "rgb(19,147,102)", whiteSpace: "nowrap", paddingTop: 14 }}>Save ₹{save}</div>
      </div>
      {categories && categories.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, paddingLeft: 60, padding: "3px 0px 0px 60px" }}>
          {categories.map((c, i) => <CategoryChip key={i} label={c} />)}
        </div>
      )}
    </div>
  );
}

function SpendsDistribution() {
  const [ultimate, setUltimate] = useState(true);

  const distGrads = ["linear-gradient(180deg, #9d7ff0 0%, #6a42d1 100%)", "linear-gradient(180deg, #38c774 0%, #0f8a48 100%)", "linear-gradient(180deg, #4ea6ff 0%, #1a6cd6 100%)", "linear-gradient(180deg, #ffb040 0%, #e08a14 100%)", "linear-gradient(180deg, #b27cff 0%, #7a3dd9 100%)"];
  const distDots = ["#8b5cf6", "#17a35a", "#3d8dff", "#f0a020", "#b27cff"];
  const distImgMap = {"HSBC Travel One":`${ASSET_BASE}/cards/HSBC TravelOne Credit Card.png`,"Axis Flipkart":`${ASSET_BASE}/cards/axis-flipkart.png`,"Axis Flipkart Card":`${ASSET_BASE}/cards/axis-flipkart.png`,"HSBC Live+":`${ASSET_BASE}/cards/hsbc-live.png`,"HDFC Diners Black":`${ASSET_BASE}/cards/Diners club  Credit Card.png`};
  const distData = ultimate ? SPEND_DIST_WITH_ULTIMATE : SPEND_DIST_WITHOUT_ULTIMATE;
  const segments = distData.map((d, i) => ({ pct: d.pct, grad: distGrads[i % distGrads.length] }));
  const _cleanName = (n) => (n||"").trim().replace(/\s+credit\s+card$/i,"").replace(/\s+/g," ").trim();
  const rows = distData.map((d, i) => ({
    cardImg: distImgMap[_cleanName(d.name)] || distImgMap[d.name] || `${ASSET_BASE}/cards/HSBC TravelOne Credit Card.png`,
    cardName: _cleanName(d.name), dotColor: distDots[i % distDots.length],
    spend: f(d.spend), save: f(d.savings), categories: d.categories,
    highlight: i === 0 && ultimate, crownAfter: i === 0 && ultimate,
  }));

  return (
    <div style={{ padding: "28px 0 8px" }}>
      <h2 className="legacy-serif" style={{ margin: 0, padding: "0 20px", fontSize: 22, fontWeight: 700, color: "rgba(54,64,96,0.95)", letterSpacing: "-0.2px" }}>Spend's Distribution</h2>
      <div style={{ padding: "21px 16px 0px" }}>
        <UltimateToggle on={ultimate} onChange={setUltimate} saveExtra={f(SAVINGS_BARS.ultimate_uplift)} />
      </div>
      <div style={{ padding: "30px 16px 6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, padding: "0px 2px 0px 6px", margin: "0px 0px 10px" }}>
          <span style={{ fontFamily: "var(--legacy-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(54,64,96,0.65)" }}>SPEND DISTRIBUTION</span>
          <span style={{ fontFamily: "var(--legacy-sans)", fontSize: 10, color: "rgba(54,64,96,0.85)", fontWeight: 800, letterSpacing: "0.6px" }}>₹{f(TOTAL_ACC)}/yr</span>
        </div>
        <SegmentedDistBar segments={segments} />
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", background: "rgb(243,246,247)", borderTop: "1px solid rgb(231,236,239)", borderBottom: "1px solid rgb(231,236,239)" }}>
          <span style={{ fontFamily: "var(--legacy-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", color: "rgb(80,88,108)" }}>YOU SPEND</span>
          <span style={{ fontFamily: "var(--legacy-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", color: "rgb(80,88,108)" }}>SAVINGS</span>
        </div>
        {rows.map((r, i) => (
          <div key={i}>
            <DistRow {...r} />
            {i < rows.length - 1 && <div style={{ borderTop: "1px dashed rgba(54,64,96,0.12)", margin: "0 16px" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARDS USAGE — Category glyphs, cards panel, timeline
   ═══════════════════════════════════════════════════════════ */

function CatStar() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <defs><linearGradient id="star-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffe56b" /><stop offset="55%" stopColor="#ffcc1f" /><stop offset="100%" stopColor="#e88c00" /></linearGradient></defs>
      <path d="M22 4l5.5 11.2 12.3 1.8-8.9 8.7 2.1 12.2L22 32.2 10.9 37.9l2.1-12.2L4.1 17l12.3-1.8z" fill="url(#star-g)" stroke="#b87608" strokeWidth="1" strokeLinejoin="round" />
      <path d="M22 7l4 8.2 9 1.3-6.5 6.3 1.5 9L22 27.6" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
}

function CatShopping() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <defs><linearGradient id="bag1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c5a7ff" /><stop offset="100%" stopColor="#7a54d6" /></linearGradient><linearGradient id="bag2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffbd7a" /><stop offset="100%" stopColor="#e88534" /></linearGradient></defs>
      <path d="M20 13h14l2 25a3 3 0 01-3 3h-12a3 3 0 01-3-3l2-25z" fill="url(#bag1)" stroke="#4c2c99" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M23 13c0-3.5 1.8-6 4-6s4 2.5 4 6" stroke="#4c2c99" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M8 16h14l2 23a3 3 0 01-3 3H9a3 3 0 01-3-3l2-23z" fill="url(#bag2)" stroke="#a2591c" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M11 16c0-3.5 1.8-6 4-6s4 2.5 4 6" stroke="#a2591c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M10 19l1 3M20 19l-1 3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CatGroceries() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <defs><linearGradient id="gro-bag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffc78a" /><stop offset="100%" stopColor="#e8803d" /></linearGradient></defs>
      <path d="M20 5c0 4 2 6 5 6-2-4-3-5-5-6z" fill="#4caf4a" />
      <path d="M24 4c2 1 3 4 2 7-2-2-3-4-2-7z" fill="#6bc24a" />
      <path d="M17 12l3 6-2 2-3-5z" fill="#ff8a3d" />
      <ellipse cx="28" cy="14" rx="5" ry="3" fill="#e8c17a" />
      <path d="M10 17h24l-2 20a3 3 0 01-3 2.6H15a3 3 0 01-3-2.6L10 17z" fill="url(#gro-bag)" stroke="#9e5820" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M12 22l1 14M31 22l-1 14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CatBills() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <defs><linearGradient id="bill-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffec6b" /><stop offset="100%" stopColor="#e5b41c" /></linearGradient></defs>
      <path d="M10 6h20l4 4v28l-3 2-3-2-3 2-3-2-3 2-3-2-3 2-3-2V6z" fill="url(#bill-g)" stroke="#8a6810" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M14 14h16M14 19h16M14 24h12" stroke="#8a6810" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <path d="M26 3c-3 0-5 2-5 5v8c0 2 1 3 3 3s3-1 3-3V9" stroke="#8a8a8a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CatFuel() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <defs><linearGradient id="fuel-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff9a7a" /><stop offset="100%" stopColor="#e23d0e" /></linearGradient></defs>
      <rect x="8" y="10" width="16" height="28" rx="2" fill="url(#fuel-g)" stroke="#8a2b08" strokeWidth="0.8" />
      <rect x="11" y="14" width="10" height="9" rx="1" fill="rgba(255,255,255,0.35)" />
      <path d="M24 16h4a2 2 0 012 2v14a2 2 0 002 2v-10l-3-3" stroke="#b55023" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 38h12" stroke="#8a2b08" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CatTravel() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <defs><linearGradient id="tr1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6fbff3" /><stop offset="100%" stopColor="#2a7cc2" /></linearGradient><linearGradient id="tr2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffc78a" /><stop offset="100%" stopColor="#e08534" /></linearGradient></defs>
      <rect x="5" y="16" width="18" height="22" rx="2" fill="url(#tr1)" stroke="#1c5899" strokeWidth="0.8" />
      <path d="M10 14v-4a2 2 0 012-2h4a2 2 0 012 2v4" stroke="#1c5899" strokeWidth="1.4" fill="none" />
      <rect x="18" y="13" width="20" height="25" rx="2" fill="url(#tr2)" stroke="#a0531a" strokeWidth="0.8" />
      <path d="M23 11v-3a2 2 0 012-2h6a2 2 0 012 2v3" stroke="#a0531a" strokeWidth="1.4" fill="none" />
      <path d="M18 24h20" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
    </svg>
  );
}

function CatFood() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <defs><linearGradient id="food-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffc28a" /><stop offset="100%" stopColor="#e88534" /></linearGradient></defs>
      <path d="M8 26c0-6 6-10 14-10s14 4 14 10v2H8v-2z" fill="url(#food-g)" stroke="#a2591c" strokeWidth="0.8" />
      <path d="M5 30h34v3H5z" fill="#7a4513" />
      <path d="M14 20l2-3M22 17v-4M28 20l2-3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const CATS = [
  { key: "milestones", label: "Milestones", Glyph: CatStar },
  { key: "shopping", label: "Shopping", Glyph: CatShopping },
  { key: "groceries", label: "Groceries", Glyph: CatGroceries },
  { key: "bills", label: "Bills", Glyph: CatBills },
  { key: "fuel", label: "Fuel", Glyph: CatFuel },
  { key: "travel", label: "Travel", Glyph: CatTravel },
  { key: "food", label: "Food Ordering", Glyph: CatFood },
];

function CatChip({ cat, active, onClick }) {
  return (
    <button onClick={onClick} className="legacy-tap" style={{ padding: "8px 10px 10px", border: "none", cursor: "pointer", minWidth: 64, background: active ? "rgba(234,238,255,0.9)" : "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRadius: "10px 10px 0px 1px" }}>
      <cat.Glyph />
      <span style={{ fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "rgb(14,102,210)" : "rgb(54,64,96)", lineHeight: 1.2, textAlign: "center" }}>{cat.label}</span>
    </button>
  );
}

function CardsToUsePanel({ includeUltimate, shownDist, rightLabel = "YOU SPEND" }: { includeUltimate: boolean; shownDist: any[]; rightLabel?: string }) {
  const shown = shownDist || [];
  const norm = (s: any) => String(s || "").toLowerCase().replace(/credit card/g, "").replace(/\s+/g, " ").trim();
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(36,45,74,0.06)", boxShadow: "0 2px 8px rgba(63,66,70,0.06)", overflow: "hidden", margin: "24px 16px 0px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(54,64,96,0.14)", padding: "16px 16px 15px" }}>
        <span style={{ fontFamily: "var(--legacy-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", color: "rgba(54,64,96,0.6)", margin: "0px 0px 0px 4px" }}>CARDS TO USE</span>
        <span style={{ fontFamily: "var(--legacy-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", color: "rgba(54,64,96,0.6)" }}>{rightLabel}</span>
      </div>
      {shown.map((d: any, idx: number) => {
        const isMarket = includeUltimate && norm(d.name) === norm(CARD_PROMO?.name);
        const img = (
          {"HSBC Travel One":`${ASSET_BASE}/cards/HSBC TravelOne Credit Card.png`,"Axis Flipkart":`${ASSET_BASE}/cards/axis-flipkart.png`,"HSBC Live+":`${ASSET_BASE}/cards/hsbc-live.png`}[d.name]
          || (isMarket ? (CARD_PROMO?.image || "") : "")
          || `${ASSET_BASE}/cards/HSBC TravelOne Credit Card.png`
        );
        const tone = idx === 0 ? "#17a35a" : "#3d8dff";
        return (
          <div key={d.name} style={{ borderTop: idx === 0 ? "none" : "1px dashed rgba(54,64,96,0.1)", display: "flex", gap: 12, alignItems: "center", padding: idx === 0 ? "18px 16px 17px" : "18px 16px 12px" }}>
            <img src={img} alt={d.name} style={{ width: 48, height: 32, borderRadius: 3, objectFit: "cover", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: tone }} />
                <span style={{ fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 600, color: "rgb(54,64,96)" }}>{d.name}</span>
              </div>
              <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: 500, color: "rgba(54,64,96,0.7)", marginTop: 2, margin: "6px 0px 0px" }}>
                Optimised allocation
              </div>
            </div>
            <div style={{ fontFamily: "var(--legacy-sans)", fontWeight: 700, color: "rgb(34,41,65)", whiteSpace: "nowrap", fontSize: 12 }}>
              {rightLabel === "YOU SPEND" ? <>₹{f(d.spend || 0)}</> : <>₹{f(d.value || d.spend || 0)}</>}
            </div>
          </div>
        );
      })}
      <div style={{ padding: "18px 16px 28px" }}>
        <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(54,64,96,0.6)", marginBottom: 8, margin: "0px 0px 12px", padding: "0px 0px 0px 4px" }}>SPEND DISTRIBUTION</div>
        <div style={{ display: "flex", gap: 2, height: 30, borderRadius: 8, overflow: "hidden", background: "rgba(0,0,0,0.04)", padding: 2 }}>
          {shown.map((d: any, i: number) => (
            <div key={d.name} style={{ flex: Math.max(1, d.pct || 1), background: i === 0 ? "linear-gradient(180deg, #38c774 0%, #0f8a48 100%)" : i === 1 ? "linear-gradient(180deg, #4ea6ff 0%, #1a6cd6 100%)" : "linear-gradient(180deg, #111827 0%, #374151 100%)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--legacy-sans)", fontSize: 12, fontWeight: 700, boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -6px 10px rgba(0,0,0,0.12)", animation: "legacy-growX 650ms cubic-bezier(.2,.8,.2,1) " + (i * 150) + "ms backwards", transformOrigin: "left" }}>
              {d.pct}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthlyYearlyTabs({ value, onChange }) {
  return (
    <div style={{ display: "inline-flex", padding: 2, background: "rgb(241,244,247)", borderRadius: 6, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)" }}>
      {["Monthly", "Yearly"].map((v) => {
        const active = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{ padding: "6px 14px", border: "none", cursor: "pointer", borderRadius: 4, background: active ? "#fff" : "transparent", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "rgb(34,41,65)" : "rgba(54,64,96,0.7)" }}>{v}</button>
        );
      })}
    </div>
  );
}

function TLItem({ cardImg, title, subchip, saving, period = "mn", warning }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 48, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        {warning ? (
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "1.5px solid rgba(230,150,30,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(210,130,20)" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 118 0v3" /></svg>
          </div>
        ) : (
          <img src={cardImg} alt="" style={{ width: 48, height: 32, borderRadius: 3, objectFit: "cover", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 500, color: warning ? "rgba(54,64,96,0.85)" : "rgb(34,41,65)", textAlign: "left", lineHeight: 1.5 }}>{title}</div>
        {subchip && (
          <div style={{ marginTop: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: "rgba(255,237,175,0.6)", fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: 600, color: "rgb(140,90,14)" }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgb(210,150,30)" }} />
              {subchip}
            </span>
          </div>
        )}
        {warning && <div style={{ marginTop: 4, fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: 500, color: "rgba(54,64,96,0.65)" }}>Cap at 2,000 RP per month</div>}
      </div>
      {saving && <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 700, color: "rgb(19,147,102)", whiteSpace: "nowrap" }}>₹{saving}/{period}</div>}
    </div>
  );
}

function HowToSpendTimeline({ includeUltimate, allowedCards, tabKey }: { includeUltimate: boolean; allowedCards: string[]; tabKey: string }) {
  const [period, setPeriod] = useState("Monthly");
  const items = useMemo(() => {
    const rowsByCard: Record<string, any> = {};
    const keyForBucket = (bucket: string) => {
      if (bucket === "online_food_ordering" || bucket === "dining_or_going_out") return "food";
      const cat = BUCKET_TO_CATEGORY[bucket] || "";
      if (cat === "Shopping") return "shopping";
      if (cat === "Groceries") return "groceries";
      if (cat === "Bills") return "bills";
      if (cat === "Fuel") return "fuel";
      if (cat === "Travel") return "travel";
      return null;
    };
    for (const bucket of ALL_INPUT_BUCKETS) {
      if (LOUNGE_BUCKETS.includes(bucket) || RESPONSE_ONLY_BUCKETS.includes(bucket)) continue;
      const raw = SPEND_PROFILE[bucket];
      const ms = ANNUAL_BUCKETS.includes(bucket) ? (raw || 0) / 12 : (raw || 0);
      if (!ms || ms <= 0) continue;

      if (tabKey && tabKey !== "milestones") {
        const k = keyForBucket(bucket);
        if (k !== tabKey) continue;
      }

      const merchants = BUCKET_TO_MERCHANT[bucket] || [];
      const label = merchants[0] || (BUCKET_TO_CATEGORY[bucket] || bucket);

      const bestOwned = getBestCardForBucket(bucket);
      const bestMarket = getBestMarketCardForBucket(bucket);
      const best = includeUltimate && bestMarket?.savings > bestOwned.savings ? bestMarket : bestOwned;
      const bestCardName = best.cardName || calculateResponses[best.cardIndex]?.card_name || "Card";
      if (allowedCards && allowedCards.length && !allowedCards.includes(bestCardName)) continue;

      const candidate = {
        bucket,
        name: label,
        bestCard: bestCardName,
        totalSpend: Math.round(ms * 12),
        bestSaved: Math.round((best.savings || 0) * 12),
      };

      // Keep the highest-spend representative bucket per shown card
      if (!rowsByCard[bestCardName] || candidate.totalSpend > rowsByCard[bestCardName].totalSpend) {
        rowsByCard[bestCardName] = candidate;
      }
    }
    const rows = Object.values(rowsByCard);
    return rows.sort((a: any, b: any) => b.totalSpend - a.totalSpend).slice(0, 3);
  }, [includeUltimate, allowedCards]);
  return (
    <div style={{ background: "#fff", margin: "16px 0 0", borderTop: "1px solid rgba(36,45,74,0.06)" }}>
      <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(36,45,74,0.05)", background: "rgb(247,249,251)" }}>
        <span style={{ fontFamily: "var(--legacy-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", color: "rgba(54,64,96,0.6)" }}>HOW TO SPEND</span>
        <span style={{ fontFamily: "var(--legacy-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", color: "rgba(54,64,96,0.6)" }}>SAVINGS</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 14px" }}>
        <span style={{ fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 500, color: "rgba(54,64,96,0.85)" }}>Filter Spends & Savings</span>
        <MonthlyYearlyTabs value={period} onChange={setPeriod} />
      </div>
      <div style={{ position: "relative", padding: "4px 16px 20px" }}>
        <div style={{ position: "absolute", left: 16 + 23, top: 46, bottom: 56, width: 0, borderLeft: "1.5px dashed rgba(54,64,96,0.2)" }} />
        {items.map((ob, i) => {
          const cardImgMap = {"HSBC Travel One":`${ASSET_BASE}/cards/HSBC TravelOne Credit Card.png`,"Axis Flipkart":`${ASSET_BASE}/cards/axis-flipkart.png`,"Axis Flipkart Card":`${ASSET_BASE}/cards/axis-flipkart.png`,"HSBC Live+":`${ASSET_BASE}/cards/hsbc-live.png`};
          const isYearly = period === "Yearly";
          const moSpend = Math.round(ob.totalSpend / 12);
          const moSave = Math.round(ob.bestSaved / 12);
          const spend = isYearly ? f(ob.totalSpend) : f(moSpend);
          const save = isYearly ? f(ob.bestSaved) : f(moSave);
          return (<div key={i} style={{ padding: "16px 0" }}>
            <TLItem cardImg={cardImgMap[ob.bestCard] || `${ASSET_BASE}/cards/HSBC TravelOne Credit Card.png`} title={<>Spend ₹{spend}/{isYearly?"year":"month"}<br /><strong style={{ fontWeight: 600 }}>on {ob.bestCard}</strong></>} subchip={`for ${ob.name}`} saving={save} period={isYearly ? "yr" : "mn"} />
          </div>);
        })}
      </div>
    </div>
  );
}

function CardsUsage() {
  const [showUltimate, setShowUltimate] = useState(true);
  const [tab, setTab] = useState("shopping");
  const dist = showUltimate ? SPEND_DIST_WITH_ULTIMATE : SPEND_DIST_WITHOUT_ULTIMATE;
  const distForTab = useMemo(() => {
    const norm = (s: any) => String(s || "").toLowerCase().replace(/credit card/g, "").replace(/\s+/g, " ").trim();
    const getMonthlySpend = (bucket: string) => (ANNUAL_BUCKETS.includes(bucket) ? (SPEND_PROFILE[bucket] || 0) / 12 : (SPEND_PROFILE[bucket] || 0));
    const keyForBucket = (bucket: string) => {
      if (bucket === "online_food_ordering" || bucket === "dining_or_going_out") return "food";
      const cat = BUCKET_TO_CATEGORY[bucket] || "";
      if (cat === "Shopping") return "shopping";
      if (cat === "Groceries") return "groceries";
      if (cat === "Bills") return "bills";
      if (cat === "Fuel") return "fuel";
      if (cat === "Travel") return "travel";
      return null;
    };

    // Milestones: rank by annual extra benefits (owned + ultimate card if present).
    if (tab === "milestones") {
      const rows: any[] = [];
      for (const r of calculateResponses || []) {
        rows.push({ name: r?.card_name, value: Math.round(r?.total_extra_benefits || 0) });
      }
      if (showUltimate && CARD_PROMO?.name) rows.push({ name: CARD_PROMO.name, value: Math.round(CARD_PROMO?.total_extra_benefits || 0) });
      const total = rows.reduce((a, b) => a + (b.value || 0), 0) || 1;
      return rows
        .filter(r => (r.value || 0) > 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .map(r => ({ ...r, pct: Math.max(1, Math.round(((r.value || 0) / total) * 100)) }));
    }

    // Category tabs: compute spend allocation by "best card for each bucket" within owned+ultimate.
    const spendByCard = new Map<string, number>();
    for (const bucket of ALL_INPUT_BUCKETS) {
      if (LOUNGE_BUCKETS.includes(bucket) || RESPONSE_ONLY_BUCKETS.includes(bucket)) continue;
      if (keyForBucket(bucket) !== tab) continue;
      const ms = getMonthlySpend(bucket);
      if (!ms || ms <= 0) continue;
      const annualSpend = ms * 12;

      const bestOwned = getBestCardForBucket(bucket);
      const bestMarket = getBestMarketCardForBucket(bucket);
      const best = showUltimate && bestMarket?.savings > bestOwned.savings ? bestMarket : bestOwned;
      const bestCardName = best.cardName || calculateResponses[best.cardIndex]?.card_name || "Card";
      spendByCard.set(bestCardName, (spendByCard.get(bestCardName) || 0) + annualSpend);
    }

    const rows = Array.from(spendByCard.entries()).map(([name, spend]) => ({ name, spend: Math.round(spend) }));
    const totalSpend = rows.reduce((a, b) => a + (b.spend || 0), 0) || 1;
    return rows
      .filter(r => (r.spend || 0) > 0)
      .sort((a, b) => (b.spend || 0) - (a.spend || 0))
      .map(r => ({ ...r, pct: Math.max(1, Math.round(((r.spend || 0) / totalSpend) * 100)) }));
  }, [tab, showUltimate]);

  const shownDist = useMemo(() => {
    const base = (distForTab || []).filter((d: any) => (d.pct || 0) > 0);
    if (base.length <= 2) return base.slice(0, 2);
    if (tab === "milestones") {
      const top2 = base.slice(0, 2);
      const top3 = base.slice(0, 3);
      const s2 = top2.reduce((a: number, b: any) => a + (b.value || 0), 0);
      const s3 = top3.reduce((a: number, b: any) => a + (b.value || 0), 0);
      return (s3 - s2) >= 250 ? top3 : top2;
    }

    const norm = (s: any) => String(s || "").toLowerCase().replace(/credit card/g, "").replace(/\s+/g, " ").trim();
    const cardNameToResp = new Map<string, any>();
    for (const r of calculateResponses || []) cardNameToResp.set(norm(r?.card_name), r);

    const getMonthlySpend = (bucket: string) => (ANNUAL_BUCKETS.includes(bucket) ? (SPEND_PROFILE[bucket] || 0) / 12 : (SPEND_PROFILE[bucket] || 0));
    const keyForBucket = (bucket: string) => {
      if (bucket === "online_food_ordering" || bucket === "dining_or_going_out") return "food";
      const cat = BUCKET_TO_CATEGORY[bucket] || "";
      if (cat === "Shopping") return "shopping";
      if (cat === "Groceries") return "groceries";
      if (cat === "Bills") return "bills";
      if (cat === "Fuel") return "fuel";
      if (cat === "Travel") return "travel";
      return null;
    };

    const totalAnnualSavingsFor = (cards: any[]) => {
      const allowed = new Set((cards || []).map((c: any) => norm(c?.name)));
      if (!allowed.size) return 0;
      let total = 0;
      for (const bucket of ALL_INPUT_BUCKETS) {
        if (LOUNGE_BUCKETS.includes(bucket) || RESPONSE_ONLY_BUCKETS.includes(bucket)) continue;
        if (keyForBucket(bucket) !== tab) continue;
        const ms = getMonthlySpend(bucket);
        if (!ms || ms <= 0) continue;

        let bestMo = 0;
        for (const cn of allowed) {
          const resp = cardNameToResp.get(cn);
          if (resp?.spending_breakdown?.[bucket]?.savings) bestMo = Math.max(bestMo, resp.spending_breakdown[bucket].savings);
          if (showUltimate && norm(CARD_PROMO?.name) === cn && CARD_PROMO?.spending_breakdown?.[bucket]?.savings) {
            bestMo = Math.max(bestMo, CARD_PROMO.spending_breakdown[bucket].savings);
          }
        }
        total += bestMo * 12;
      }
      return Math.round(total);
    };

    const top2 = base.slice(0, 2);
    const top3 = base.slice(0, 3);
    const s2 = totalAnnualSavingsFor(top2);
    const s3 = totalAnnualSavingsFor(top3);
    return (s3 - s2) >= 250 ? top3 : top2;
  }, [distForTab, tab, showUltimate]);

  const savings = useMemo(() => {
    const map: any = {};
    const keyForBucket = (bucket: string) => {
      if (bucket === "online_food_ordering" || bucket === "dining_or_going_out") return "food";
      const cat = BUCKET_TO_CATEGORY[bucket] || "";
      if (cat === "Shopping") return "shopping";
      if (cat === "Groceries") return "groceries";
      if (cat === "Bills") return "bills";
      if (cat === "Fuel") return "fuel";
      if (cat === "Travel") return "travel";
      return null;
    };

    for (const bucket of ALL_INPUT_BUCKETS) {
      if (LOUNGE_BUCKETS.includes(bucket) || RESPONSE_ONLY_BUCKETS.includes(bucket)) continue;
      const raw = SPEND_PROFILE[bucket];
      const ms = ANNUAL_BUCKETS.includes(bucket) ? (raw || 0) / 12 : (raw || 0);
      if (!ms || ms <= 0) continue;
      const key = keyForBucket(bucket);
      if (!key) continue;

      const bestOwned = getBestCardForBucket(bucket);
      const bestMarket = getBestMarketCardForBucket(bucket);
      const best = showUltimate && bestMarket?.savings > bestOwned.savings ? bestMarket : bestOwned;

      const annualSpend = Math.round(ms * 12);
      const annualSavings = Math.round((best.savings || 0) * 12);
      if (!map[key]) map[key] = { totalNum: 0, baseNum: 0, catLabel: key };
      map[key].totalNum += annualSavings;
      map[key].baseNum += annualSpend;
    }

    // labels
    const labels: any = {
      shopping: "Shopping",
      groceries: "Groceries",
      bills: "Bills",
      fuel: "Fuel",
      travel: "Travel",
      food: "Food Ordering",
    };
    for (const k of Object.keys(labels)) {
      if (!map[k]) map[k] = { totalNum: 0, baseNum: 0, catLabel: labels[k] };
      map[k].catLabel = labels[k];
      map[k].total = f(Math.round(map[k].totalNum || 0));
      map[k].base = f(Math.round(map[k].baseNum || 0));
    }

    const extra = Math.max(0, ...calculateResponses.map((r: any) => Math.round(r?.total_extra_benefits || 0)));
    map.milestones = { total: f(extra), base: f(TOTAL_ACC), catLabel: "Milestone Benefits" };

    return map;
  }, [showUltimate]);
  const s = savings[tab] || { total: "0", base: f(TOTAL_ACC), catLabel: tab };

  return (
    <div style={{ paddingBottom: 28, background: "linear-gradient(180deg, rgb(237,242,252) 0%, rgb(245,249,250) 40%)" }}>
      <h2 className="legacy-serif" style={{ margin: 0, padding: "26px 20px 14px", fontSize: 22, fontWeight: 700, color: "rgba(54,64,96,0.95)", letterSpacing: "0.1px" }}>Cards Usage</h2>
      <div style={{ padding: "0 16px" }}>
        <UltimateToggle on={showUltimate} onChange={setShowUltimate} saveExtra={f(SAVINGS_BARS.ultimate_uplift)} />
      </div>
      <div
        className="legacy-h-rail"
        style={{
          padding: "16px 10px 0",
          gap: 2,
          position: "relative",
          width: "100%",
          overflowX: "auto",
          overflowY: "visible",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          overscrollBehaviorX: "contain",
          touchAction: "pan-x",
        }}
      >
        {CATS.map((c) => <CatChip key={c.key} cat={c} active={tab === c.key} onClick={() => setTab(c.key)} />)}
      </div>
      <div style={{ margin: 0, padding: "22px 18px 22px", background: "linear-gradient(180deg, rgba(221,230,252,0.9) 0%, rgba(237,243,253,0.55) 100%)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 13, fontWeight: 500, color: "rgba(54,64,96,0.75)" }}>Save Upto</div>
        <div className="legacy-serif" style={{ marginTop: 4, fontSize: 32, fontWeight: 700, color: "rgb(14,102,210)", letterSpacing: "-0.02em" }}>₹{s.total}/yr</div>
        <div style={{ marginTop: 4, fontFamily: "var(--legacy-sans)", fontSize: 12, fontWeight: 500, color: "rgba(54,64,96,0.7)" }}>Based on {s.catLabel} Spends of ₹{s.base}/yr</div>
      </div>
      <CardsToUsePanel includeUltimate={showUltimate} shownDist={shownDist} rightLabel={tab === "milestones" ? "VALUE" : "YOU SPEND"} />
      <HowToSpendTimeline includeUltimate={showUltimate} allowedCards={shownDist.map((d: any) => d.name)} tabKey={tab} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CLAIM & REDEEM — Benefit cards
   ═══════════════════════════════════════════════════════════ */

function BenefitCard({ bankInitial, bankColor, text, days, tone, ctaLabel = "Redeem", onCta }) {
  const tones = {
    green: { bg: "linear-gradient(180deg, rgb(226,249,224), rgba(226,249,224,0))", fg: "rgb(30,135,20)" },
    amber: { bg: "linear-gradient(180deg, rgb(255,237,198), rgba(255,237,198,0))", fg: "rgb(181,117,31)" },
    red: { bg: "linear-gradient(180deg, rgb(255,224,224), rgba(255,224,224,0))", fg: "rgb(200,50,50)" },
  };
  const t = tones[tone] || tones.green;
  return (
    <div style={{ padding: 14, background: "#fff", borderRadius: 10, boxShadow: "0 1px 6px rgba(63,66,70,0.08), 0 0 0 1px rgba(36,45,74,0.04)", display: "flex", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: bankColor || "#eef2ff", border: "1.5px solid rgba(35,99,225,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--legacy-sans)", fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.02em" }}>{bankInitial}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--legacy-sans)", fontSize: 13.5, fontWeight: 500, color: "rgb(54,64,94)", lineHeight: 1.45 }}>{text}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ padding: "5px 8px", background: t.bg, borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: t.fg }}>IN {days.toUpperCase()}</span>
          <button onClick={onCta} className="legacy-tap" style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(17,52,172,0.15)", background: "#fff", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: 700, color: "rgb(34,41,65)", cursor: "pointer" }}>
            {ctaLabel}
            <svg width="7" height="10" viewBox="0 0 10 14" fill="none"><path d="M1 1l6 6-6 6" stroke="rgb(34,41,65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ClaimRedeem({ onRedeem, onTrack }) {
  const redeemActions = ALL_ACTIONS.filter(a => a.type === "points" || a.type === "fee" || a.type === "milestone").slice(0, 4);
  const tones = ["green", "amber", "red", "green"];
  const colors = ["linear-gradient(135deg, #d44 0%, #a11 100%)", "linear-gradient(135deg, #b71 0%, #842 100%)", "linear-gradient(135deg, #7b5cd6 0%, #4d2ea8 100%)", "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"];
  return (
    <div style={{ padding: "32px 16px 28px" }}>
      <h2 className="legacy-serif" style={{ margin: 0, textAlign: "center", fontSize: 22, fontWeight: 700, color: "rgba(54,64,96,0.95)", letterSpacing: "-0.015em" }}>Claim and Redeem Benefits</h2>
      <p style={{ margin: "6px 0 16px", textAlign: "center", fontFamily: "var(--legacy-sans)", fontSize: 12, color: "rgba(54,64,96,0.7)" }}>You have {redeemActions.length} benefits to track</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {redeemActions.map((a, i) => (
          <BenefitCard
            key={i}
            bankInitial={a.title.charAt(0)}
            bankColor={colors[i % colors.length]}
            text={<>{a.title}. <strong style={{ color: "rgb(14,102,210)" }}>{a.cta}</strong></>}
            days={a.badge}
            tone={tones[i % tones.length]}
            ctaLabel={a.type === "points" ? "Redeem" : "Track"}
            onCta={a.type === "points" ? onRedeem : () => onTrack(a)}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE — Main export
   ═══════════════════════════════════════════════════════════ */

export function LegacyOptimiseScreen() {
  const { setScreen, setRedeemCard, setRedeemPts, setRedeemResult, setRedeemPref, setSelBrand, setCalcAmt, setCalcResult, setSearchQ, setActSheet } = useAppContext();

  const openRedeem = () => { setScreen("redeem"); setRedeemCard(null); setRedeemPts(""); setRedeemResult(null); setRedeemPref(null); };
  const openCalc = () => { setScreen("calc"); setSelBrand(null); setCalcAmt(""); setCalcResult(null); setSearchQ(""); };
  const openTrack = (a: any) => {
    // Fee waivers / milestones are "action" items: open the action sheet (not redeem screen).
    setActSheet(a);
  };

  return (
    <div style={{ fontFamily: "var(--legacy-sans)", maxWidth: 400, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <div data-scroll="1" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", background: "rgb(245,249,250)", paddingBottom: 100, scrollbarWidth: "none", msOverflowStyle: "none" }}>

        <OptHero onBack={() => setScreen("home")} />
        <HereIsHow onUltimate={() => setScreen("bestcards")} onExisting={openCalc} onRedeem={openRedeem} />

        <div style={{ height: 10, background: "rgba(23,73,47,0.06)", marginTop: 20 }} />

        <CardOptimizations onViewDetails={() => setScreen("bestcards")} />
        <SpendsDistribution />

        <div style={{ height: 10, background: "rgba(23,73,47,0.06)", marginTop: 20 }} />

        <CardsUsage />

        <div style={{ height: 10, background: "rgba(23,73,47,0.06)" }} />

        <ClaimRedeem onRedeem={openRedeem} onTrack={openTrack} />

        <div style={{ height: 36 }} />
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "12px 0 5vw", pointerEvents: "none", zIndex: 50 }}>
        <div style={{ pointerEvents: "auto" }}><NavBar /></div>
      </div>
      <BottomSheets />
    </div>
  );
}
