// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { CreditCard } from "lucide-react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";

/**
 * Tools Intro Cinematic — pixel-accurate to Figma.
 *
 * Persistent header (eyebrow + 3-card thumb row) sits above. Below, all three
 * tool cards are visible in a single row from phase 1 onwards; only the
 * "active" card has the white background + #7D7CF3 border + soft shadow.
 * Inactive cards are transparent (icon + label float over the screen bg).
 *
 * Icon sizes & offsets follow Figma exactly (icons overflow above the card).
 *   Savings Finder      — 106×106 at top -7
 *   Best Cards for you  —  97×97  at top -9 (slight rotate -2.88°)
 *   Redeem Reward Pts.  — 121×121 at top -19
 *
 * Tutorial order — active state moves left → right → centre across phases.
 *   Phase 0  (0–3000ms)    intro orb + "Let me now introduce you to some tools"
 *   Phase 1  (3000–7500)   active = Savings   (left)   "Suggests the right card for your next spend"
 *   Phase 2  (7500–12000)  active = Redeem    (right)  "Suggests the best way to redeem your points"
 *   Phase 3  (12000–16500) active = Best Cards (centre) "Suggests the next best credit card for you"
 *   Exit     (16500–17000) fade → setScreen("home")
 */

const CARD_IMGS = [
  "/legacy-assets/cards/axis-flipkart.webp",
  "/legacy-assets/cards/hsbc-travel-one.webp",
  "/legacy-assets/cards/hsbc-live.webp",
];

type ToolDef = {
  id: "savings" | "best" | "redeem";
  label: string;
  img: string;
  bg: string;
  ellipse: string;
  description: string;
};

// Order in the row: LEFT (1), CENTRE (2), RIGHT (3) — matches LegacyHomeScreen ToolsSection
const TOOLS: ToolDef[] = [
  {
    id: "savings",
    label: "Savings\nFinder",
    img: "/cdn/tool-savings.webp",
    bg: "#D6ECFF",
    ellipse: "#B8DCFF",
    description: "Suggests the right card for your next spend",
  },
  {
    id: "best",
    label: "Best Cards\nfor you",
    img: "/cdn/tool-best-cards.webp",
    bg: "#FFDBEE",
    ellipse: "rgba(255,195,224,0.7)",
    description: "Suggests the next best credit card for you",
  },
  {
    id: "redeem",
    label: "Redeem\nReward Points",
    img: "/cdn/tool-redeem.webp",
    bg: "#FFEBB3",
    ellipse: "rgba(252,217,140,0.7)",
    description: "Suggests the best way to redeem your points",
  },
];

// Phase timing (ms) — paced for genuine reading
const INTRO_MS  = 3000;
const TOOL_1_MS = 4500;
const TOOL_2_MS = 4500;
const TOOL_3_MS = 4500;
const EXIT_MS   = 500;

