// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { CreditCard } from "lucide-react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";

/**
 * Final Loading Screen — last leg of the onboarding cinematic before /home.
 *
 * Same chrome as TxnEval / ToolsIntro:
 *   - persistent header (Figma 332-wide eyebrow + 3 cards at top 54)
 *   - centred orb (purple credit-card)
 *   - skip pill at bottom
 *
 * Phases:
 *   0 (0–2000ms)    "Finalising results"
 *   1 (2000–4000ms) "Optimizing Options"
 *   2 (4000–6000ms) "Creating your dashboard"
 *   3 (6000–7100ms) Cinematic exit transition
 *                    - orb breathes (1 → 1.08 → 1) for 600ms
 *                    - caption fades down + out
 *                    - cards row "lifts off" (translateY -10, fade)
 *                    - orb scales 1 → 1.6 + fades, soft purple glow blooms outward
 *                    - white veil fades in over everything
 *                    - setScreen("home") fires under the white veil
 */

const CARD_IMGS = [
  "/legacy-assets/cards/axis-flipkart.webp",
  "/legacy-assets/cards/hsbc-travel-one.webp",
  "/legacy-assets/cards/hsbc-live.webp",
];

const PHASES = [
  "Finalising results",
  "Optimizing Options",
  "Creating your dashboard",
];

const PHASE_MS  = 2000;
const EXIT_MS   = 1100;

export function FinalLoadingScreen() {
  const ctx: any = useAppContext();
  const { setScreen } = ctx;

  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [veilUp, setVeilUp]   = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    const t: any[] = [];
    t.push(setTimeout(() => { if (!skipRef.current) setPhase(1); }, PHASE_MS));
    t.push(setTimeout(() => { if (!skipRef.current) setPhase(2); }, PHASE_MS * 2));
    // After 6s, start exit choreography
    t.push(setTimeout(() => { if (!skipRef.current) setExiting(true); }, PHASE_MS * 3));
    // Bring up white veil ~700ms into exit
    t.push(setTimeout(() => { if (!skipRef.current) setVeilUp(true); }, PHASE_MS * 3 + 700));
    // Swap to /home at peak white-veil opacity
    t.push(setTimeout(() => { if (!skipRef.current) setScreen && setScreen("home"); }, PHASE_MS * 3 + EXIT_MS));
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSkip = () => {
    skipRef.current = true;
    setScreen && setScreen("home");
  };

  return (
    <div style={{
      fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh",
      background: "#FFFFFF", position: "relative", overflow: "hidden", userSelect: "none",
    }}>
      <FL />
      <style>{`
        @keyframes flOrbIn      { from { opacity: 0; transform: translate(-50%, -50%) scale(0.78); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes flOrbBreathe { 0%,100% { box-shadow: 0px 3.71px 4.85px rgba(149,0,229,0.15), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF; } 50% { box-shadow: 0px 6px 18px rgba(149,0,229,0.32), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF; } }
        @keyframes flOrbBeat    { 0% { transform: translate(-50%, -50%) scale(1); } 40% { transform: translate(-50%, -50%) scale(1.08); } 100% { transform: translate(-50%, -50%) scale(1); } }
        @keyframes flOrbBurst   { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(-50%, -50%) scale(1.6); } }
        @keyframes flGlowOut    { from { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } to { opacity: 0.85; transform: translate(-50%, -50%) scale(2.2); } }
        @keyframes flCapIn      { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes flCapOut     { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, 6px); } }
        @keyframes flHeaderUp   { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -10px); } }
        @keyframes flTextUp     { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>

      {/* Top purple gradient — same chrome */}
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

      {/* Persistent header — same Figma spec as TxnEval / ToolsIntro */}
      <div style={{
        position: "absolute", left: "calc(50% + 2px)", top: 54, transform: "translateX(-50%)",
        width: 332, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 13,
        animation: exiting
          ? "flHeaderUp 0.55s cubic-bezier(0.32,0,0.67,0) both"
          : "flTextUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both",
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

      {/* Soft purple radial glow that blooms outward during exit */}
      {exiting && (
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(124,67,247,0.55), rgba(124,67,247,0))",
          transform: "translate(-50%, -50%)",
          animation: "flGlowOut 1s cubic-bezier(0.16,1,0.3,1) both",
          pointerEvents: "none",
          zIndex: 2,
        }} />
      )}

      {/* Orb */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 96, height: 96, boxSizing: "border-box",
        background: "#7C43F7", borderRadius: "100px",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0px 3.71px 4.85px rgba(149,0,229,0.15), 0 0 0 4px #F3EAF8, 0 0 0 5px #FFFFFF, inset 0 1px 18px 2px #F2D9FF, inset 0 1px 4px 2px #F2D9FF",
        animation: exiting
          ? "flOrbBeat 0.6s cubic-bezier(0.16,1,0.3,1) both, flOrbBurst 0.55s cubic-bezier(0.32,0,0.67,0) 0.55s both"
          : "flOrbIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both, flOrbBreathe 2.4s ease-in-out 0.8s infinite",
        transform: "translate(-50%, -50%)",
        zIndex: 4,
      }}>
        <CreditCard size={32} strokeWidth={2.4} color="#FFFFFF" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.18))" }} />
      </div>

      {/* Caption — crossfades through phases, exits before veil */}
      {!exiting && (
        <div
          key={`fl-cap-${phase}`}
          style={{
            position: "absolute", left: "50%", top: "calc(50% + 84px)",
            width: 320, textAlign: "center", transform: "translateX(-50%)",
            fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 600, fontSize: 18,
            lineHeight: "140%", letterSpacing: "-0.01em", color: "rgba(54, 64, 96, 0.95)",
            whiteSpace: "nowrap",
            animation: "flCapIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
            zIndex: 3,
          }}
        >
          {PHASES[phase]}
        </div>
      )}
      {exiting && (
        <div style={{
          position: "absolute", left: "50%", top: "calc(50% + 84px)",
          width: 320, textAlign: "center", transform: "translateX(-50%)",
          fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 600, fontSize: 18,
          lineHeight: "140%", letterSpacing: "-0.01em", color: "rgba(54, 64, 96, 0.95)",
          whiteSpace: "nowrap",
          animation: "flCapOut 0.35s cubic-bezier(0.32,0,0.67,0) both",
          zIndex: 3,
        }}>
          {PHASES[2]}
        </div>
      )}

      {/* White veil — fades in to mask the route swap */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#FFFFFF",
        opacity: veilUp ? 1 : 0,
        transition: "opacity 0.4s cubic-bezier(0.32,0,0.67,0)",
        pointerEvents: veilUp ? "auto" : "none",
        zIndex: 8,
      }} />

      {/* Bottom Skip Tutorial pill */}
      {!exiting && (
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
      )}
    </div>
  );
}
