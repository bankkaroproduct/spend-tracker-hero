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
  "/legacy-assets/cards/axis-flipkart.png",
  "/legacy-assets/cards/hsbc-travel-one.png",
  "/legacy-assets/cards/hsbc-live.png",
];

type ToolDef = {
  id: "savings" | "best" | "redeem";
  label: string;
  img: string;
  iconSize: number;
  iconTop: number;
  iconLeftOffset?: number;
  rotate?: number;
  description: string;
};

// Order in the row: LEFT, CENTRE, RIGHT
const TOOLS: ToolDef[] = [
  {
    id: "savings",
    label: "Savings\nFinder",
    img: "/tools/savings-finder.webp",
    iconSize: 106,
    iconTop: -7,
    iconLeftOffset: 0.5,
    description: "Suggests the right card for your next spend",
  },
  {
    id: "best",
    label: "Best Cards\nfor you",
    img: "/tools/best-cards.webp",
    iconSize: 97,
    iconTop: -9,
    rotate: -2.88,
    description: "Suggests the next best credit card for you",
  },
  {
    id: "redeem",
    label: "Redeem\nReward Points",
    img: "/tools/redeem.webp",
    iconSize: 121,
    iconTop: -19,
    iconLeftOffset: 0,
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
  const skipRef = useRef(false);

  useEffect(() => {
    const timers: any[] = [];
    timers.push(setTimeout(() => { if (!skipRef.current) setPhase(1); }, INTRO_MS));
    timers.push(setTimeout(() => { if (!skipRef.current) setPhase(2); }, INTRO_MS + TOOL_1_MS));
    timers.push(setTimeout(() => { if (!skipRef.current) setPhase(3); }, INTRO_MS + TOOL_1_MS + TOOL_2_MS));
    timers.push(setTimeout(() => { if (!skipRef.current) setPhase(4); }, INTRO_MS + TOOL_1_MS + TOOL_2_MS + TOOL_3_MS));
    timers.push(setTimeout(() => { if (!skipRef.current) setScreen && setScreen("final-loading"); },
      INTRO_MS + TOOL_1_MS + TOOL_2_MS + TOOL_3_MS + EXIT_MS));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSkip = () => {
    skipRef.current = true;
    setScreen && setScreen("home");
  };

  // active tool by phase: 1=savings, 2=redeem, 3=best
  const activeId: ToolDef["id"] | null =
    phase === 1 ? "savings" :
    phase === 2 ? "redeem"  :
    phase === 3 ? "best"    : null;

  const activeTool = TOOLS.find(t => t.id === activeId) ?? null;

  // Progress dot index follows tutorial order (savings → redeem → best)
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
            {TOOLS.map((tool) => {
              const active = activeId === tool.id;
              const iconLeftCalc = tool.iconLeftOffset
                ? `calc(50% - ${tool.iconSize}px/2 + ${tool.iconLeftOffset}px)`
                : `calc(50% - ${tool.iconSize}px/2)`;
              return (
                <div
                  key={tool.id}
                  style={{
                    position: "relative",
                    width: 101, height: 133,
                    background: active ? "#FFFFFF" : "transparent",
                    border: active ? "1px solid #7D7CF3" : "1px solid transparent",
                    borderRadius: 8,
                    boxShadow: active
                      ? "0px 4px 12px rgba(0,0,0,0.1), 0px 0.621951px 4.35366px rgba(63,66,70,0.11)"
                      : "none",
                    overflow: "visible",
                    transition: "background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease",
                  }}
                >
                  {/* Icon — overflows above the card per Figma offsets */}
                  <img
                    src={tool.img}
                    alt=""
                    style={{
                      position: "absolute",
                      width: tool.iconSize, height: tool.iconSize,
                      left: iconLeftCalc,
                      top: tool.iconTop,
                      transform: tool.rotate ? `rotate(${tool.rotate}deg)` : undefined,
                      objectFit: "contain",
                      opacity: active ? 1 : 0.85,
                      filter: active ? "none" : "saturate(0.85)",
                      transition: "opacity 0.4s ease, filter 0.4s ease",
                      animation: active ? "tiIconBob 3.6s ease-in-out infinite" : undefined,
                    }}
                  />

                  {/* Label — top 87 inside the 133-tall card, 2 lines */}
                  <div style={{
                    position: "absolute",
                    left: 0, right: 0, top: 87,
                    textAlign: "center",
                    fontFamily: "'Google Sans',sans-serif",
                    fontWeight: 500, fontSize: 12, lineHeight: "18px",
                    color: "rgba(54, 64, 94, 0.9)",
                    whiteSpace: "pre-line",
                  }}>
                    {tool.label}
                  </div>
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
              <div key={i} style={{
                width: i === activeDotIdx ? 22 : 6, height: 6,
                borderRadius: 4,
                background: i === activeDotIdx ? "#5856F6" : "rgba(54, 64, 96, 0.18)",
                transition: "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s ease",
              }} />
            ))}
          </div>
        </>
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