export function ToolsIntroScreen() {
  const ctx: any = useAppContext();
  const { setScreen } = ctx;

  const [phase, setPhase] = useState(0);
  // Final 10s loading bar (starts once user has seen the last tool — phase 3)
  const [finalPct, setFinalPct] = useState(0);
  const skipRef = useRef(false);
  const manualRef = useRef(false);
  const timersRef = useRef<any[]>([]);
  const finalStartedRef = useRef(false);

  useEffect(() => {
    const timers: any[] = [];
    timers.push(setTimeout(() => { if (!skipRef.current && !manualRef.current) setPhase(1); }, INTRO_MS));
    timers.push(setTimeout(() => { if (!skipRef.current && !manualRef.current) setPhase(2); }, INTRO_MS + TOOL_1_MS));
    timers.push(setTimeout(() => { if (!skipRef.current && !manualRef.current) setPhase(3); }, INTRO_MS + TOOL_1_MS + TOOL_2_MS));
    timersRef.current = timers;
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once phase 3 (the last tool) is reached — auto OR manual — start the 10s
  // footer loading bar before auto-transitioning to /final-loading. Triggers
  // exactly once; user can keep jumping between tools while it ticks.
  useEffect(() => {
    if (phase !== 3 || finalStartedRef.current) return;
    finalStartedRef.current = true;
    const startedAt = performance.now();
    let raf = 0;
    const tick = () => {
      if (skipRef.current) return;
      const elapsed = performance.now() - startedAt;
      const pct = Math.min(100, (elapsed / 10000) * 100);
      setFinalPct(pct);
      if (pct >= 100) {
        setScreen && setScreen("final-loading");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const onSkip = () => {
    skipRef.current = true;
    setScreen && setScreen("home");
  };

  // Manual jump via progress dot OR tile tap — stops the auto cycle and parks on the chosen phase
  const onDotClick = (idx: number) => {
    manualRef.current = true;
    timersRef.current.forEach(clearTimeout);
    setPhase(idx + 1);
  };

  // active tool by phase: 1=savings, 2=best, 3=redeem  (matches row order)
  const activeId: ToolDef["id"] | null =
    phase === 1 ? "savings" :
    phase === 2 ? "best"    :
    phase === 3 ? "redeem"  : null;

  const activeTool = TOOLS.find(t => t.id === activeId) ?? null;

  // Progress dot index follows tutorial order (savings → best → redeem)
  const activeDotIdx = phase === 1 ? 0 : phase === 2 ? 1 : phase === 3 ? 2 : -1;

  const introVisible = phase === 0;
  const finalFade    = phase === 4;
  const showCards    = phase >= 1 && phase <= 3;

  return (
    <div style={{
      fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh",
      background: "#FFFFFF", position: "relative", overflow: "hidden", userSelect: "none",
      opacity: finalFade ? 0 : 1,
      transition: "opacity 0.5s cubic-bezier(0.32,0,0.67,0)",
    }}>
      <FL />
      <style>{`
        @keyframes tiOrbIn   { from { opacity: 0; transform: translate(-50%, -50%) scale(0.78); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes tiOrbPulse{ 0%,100% { box-shadow: 0px 3.71px 4.85px rgba(149,0,229,0.15), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF; } 50% { box-shadow: 0px 6px 18px rgba(149,0,229,0.32), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF; } }
        @keyframes tiTextUp  { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes tiRowIn   { from { opacity: 0; transform: translate(-50%, 24px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes tiCapIn   { from { opacity: 0; transform: translate(-50%, 6px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes tiIconBob { 0%, 100% { transform: var(--bob-base, translate(0,0)); } 50% { transform: var(--bob-up, translate(0,-3px)); } }
      `}</style>

      {/* Top purple gradient */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 360,
        background: "linear-gradient(180deg, #5856F6 0%, rgba(99, 146, 248, 0) 100%)",
        opacity: 0.45, pointerEvents: "none", zIndex: 0,
      }} />

      {/* Soft white blur backdrop */}
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

      {/* Persistent header (Figma Frame 1991635072) — 332-wide container at top 54,
          flex-column gap 13: eyebrow row 332×25 ("Your Cards" 9px/0.1em/#4A4A4A)
          + cards row 250.72×50.68 (3 thumbs 75×50, gap 12, blue drop-shadow). */}
      <div style={{
        position: "absolute", left: "calc(50% + 2px)", top: 54, transform: "translateX(-50%)",
        width: 332, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 13,
        animation: "tiTextUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both",
        zIndex: 3, boxSizing: "border-box",
      }}>
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
        <div style={{
          width: 250.72, height: 50.68, margin: "0 auto",
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

      {/* Phase 0 — intro orb + intro text */}
      {introVisible && (
        <>
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            width: 96, height: 96, boxSizing: "border-box",
            background: "#7C43F7", borderRadius: "100px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0px 3.71px 4.85px rgba(149,0,229,0.15), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF",
            animation: "tiOrbIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both, tiOrbPulse 2.4s ease-in-out 0.8s infinite",
            transform: "translate(-50%, -50%)",
            zIndex: 4,
          }}>
            <CreditCard size={32} strokeWidth={2.4} color="#FFFFFF" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.18))" }} />
          </div>
          <div style={{
            position: "absolute", left: "50%", top: "calc(50% + 84px)",
            width: 320, textAlign: "center", transform: "translateX(-50%)",
            fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 600, fontSize: 18,
            lineHeight: "140%", letterSpacing: "-0.01em", color: "rgba(54, 64, 96, 0.95)",
            whiteSpace: "nowrap",
            animation: "tiTextUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.45s both",
            zIndex: 3,
          }}>
            Let me now introduce you to some tools
          </div>
        </>
      )}

      {/* Phases 1–3 — tool cards row (327×133, gap 12, top 297) + caption + dots */}
      {showCards && (
        <>
          <div style={{
            position: "absolute", left: "50%", top: 297, transform: "translateX(-50%)",
            width: 327, height: 133,
            display: "flex", flexDirection: "row", alignItems: "center", gap: 12,
            animation: "tiRowIn 0.65s cubic-bezier(0.16,1,0.3,1) both",
            zIndex: 4,
          }}>
            {TOOLS.map((tool, idx) => {
              const active = activeId === tool.id;
              return (
                <div
                  key={tool.id}
                  onClick={() => onDotClick(idx)}
                  role="button"
                  aria-label={tool.label.replace("\n", " ")}
                  style={{
                    flex: 1,
                    height: 107,
                    background: tool.bg,
                    border: active ? "1px solid #7D7CF3" : "1px solid rgba(255,255,255,0.9)",
                    boxShadow: active
                      ? "0px 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(9,84,171,0.10)"
                      : "0 1px 3px rgba(9,84,171,0.10)",
                    borderRadius: 12,
                    position: "relative",
                    overflow: "hidden",
                    opacity: active ? 1 : 0.85,
                    cursor: "pointer",
                    transition: "border-color 0.45s ease, box-shadow 0.45s ease, opacity 0.45s ease",
                  }}
                >
                  {/* Background ellipse */}
                  <div style={{
                    position: "absolute",
                    width: 98, height: 98,
                    right: -20, bottom: -28,
                    borderRadius: "50%",
                    background: tool.ellipse,
                    pointerEvents: "none",
                  }}/>
                  {/* Label at top */}
                  <div style={{
                    position: "absolute", top: 10, left: 10, right: 10,
                    fontFamily: "'Google Sans', system-ui, sans-serif",
                    fontSize: 11, fontWeight: 500, lineHeight: "16px",
                    letterSpacing: "0.02em", color: "#000000",
                    whiteSpace: "pre-line",
                  }}>{tool.label}</div>
                  {/* 3D icon — anchored bottom-right, overlapping the ellipse */}
                  <img
                    src={tool.img}
                    alt=""
                    style={{
                      position: "absolute",
                      width: 82, height: 82,
                      right: -4, bottom: -4,
                      objectFit: "contain",
                      pointerEvents: "none",
                      animation: active ? "tiIconBob 3.6s ease-in-out infinite" : undefined,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Caption — under the cards row */}
          {activeTool && (
            <div
              key={`caption-${phase}`}
              style={{
                position: "absolute", left: "50%", top: 470,
                width: 360, maxWidth: "calc(100vw - 16px)", textAlign: "center",
                fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 600, fontSize: 18,
                lineHeight: "135%", letterSpacing: "-0.01em", color: "rgba(54, 64, 96, 0.95)",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                animation: "tiCapIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
                zIndex: 3,
              }}
            >
              {activeTool.description}
            </div>
          )}

          {/* Progress dots */}
          <div style={{
            position: "absolute", left: "50%", top: 510, transform: "translateX(-50%)",
            display: "flex", flexDirection: "row", alignItems: "center", gap: 8,
            zIndex: 3,
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                onClick={() => onDotClick(i)}
                role="button"
                aria-label={`Go to step ${i + 1}`}
                style={{
                  /* Larger transparent hit area for fingers, with the visible pill centered inside */
                  padding: "10px 6px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "-10px -2px",
                }}
              >
                <div style={{
                  width: i === activeDotIdx ? 22 : 6, height: 6,
                  borderRadius: 4,
                  background: i === activeDotIdx ? "#5856F6" : "rgba(54, 64, 96, 0.18)",
                  transition: "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s ease",
                }} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer 10s loading bar — appears once the last tool (phase 3) is reached */}
      {finalStartedRef.current && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 4,
          background: "rgba(54,64,96,0.08)", zIndex: 5, pointerEvents: "none",
        }}>
          <div style={{
            height: "100%", width: `${finalPct}%`,
            background: "#5856F6",
            borderRadius: "0 2px 2px 0",
            transition: "width 0.05s linear",
          }}/>
        </div>
      )}

      {/* Bottom Skip Tutorial pill */}
      <div style={{
        position: "absolute", left: "50%", bottom: 36, transform: "translateX(-50%)",
        zIndex: 6,
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
      </div>
    </div>
  );
}
