// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { CreditCard } from "lucide-react";
import { FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";
import { SPEND_CATS, TOTAL_ACC } from "@/data/simulation/legacy";

/**
 * Phase A — Spend Analysis (post-SMS, pre-Card-Identification)
 *
 * Choreography:
 *   phase 0 (0–2500ms)  : Orb fades-in to centre. "Let me first fetch your spends
 *                          over the past 365 days and analyse them" appears below.
 *   phase 1 (2500–4000ms): First text fades out. "We've accounted a total of
 *                          ₹16,40,250 in the past 365 days" rises in from below.
 *   phase 2 (4000ms+)    : Orb fades out. The current headline floats up to top of
 *                          card position and morphs into "Majority of them in
 *                          Shopping, followed by groceries and so on…". White
 *                          categories card slides in to centre. Rows + bars stagger.
 *                          Bottom countdown ticks 5→0 then advances to /building.
 */

const CAT_IMG_MAP = { "Shopping": "Shopping", "Groceries": "Groceries", "Bills": "Bills", "Food Ordering": "Food Ordering", "Flights": "Flights", "Travel": "Flights", "Friends and Family": "Friends and Family", "Dining Out": "Dining Out", "Dining": "Dining Out", "Hotels": "Hotels", "Insurance": "Insurance", "Fuel": "Fuel", "Rent": "Rent", "Entertainment": "Entertainment", "Cab Rides": "Shopping", "Education": "Bills" };
const CATS = SPEND_CATS.slice(0, 7).map((c, i) => {
  const pct = Math.round((c.amt / TOTAL_ACC) * 100);
  const maxBarW = 155;
  const topAmt = SPEND_CATS[0]?.amt || 1;
  return { name: `${c.name} - ${pct}%`, amount: `₹${f(c.amt)}`, barW: Math.round((c.amt / topAmt) * maxBarW), img: `/cdn/categories/${CAT_IMG_MAP[c.name] || c.name}.webp` };
});

const HEADLINES = [
  "Let me first fetch your spends over the past 365 days and analyse them",
  // Phase 1: ₹16,40,250 rendered bold via JSX in render
  null,
  "Majority of them in Shopping, followed by groceries and so on...",
];

const TotalAccountedText = () => (
  <>
    We've accounted a total of <strong style={{ fontWeight: 800, color: "#1F2A4A" }}>₹{f(TOTAL_ACC)}</strong> in the past 365 days
  </>
);

export function SpendAnalysisScreen() {
  const ctx: any = useAppContext();
  const { setScreen, setBuildPhase } = ctx;

  // 0 = intro line, 1 = total accounted line, 2 = headline floats up + categories card
  const [phase, setPhase] = useState(0);
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);

  const [rowsRevealed, setRowsRevealed]   = useState(0);
  const [barsFilled, setBarsFilled]       = useState(false);
  const [countdownPct, setCountdownPct]   = useState(0);
  const [seconds, setSeconds]             = useState(7);
  const [paused, setPaused]               = useState(false);
  const pausedRef = useRef(false);
  const lastTapRef = useRef(0);

  // Master timeline — paced for comfortable reading (~16s end-to-end)
  useEffect(() => {
    const t: any[] = [];
    // 0–3000ms     phase 0: "Let me first fetch your spends…"
    // 3000ms       swap to phase 1 with bold ₹ total
    t.push(setTimeout(() => { setHeadlineIdx(1); setPhase(1); }, 3000));
    // 6000ms       phase 2: orb fades, second text floats up to top of card region
    t.push(setTimeout(() => { setPhase(2); }, 6000));
    // 6300ms       categories card slides in (300ms after text finished moving up)
    t.push(setTimeout(() => { setCardVisible(true); }, 6300));
    // 6300+i*80    stagger rows; bars fill
    for (let i = 0; i < CATS.length; i++) {
      t.push(setTimeout(() => setRowsRevealed(n => Math.max(n, i + 1)), 6300 + i * 80));
    }
    t.push(setTimeout(() => setBarsFilled(true), 6400));
    // 8300ms       2s after card-in: headline morphs from "We've accounted…" → "Majority of them…"
    t.push(setTimeout(() => { setHeadlineIdx(2); }, 8300));
    return () => t.forEach(clearTimeout);
  }, []);

  // Bottom countdown begins ~3s after headline 2 ("Majority of them…") arrives,
  // giving the user time to read the categories before auto-advancing.
  // Tracks elapsed via delta-per-frame so pausing genuinely freezes progress
  // instead of letting wall-clock time keep accruing while paused.
  useEffect(() => {
    if (headlineIdx !== 2) return;
    let raf = 0;
    const startDelay = setTimeout(() => {
      let elapsed = 0;
      let last = performance.now();
      const tick = () => {
        const now = performance.now();
        const dt = now - last;
        last = now;
        if (!pausedRef.current) {
          elapsed += dt;
          const pct = Math.min(100, (elapsed / 7000) * 100);
          setCountdownPct(pct);
          setSeconds(Math.max(0, Math.ceil((7000 - elapsed) / 1000)));
          if (pct >= 100) {
            setScreen && setScreen("card-id");
            return;
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 3000);
    return () => { clearTimeout(startDelay); cancelAnimationFrame(raf); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headlineIdx]);

  // Double-tap anywhere to pause / resume. pausedRef mirrors state so the rAF
  // loop reads the latest value without needing to re-subscribe.
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setPaused(p => { pausedRef.current = !p; return !p; });
    }
    lastTapRef.current = now;
  };

  return (
    <div onClick={handleTap} style={{
      fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh",
      background: "#FFFFFF",
      position: "relative", overflow: "hidden", userSelect: "none",
    }}>
      <FL />
      <style>{`
        @keyframes saOrbIn      { from { opacity: 0; transform: translate(-50%, -50%) scale(0.78); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes saOrbPulse   { 0%,100% { box-shadow: 0px 3.71362px 4.84582px rgba(149, 0, 229, 0.153301), 0px 0px 0px 4px #F3EAF8, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #F2D9FF, inset 0px 1px 4px 2px #F2D9FF; } 50% { box-shadow: 0px 6px 18px rgba(149, 0, 229, 0.32), 0px 0px 0px 4px #F3EAF8, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #F2D9FF, inset 0px 1px 4px 2px #F2D9FF; } }
        @keyframes saTextIn     { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes saTextOut    { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -8px); } }
        @keyframes saCardIn     { from { opacity: 0; transform: translateX(-50%) translateY(48px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes saRowIn      { from { opacity: 0; transform: translateY(8px); }  to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top purple gradient fade — visible throughout */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 360,
        background: "linear-gradient(180deg, #5856F6 0%, rgba(99, 146, 248, 0) 100%)",
        opacity: 0.55, pointerEvents: "none", zIndex: 0,
      }} />

      {/* Soft white blur backdrop on lower half */}
      <div style={{
        position: "absolute", left: "50%", bottom: -200, transform: "translateX(-50%)",
        width: 700, height: 800, background: "#F8F9FB", filter: "blur(50px)",
        opacity: 0.6, pointerEvents: "none", zIndex: 0,
      }} />

      {/* iOS status bar (time only) */}
      <div style={{ position: "absolute", left: 33, top: 16, fontFamily: "'SF Pro',sans-serif", fontWeight: 700, fontSize: 15, lineHeight: "18px", letterSpacing: "-0.02em", color: "#0D0D0E", zIndex: 5 }}>9:41</div>

      {/* ───────────── ORB ─────────────
          phase 0/1: centred at ~50% of viewport
          phase 2:   fades out
       */}
      {phase < 2 && (
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 96, height: 96,
          boxSizing: "border-box",
          background: "#7C43F7",
          backgroundBlendMode: "plus-lighter, normal",
          boxShadow: "0px 3.71362px 4.84582px rgba(149, 0, 229, 0.153301), 0px 0px 0px 4px #F3EAF8, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #F2D9FF, inset 0px 1px 4px 2px #F2D9FF",
          borderRadius: "100px",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "saOrbIn 0.7s cubic-bezier(0.16,1,0.3,1) both, saOrbPulse 2.4s ease-in-out 0.7s infinite",
          transform: "translate(-50%, -50%)",
          zIndex: 4,
        }}>
          <CreditCard size={32} strokeWidth={2.4} color="#FFFFFF" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.18))" }} />
        </div>
      )}

      {/* ─────────── HEADLINE ───────────
          phase 0/1: anchored ~96px below orb centre
          phase 2:   floats up to top-of-card region
       */}
      <div key={`headline-${headlineIdx}`} style={{
        position: "absolute",
        left: "50%",
        top: phase === 2 ? 105 : "calc(50% + 96px)",
        width: phase === 2 ? 280 : 300,
        textAlign: "center",
        fontFamily: phase === 2 ? "'Blacklist','Google Sans',serif" : "'Blacklist','Google Sans',serif",
        fontWeight: 600,
        fontSize: 18,
        lineHeight: "140%",
        letterSpacing: "-0.01em",
        color: "rgba(54, 64, 96, 0.9)",
        transform: "translateX(-50%)",
        animation: "saTextIn 0.55s cubic-bezier(0.16,1,0.3,1) both",
        transition: "top 0.65s cubic-bezier(0.16,1,0.3,1), font-size 0.45s ease, width 0.45s ease",
        zIndex: 3,
      }}>
        {headlineIdx === 1 ? <TotalAccountedText /> : HEADLINES[headlineIdx]}
      </div>

      {/* ─────────── CATEGORIES CARD (phase 2, after 300ms beat) ─────────── */}
      {cardVisible && (
        <div style={{
          position: "absolute", left: "50%", top: 176, transform: "translateX(-50%)",
          width: 328, padding: "16px 12px", display: "flex", flexDirection: "column",
          alignItems: "flex-start", gap: 20, background: "#FFFFFF",
          boxShadow: "0px 0.621951px 4.35366px rgba(63, 66, 70, 0.11)", borderRadius: 8,
          animation: "saCardIn 0.65s cubic-bezier(0.16,1,0.3,1) 0.15s both",
          zIndex: 2,
        }}>
          {CATS.map((cat, i) => {
            const visible = i < rowsRevealed;
            return (
              <div key={cat.name} style={{
                width: 304, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
                opacity: visible ? 1 : 0,
                animation: visible ? `saRowIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms both` : "none",
              }}>
                {/* row: icon + name + amount */}
                <div style={{ width: 304, display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative", width: 31.11, height: 32.15, border: "0.888889px solid #EDEDED", borderRadius: 3.55556, boxSizing: "border-box", overflow: "hidden", flexShrink: 0 }}>
                    <img src={cat.img} alt="" style={{ position: "absolute", left: 1, top: 1, width: "calc(100% - 2px)", height: "calc(100% - 2px)", objectFit: "contain" }} />
                  </div>
                  <div style={{ flex: 1, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 12, lineHeight: "150%", color: "#364060" }}>{cat.name}</div>
                  <div style={{ width: 64, fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 12, lineHeight: "150%", color: "#364060", textAlign: "right" }}>{cat.amount}</div>
                </div>
                {/* progress bar */}
                <div style={{
                  position: "relative", width: 304, height: 10,
                  background: "rgba(123, 142, 178, 0.1)",
                  boxShadow: "0px 0.788916px 0px rgba(255, 255, 255, 0.19), inset 0.788916px 0.788916px 1.57783px rgba(0, 0, 0, 0.11)",
                  borderRadius: 3.15566, overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, height: "100%",
                    width: barsFilled && visible ? cat.barW : 0,
                    background: "linear-gradient(180deg, #117E47 0%, #0AA759 100%)",
                    border: "1px solid #22AB66", boxShadow: "inset 0px 2px 0px rgba(255, 255, 255, 0.4)",
                    borderRadius: "0px 2px 2px 0px", boxSizing: "border-box",
                    transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────── BOTTOM COUNTDOWN (after card lands) ─────────── */}
      {cardVisible && (
        <>
          <div style={{
            position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)",
            whiteSpace: "nowrap", textAlign: "center",
            fontFamily: "'Google Sans',sans-serif", fontWeight: 400, fontSize: 12,
            lineHeight: "140%", color: "#808387",
            opacity: countdownPct > 0 || paused ? 1 : 0, transition: "opacity 0.4s ease", zIndex: 3,
          }}>
            {paused
              ? <span style={{ fontWeight: 600, color: "#364060" }}>Double tap to play</span>
              : <>Fetching your credit cards in {seconds}. <span style={{ fontWeight: 600, color: "#364060" }}>Double tap to pause and read</span></>
            }
          </div>
          {!paused && (
            <div style={{
              position: "absolute", left: 0, bottom: 0, height: 4,
              width: `${countdownPct}%`, background: "#11477E",
              borderRadius: "0px 2px 2px 0px",
              transition: "width 0.05s linear",
              zIndex: 3,
            }} />
          )}
        </>
      )}
    </div>
  );
}
