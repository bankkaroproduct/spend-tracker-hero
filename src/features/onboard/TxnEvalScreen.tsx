// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { CreditCard } from "lucide-react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";

/**
 * Transaction Evaluation Cinematic
 *
 * Replaces the legacy buildPhase 5+ chain. Plays after "Confirm and Proceed".
 *
 * Anatomy:
 *   • Persistent header  — "YOUR CARDS" eyebrow + 3 small card thumbs
 *   • Centre evaluation slot — single transaction row, content swaps inside
 *   • Headline above row — crossfades per transaction
 *   • Tag below row — clip-path reveal (green for best, yellow for suboptimal)
 *   • Bottom — "Skip Tutorial" pill (jumps straight to /home)
 *
 * Total runtime ~14 s, paced for comfortable reading.
 */

const CARD_IMGS = [
  "/legacy-assets/cards/axis-flipkart.webp",
  "/legacy-assets/cards/hsbc-travel-one.webp",
  "/legacy-assets/cards/hsbc-live.webp",
];

const TXNS = [
  {
    brand: "Flipkart",
    icon: "/brands/flipkart.webp",
    fallbackBg: "#FFC500",
    fallbackInitial: "f",
    card: "Axis Flipkart",
    date: "27 Jan",
    amount: "₹1,000",
    saved: "SAVED ₹15",
    savedColor: "#078146",
    headline: "Great Job! Keep it up",
    tagText: "USED BEST CARD FOR THIS",
    tagColor: "#078146",
    tagBg: "#E0F8E9",
    tagBorder: "#9FE0B8",
  },
  {
    brand: "Swiggy",
    icon: "/brands/swiggy.webp",
    fallbackBg: "#FC8019",
    fallbackInitial: "s",
    card: "HSBC Live +",
    date: "27 Jan",
    amount: "₹500",
    saved: "SAVED ₹5",
    savedColor: "#078146",
    headline: "No worries, use the right card next time",
    tagText: "USE AXIS FLIPKART AND SAVE ₹15",
    tagColor: "#CF7908",
    tagBg: "#F9F9E0",
    tagBorder: "transparent",
  },
  {
    brand: "BigBasket",
    icon: "/brands/bb.webp",
    fallbackBg: "#84B135",
    fallbackInitial: "b",
    card: "via UPI",
    date: "",
    amount: "₹500",
    saved: "SAVED ₹0",
    savedColor: "#B56D3C",
    headline: "Your card can save you more than UPI",
    tagText: "USE AXIS FLIPKART AND SAVE ₹15",
    tagColor: "#CF7908",
    tagBg: "#F9F9E0",
    tagBorder: "transparent",
  },
];

// Per-stage durations (ms).
//   enter → readRow → tag → readTag → headline → readAll → exit
const ENTER_MS              = 500;
const READ_ROW_MS           = 1200;
const TAG_REVEAL_MS         = 400;
const READ_TAG_MS           = 1300;
const HEADLINE_REVEAL_MS    = 400;
const HOLD_AFTER_HEADLINE_MS= 1900;
const EXIT_MS               = 400;
const PER_TXN = ENTER_MS + READ_ROW_MS + TAG_REVEAL_MS + READ_TAG_MS + HEADLINE_REVEAL_MS + HOLD_AFTER_HEADLINE_MS + EXIT_MS; // ~6100
const INTRO_MS = 2500;
const FINAL_HOLD_MS = 600;

export function TxnEvalScreen() {
  const ctx: any = useAppContext();
  const { setScreen } = ctx;

  // 0 = intro orb, 1..3 = txn N, 4 = exit fade
  const [stage, setStage] = useState(0);
  // 'enter' | 'tagged' | 'headlined' | 'exit'
  const [stageStep, setStageStep] = useState<"enter" | "tagged" | "headlined" | "exit">("enter");
  // Skip pill is hidden for first 5s so users actually watch the cinematic
  const [showSkip, setShowSkip] = useState(false);

  const skipRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timers: any[] = [];
    timers.push(setTimeout(() => { if (!skipRef.current) setStage(1); }, INTRO_MS));

    let cursor = INTRO_MS;
    for (let i = 1; i <= 3; i++) {
      const offsetEnter      = cursor;
      const offsetTagged     = cursor + ENTER_MS + READ_ROW_MS;
      const offsetHeadlined  = cursor + ENTER_MS + READ_ROW_MS + TAG_REVEAL_MS + READ_TAG_MS;
      const offsetExit       = cursor + ENTER_MS + READ_ROW_MS + TAG_REVEAL_MS + READ_TAG_MS + HEADLINE_REVEAL_MS + HOLD_AFTER_HEADLINE_MS;
      const offsetNext       = cursor + PER_TXN;

      timers.push(setTimeout(() => { if (!skipRef.current) { setStage(i); setStageStep("enter"); } }, offsetEnter));
      timers.push(setTimeout(() => { if (!skipRef.current) setStageStep("tagged"); }, offsetTagged));
      timers.push(setTimeout(() => { if (!skipRef.current) setStageStep("headlined"); }, offsetHeadlined));
      timers.push(setTimeout(() => { if (!skipRef.current) setStageStep("exit"); }, offsetExit));

      if (i < 3) {
        cursor = offsetNext;
      } else {
        timers.push(setTimeout(() => { if (!skipRef.current) setStage(4); }, offsetNext));
        timers.push(setTimeout(() => { if (!skipRef.current) setScreen && setScreen("tools-intro"); }, offsetNext + FINAL_HOLD_MS));
      }
    }

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSkip = () => {
    skipRef.current = true;
    setScreen && setScreen("home");
  };

  const txn = stage >= 1 && stage <= 3 ? TXNS[stage - 1] : null;
  const introVisible = stage === 0;
  const finalFade = stage === 4;

  return (
    <div style={{
      fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh",
      background: "#FFFFFF", position: "relative", overflow: "hidden", userSelect: "none",
      opacity: finalFade ? 0 : 1,
      transition: "opacity 0.5s cubic-bezier(0.32,0,0.67,0)",
    }}>
      <FL />
      <style>{`
        @keyframes teOrbIn   { from { opacity: 0; transform: translate(-50%, -50%) scale(0.78); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes teOrbPulse{ 0%,100% { box-shadow: 0px 3.71px 4.85px rgba(149,0,229,0.15), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF; } 50% { box-shadow: 0px 6px 18px rgba(149,0,229,0.32), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF; } }
        @keyframes teTextUp  { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes teRowIn   { from { opacity: 0; transform: translate(-50%, 24px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes teRowOut  { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -12px); } }
        @keyframes teTagIn   { from { opacity: 0; transform: translateY(-8px) scale(0.94); clip-path: inset(0 0 100% 0); } to { opacity: 1; transform: translateY(0) scale(1); clip-path: inset(0 0 0 0); } }
        @keyframes teTagOut  { from { opacity: 1; } to { opacity: 0; transform: translateY(-4px); } }
        @keyframes txeSkipIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes teHeadIn  { from { opacity: 0; transform: translate(-50%, 6px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes teHeadOut { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -6px); } }
      `}</style>

      {/* Top purple gradient fade — same chrome as analysis screen */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 360,
        background: "linear-gradient(180deg, #5856F6 0%, rgba(99, 146, 248, 0) 100%)",
        opacity: 0.45, pointerEvents: "none", zIndex: 0,
      }} />

      {/* Soft white blur backdrop on lower half */}
      <div style={{
        position: "absolute", left: "50%", bottom: -200, transform: "translateX(-50%)",
        width: 700, height: 800, background: "#F8F9FB", filter: "blur(50px)",
        opacity: 0.65, pointerEvents: "none", zIndex: 0,
      }} />

      {/* iOS status bar */}
      <div style={{ position: "absolute", left: 33, top: 16, fontFamily: "'SF Pro',sans-serif", fontWeight: 700, fontSize: 15, lineHeight: "18px", letterSpacing: "-0.02em", color: "#0D0D0E", zIndex: 5 }}>9:41</div>
      <div style={{ position: "absolute", right: 24, top: 16, display: "flex", alignItems: "center", gap: 6, zIndex: 5 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#0D0D0E"/>
          <rect x="5" y="6" width="3" height="6" rx="0.5" fill="#0D0D0E"/>
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill="#0D0D0E"/>
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="#0D0D0E"/>
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="#0D0D0E" strokeOpacity="0.4"/>
          <rect x="2" y="2" width="19" height="8" rx="1.3" fill="#0D0D0E"/>
          <rect x="23.5" y="4" width="1.5" height="4" rx="0.5" fill="#0D0D0E" fillOpacity="0.4"/>
        </svg>
      </div>

      {/* ─────────── PERSISTENT HEADER (Figma Frame 1991635072) ───────────
          332-wide container at top 54, flex-column gap 13 between eyebrow row
          (height 25, "Your Cards" 9px/0.1em/#4A4A4A) and cards row (3 thumbs
          75×50 with blue-tinted drop-shadow, gap 12). */}
      <div style={{
        position: "absolute", left: "calc(50% + 2px)", top: 54, transform: "translateX(-50%)",
        width: 332, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 13,
        animation: "teTextUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both",
        zIndex: 3, boxSizing: "border-box",
      }}>
        {/* Eyebrow row — 332×25, padding 4px 8px */}
        <div style={{
          width: 332, height: 25, display: "flex", flexDirection: "row",
          justifyContent: "space-between", alignItems: "flex-start",
          padding: "4px 8px", gap: 10, boxSizing: "border-box",
        }}>
          <div style={{
            margin: "0 auto",
            fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 9,
            lineHeight: "13px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#4A4A4A",
          }}>Your Cards</div>
        </div>

        {/* Cards row — 250.72×50.68, gap 12, centred */}
        <div style={{
          width: 250.72, height: 50.68,
          margin: "0 auto",
          display: "flex", flexDirection: "row", alignItems: "center", gap: 12,
        }}>
          {CARD_IMGS.map((src, i) => {
            const w = i === 0 ? 76.01 : 75;
            const h = i === 0 ? 50.68 : 50;
            const radius = i === 0 ? 3.8007 : 3.75;
            return (
              <div key={i} style={{
                width: w, height: h, borderRadius: radius,
                backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center",
                border: "0.31px solid rgba(255,255,255,0.2)",
                filter: "drop-shadow(0px 5px 15px rgba(11,43,100,0.35)) drop-shadow(0px 7px 29px rgba(11,43,100,0.1))",
                flexShrink: 0,
              }} />
            );
          })}
        </div>
      </div>

      {/* ─────────── INTRO STAGE: orb + intro text ─────────── */}
      {introVisible && (
        <>
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            width: 96, height: 96, boxSizing: "border-box",
            background: "#7C43F7", borderRadius: "100px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0px 3.71px 4.85px rgba(149,0,229,0.15), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF",
            animation: "teOrbIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both, teOrbPulse 2.4s ease-in-out 0.8s infinite",
            transform: "translate(-50%, -50%)",
            zIndex: 4,
          }}>
            <CreditCard size={32} strokeWidth={2.4} color="#FFFFFF" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.18))" }} />
          </div>
          <div style={{
            position: "absolute", left: "50%", top: "calc(50% + 90px)",
            width: 280, textAlign: "center", transform: "translateX(-50%)",
            fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 600, fontSize: 18,
            lineHeight: "140%", letterSpacing: "-0.01em", color: "rgba(54, 64, 96, 0.9)",
            animation: "teTextUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.45s both",
            zIndex: 3,
          }}>
            Now let me evaluate your transactions
          </div>
        </>
      )}

      {/* ─────────── HEADLINE (above the stack) — single line, only after tag has been read ─────────── */}
      {txn && (stageStep === "headlined" || stageStep === "exit") && (
        <div
          key={`headline-${stage}`}
          style={{
            position: "absolute", left: "50%", top: 304,
            width: 380, maxWidth: "calc(100vw - 16px)", textAlign: "center",
            fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 600, fontSize: 18,
            lineHeight: "130%", letterSpacing: "-0.01em", color: "rgba(54, 64, 96, 0.95)",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            animation: stageStep === "exit"
              ? "teHeadOut 0.35s cubic-bezier(0.32,0,0.67,0) both"
              : "teHeadIn 0.55s cubic-bezier(0.16,1,0.3,1) both",
            zIndex: 3,
          }}
        >
          {txn.headline}
        </div>
      )}

      {/* ─────────── TRANSACTION STACK ───────────
          Each new transaction takes the front position; previous ones demote to
          peeking smaller cards behind. depth 0 = front (active), 1 = middle, 2 = back. */}
      {Array.from({ length: stage >= 1 && stage <= 3 ? stage : (stage === 4 ? 3 : 0) }, (_, i) => i).map((txnIdx) => {
        const liveStage = stage === 4 ? 3 : stage;       // during exit, keep showing 3 cards
        const depth     = (liveStage - 1) - txnIdx;       // 0 = front, 1 = middle, 2 = back
        const isFront   = depth === 0;
        const t         = TXNS[txnIdx];

        // Per-depth Figma values
        const tops      = [363, 354, 346];
        const widths    = [328, 312, 291.2];
        const paddings  = ["12px 12px 14px", "12px", "11.2px"];
        const radii     = [8, 8, 7.467];
        const shadows   = [
          "0px 4px 12px rgba(0,0,0,0.1)",
          "0px 2px 8px rgba(99,99,99,0.2)",
          "0px 2px 8px rgba(99,99,99,0.2)",
        ];

        const showTag = isFront && (stageStep === "tagged" || stageStep === "headlined");
        const isFreshlyEntered = isFront && stageStep === "enter";

        return (
          <div
            key={`txn-${txnIdx}`}
            style={{
              position: "absolute",
              left: "50%",
              top: tops[depth],
              width: widths[depth],
              transform: "translateX(-50%)",
              background: "#FFFFFF",
              borderRadius: radii[depth],
              padding: paddings[depth],
              boxShadow: shadows[depth],
              display: "flex", flexDirection: "column", gap: 14,
              transition: "top 0.55s cubic-bezier(0.16,1,0.3,1), width 0.55s cubic-bezier(0.16,1,0.3,1), padding 0.4s ease, border-radius 0.3s ease, box-shadow 0.4s ease",
              animation: isFreshlyEntered
                ? "teRowIn 0.55s cubic-bezier(0.16,1,0.3,1) both"
                : (stage === 4 && isFront ? "teRowOut 0.4s cubic-bezier(0.32,0,0.67,0) both" : undefined),
              zIndex: 10 - depth,
            }}
          >
            {/* Brand row */}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 13 }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, minWidth: 0 }}>
                {/* brand icon */}
                <div style={{
                  width: 38, height: 39, borderRadius: 4, border: "1px solid #EDEDED",
                  background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, overflow: "hidden", position: "relative",
                }}>
                  <img
                    src={t.icon} alt=""
                    style={{ width: 28, height: 28, objectFit: "contain" }}
                    onError={(e: any) => { e.target.style.display = "none"; e.target.parentElement.style.background = t.fallbackBg; }}
                  />
                </div>
                {/* brand + card line */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 12, lineHeight: "150%", color: "#364060" }}>{t.brand}</div>
                  <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 10, lineHeight: "140%", color: "#808387" }}>
                    {t.card}{t.date ? ` | ${t.date}` : ""}
                  </div>
                </div>
              </div>

              {/* amount + saved + chevron */}
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 12, lineHeight: "150%", letterSpacing: "-0.01em", color: "#364060", textAlign: "right" }}>{t.amount}</div>
                  <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: 9, lineHeight: "120%", letterSpacing: "0.1em", textTransform: "uppercase", color: t.savedColor, textAlign: "right" }}>
                    {t.saved}
                  </div>
                </div>
              </div>
            </div>

            {/* dashed divider + tag — only for the active front card after the row is read */}
            {showTag && (
              <>
                <svg
                  width="100%" height="2"
                  style={{
                    display: "block",
                    animation: "teTagIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
                  }}
                >
                  <line x1="0" y1="1" x2="100%" y2="1" stroke="#D1E3F6" strokeDasharray="2 2" strokeWidth="1" />
                </svg>
                <div style={{
                  alignSelf: "flex-start",
                  padding: "8px",
                  background: t.tagBg,
                  borderRadius: 4,
                  fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: t.tagColor,
                  animation: "teTagIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
                }}>
                  {t.tagText}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* ─────────── BOTTOM SKIP PILL — appears after 5s ─────────── */}
      {showSkip && <div style={{
        position: "absolute", left: "50%", bottom: 36, transform: "translateX(-50%)",
        zIndex: 6,
        animation: "txeSkipIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <button
          onClick={onSkip}
          style={{
            background: "rgba(255,255,255,0.86)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: "1px solid rgba(54,64,96,0.12)",
            borderRadius: 999, padding: "8px 18px",
            fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 12,
            color: "#36405E", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(63,66,70,0.10)",
          }}
        >
          Skip Tutorial
        </button>
      </div>}
    </div>
  );
}
