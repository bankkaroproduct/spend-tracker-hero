// @ts-nocheck
import { useEffect, useState } from "react";
import { CreditCard, Mail } from "lucide-react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";

/**
 * Card Identification — second post-onboarding sequence.
 *
 * Phase 0  (0–1500ms)   : Orb + "Now let's fetch your Credit Cards"
 * Phase 1  (1500ms+)    : Orb fades, eyebrow "3 CARDS IDENTIFIED" fades in,
 *                          three card thumbnails rise + fade in 280ms apart.
 * Phase 2  (~3800ms+)   : Cards behind blur+dim; bottom sheet slides up with
 *                          Gmail-orb perched on its top edge, copy + CTAs.
 *
 * Asset hooks (placeholder until user supplies finals):
 *   /cards-id/card-1.png  (Axis dark-red wave)
 *   /cards-id/card-2.png  (YES navy dot grid)
 *   /cards-id/card-3.png  (Axis red wave)
 */

// Card thumbnails — inline SVG renderings of the assets the user sent
// (Axis magenta wave + 2× HSBC navy diamond-grid). If a final PNG is
// dropped at /cards-id/card-N.png it overlays automatically.
const CARDS = [
  { src: "/cards-id/card-1.png", last4: "7945", variant: "axis" as const },
  { src: "/cards-id/card-2.png", last4: "8234", variant: "hsbc" as const },
  { src: "/cards-id/card-3.png", last4: "9945", variant: "hsbc" as const },
];

function CardThumbAxis() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 110 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <radialGradient id="axisBg" cx="0%" cy="0%" r="140%">
          <stop offset="0%" stopColor="#D43A78" />
          <stop offset="35%" stopColor="#7A1E45" />
          <stop offset="70%" stopColor="#2C0E1A" />
          <stop offset="100%" stopColor="#100509" />
        </radialGradient>
        <pattern id="axisDots" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.6" fill="rgba(255,255,255,0.16)" />
        </pattern>
      </defs>
      <rect width="110" height="168" rx="10" fill="url(#axisBg)" />
      {/* dotted wave overlay */}
      <rect width="110" height="168" rx="10" fill="url(#axisDots)" opacity="0.55" />
      {/* magenta highlight curve top-right */}
      <path d="M40 0 Q90 45 110 110 L110 0 Z" fill="rgba(220, 70, 130, 0.22)" />
      {/* Axis logo */}
      <g transform="translate(8 8)">
        <path d="M0 9 L4.5 0 L9 9 Z" fill="#FFFFFF" />
        <path d="M2.4 6 H6.6 L7.6 9 H1.4 Z" fill="#1B0E14" />
        <text x="11" y="8" fontFamily="Inter, sans-serif" fontSize="6.5" fontWeight="700" fill="#FFFFFF" letterSpacing="0.04em">AXIS BANK</text>
      </g>
    </svg>
  );
}

function CardThumbHSBC() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 110 168" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <radialGradient id="hsbcBg" cx="100%" cy="100%" r="160%">
          <stop offset="0%" stopColor="#27576A" />
          <stop offset="40%" stopColor="#11334A" />
          <stop offset="80%" stopColor="#091E2E" />
          <stop offset="100%" stopColor="#04101A" />
        </radialGradient>
        <pattern id="hsbcDots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1.2" height="1.2" fill="rgba(255,255,255,0.18)" />
        </pattern>
        <linearGradient id="hsbcDotsFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000000" stopOpacity="1" />
        </linearGradient>
        <mask id="hsbcDotsMask">
          <rect width="110" height="168" fill="url(#hsbcDotsFade)" />
        </mask>
      </defs>
      <rect width="110" height="168" rx="10" fill="url(#hsbcBg)" />
      <rect width="110" height="168" rx="10" fill="url(#hsbcDots)" mask="url(#hsbcDotsMask)" />
      {/* HSBC logo: red hexagonal mark + wordmark */}
      <g transform="translate(8 8)">
        <g transform="translate(0 0)">
          {/* Red hex - approximated with diamond pair */}
          <polygon points="6,0 12,4 12,9 6,13 0,9 0,4" fill="#DB0011" />
          <polygon points="6,2 10,4.8 10,8.2 6,11 2,8.2 2,4.8" fill="#FFFFFF" />
          <polygon points="6,3.5 9,5.4 9,7.6 6,9.5 3,7.6 3,5.4" fill="#DB0011" />
        </g>
        <text x="15" y="9.5" fontFamily="Inter, sans-serif" fontSize="7" fontWeight="700" fill="#FFFFFF" letterSpacing="0.02em">HSBC</text>
      </g>
    </svg>
  );
}

export function CardIdentificationScreen() {
  const ctx: any = useAppContext();
  const { setScreen, setBuildPhase, startGmailFlow } = ctx;

  // 0 = orb intro, 1 = cards revealed, 2 = bottom sheet up
  const [phase, setPhase] = useState(0);
  const [cardsRevealed, setCardsRevealed] = useState(0);
  const [eyebrowIn, setEyebrowIn] = useState(false);

  useEffect(() => {
    const t: any[] = [];
    // 1500ms → enter phase 1
    t.push(setTimeout(() => { setPhase(1); }, 1500));
    // 1700ms → eyebrow appears (small beat after orb starts fading)
    t.push(setTimeout(() => setEyebrowIn(true), 1700));
    // Cards stagger in 280ms apart, starting once eyebrow has anchored (1900ms)
    for (let i = 0; i < CARDS.length; i++) {
      t.push(setTimeout(() => setCardsRevealed(n => Math.max(n, i + 1)), 1900 + i * 280));
    }
    // 3800ms → enter phase 2 (sheet up)
    t.push(setTimeout(() => { setPhase(2); }, 3800));
    return () => t.forEach(clearTimeout);
  }, []);

  const onGmail = () => {
    startGmailFlow && startGmailFlow("txn-eval");
  };
  const onManual = () => {
    setScreen && setScreen("manual-entry");
  };

  return (
    <div style={{
      fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh",
      background: "#FFFFFF",
      position: "relative", overflow: "hidden", userSelect: "none",
    }}>
      <FL />
      <style>{`
        @keyframes ciOrbIn    { from { opacity: 0; transform: translate(-50%, -50%) scale(0.78); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes ciOrbPulse { 0%,100% { box-shadow: 0px 3.71362px 4.84582px rgba(149, 0, 229, 0.15), 0px 0px 0px 4px #F3EAF8, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #F2D9FF, inset 0px 1px 4px 2px #F2D9FF; } 50% { box-shadow: 0px 6px 18px rgba(149, 0, 229, 0.32), 0px 0px 0px 4px #F3EAF8, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #F2D9FF, inset 0px 1px 4px 2px #F2D9FF; } }
        @keyframes ciTextIn   { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes ciCardIn   { from { opacity: 0; transform: translateY(28px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes ciSheetUp  { from { opacity: 0; transform: translateY(110%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ciDimIn    { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(8px); } }
        @keyframes ciGmailOrbIn { from { opacity: 0; transform: translateY(20px) scale(0.6); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Top purple gradient — softer in phase 2 so cards stay punchy */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 360,
        background: "linear-gradient(180deg, #5856F6 0%, rgba(99, 146, 248, 0) 100%)",
        opacity: phase === 2 ? 0.18 : 0.55,
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* iOS status bar — time + signal/wifi/battery */}
      <div style={{ position: "absolute", left: 33, top: 16, fontFamily: "'SF Pro',sans-serif", fontWeight: 700, fontSize: 15, lineHeight: "18px", letterSpacing: "-0.02em", color: "#0D0D0E", zIndex: 10 }}>9:41</div>
      <div style={{ position: "absolute", right: 24, top: 16, display: "flex", alignItems: "center", gap: 6, zIndex: 10 }}>
        {/* Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#0D0D0E"/>
          <rect x="5" y="6" width="3" height="6" rx="0.5" fill="#0D0D0E"/>
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill="#0D0D0E"/>
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="#0D0D0E"/>
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 10.5 L9.7 8.8 a2.4 2.4 0 0 0-3.4 0 Z" fill="#0D0D0E"/>
          <path d="M8 7 L11.3 3.7 a4.65 4.65 0 0 0-6.6 0 Z M8 7 L11.3 3.7 M4.7 3.7 L8 7" stroke="#0D0D0E" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.85"/>
          <path d="M8 3.5 L13.5 -2 a8 8 0 0 0-11 0 Z" stroke="#0D0D0E" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6"/>
        </svg>
        {/* Battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="#0D0D0E" strokeOpacity="0.4"/>
          <rect x="2" y="2" width="19" height="8" rx="1.3" fill="#0D0D0E"/>
          <rect x="23.5" y="4" width="1.5" height="4" rx="0.5" fill="#0D0D0E" fillOpacity="0.4"/>
        </svg>
      </div>

      {/* ───── ORB (phase 0 only) ───── */}
      {phase === 0 && (
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 96, height: 96, boxSizing: "border-box",
          background: "#7C43F7",
          backgroundBlendMode: "plus-lighter, normal",
          boxShadow: "0px 3.71362px 4.84582px rgba(149, 0, 229, 0.153301), 0px 0px 0px 4px #F3EAF8, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #F2D9FF, inset 0px 1px 4px 2px #F2D9FF",
          borderRadius: "100px",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "ciOrbIn 0.7s cubic-bezier(0.16,1,0.3,1) both, ciOrbPulse 2.4s ease-in-out 0.7s infinite",
          transform: "translate(-50%, -50%)", zIndex: 4,
        }}>
          <CreditCard size={32} strokeWidth={2.4} color="#FFFFFF" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.18))" }} />
        </div>
      )}

      {/* Phase-0 caption */}
      {phase === 0 && (
        <div style={{
          position: "absolute", left: "50%", top: "calc(50% + 96px)",
          width: 320, textAlign: "center",
          fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 600, fontSize: 18,
          lineHeight: "140%", letterSpacing: "-0.01em", color: "rgba(54, 64, 96, 0.9)",
          transform: "translateX(-50%)",
          animation: "ciTextIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.25s both",
          zIndex: 3,
        }}>
          Now let's fetch your Credit Cards
        </div>
      )}

      {/* ───── EYEBROW + CARD ROW (phase 1+) — sized to match Manual Entry confirmation ───── */}
      {phase >= 1 && (
        <>
          <div style={{
            position: "absolute", left: "50%", top: 70, transform: "translateX(-50%)",
            fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 11,
            lineHeight: "140%", letterSpacing: "0.2em", color: "rgba(38, 45, 68, 0.78)",
            textTransform: "uppercase",
            opacity: eyebrowIn ? 1 : 0,
            transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1)",
            zIndex: 3,
          }}>
            3 cards identified
          </div>

          {/* Card row — top 112, gap 16, cards 99.49×150.15 (Manual Entry confirmation parity) */}
          <div style={{
            position: "absolute", left: "50%", top: 112, transform: "translateX(-50%)",
            display: "flex", flexDirection: "row", alignItems: "center", gap: 16,
            zIndex: 2,
            filter: phase === 2 ? "blur(14px)" : "none",
            opacity: phase === 2 ? 0.55 : 1,
            transition: "filter 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {CARDS.map((c, i) => (
              <div key={i} style={{
                width: 99.49, display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                opacity: i < cardsRevealed ? 1 : 0,
                animation: i < cardsRevealed ? `ciCardIn 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` : "none",
              }}>
                {/* Card thumbnail — 99.49×150.15 to mirror Manual Entry */}
                <div style={{
                  width: 99.49, height: 150.15, borderRadius: 7.32,
                  boxShadow: "0px 0.27px 0.38px -0.46px rgba(0,0,0,0.26), 0px 0.74px 1.05px -0.92px rgba(0,0,0,0.247), 0px 1.62px 2.29px -1.37px rgba(0,0,0,0.23), 0px 3.6px 5.09px -1.83px rgba(0,0,0,0.192), 0px 8.54px 12.95px -2.29px rgba(0,0,0,0.2)",
                  position: "relative", overflow: "hidden",
                }}>
                  {c.variant === "axis" ? <CardThumbAxis /> : <CardThumbHSBC />}
                  <img src={c.src} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                {/* Below-card labels — match Manual Entry typography */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 8,
                    lineHeight: "10px", letterSpacing: "0.1em", color: "#4D4D4D",
                    textTransform: "uppercase", textAlign: "center",
                  }}>
                    Card ending with
                  </div>
                  <div style={{
                    fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 10,
                    lineHeight: "10px", color: "#434343",
                  }}>
                    XXXX {c.last4}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ───── PHASE 2: floating card centred at top 385 (Figma spec) ───── */}
      {phase === 2 && (
        <>
          {/* Subtle grey dim overlay across the whole screen, behind the card */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(80, 92, 115, 0.28)",
            animation: "ciDimIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
            zIndex: 5, pointerEvents: "none",
          }} />
          {/* Floating card — per Figma: 328×318 (16px side margins); anchored 32px from bottom; appears 1.5s after cards animate in */}
          <div style={{
            position: "absolute",
            left: 16, right: 16, bottom: 32, height: 318,
            boxSizing: "border-box",
            background: "#FAFDFE",
            border: "1px solid rgba(219, 222, 226, 0.7)",
            boxShadow: "0px 7px 29px rgba(100, 100, 111, 0.2)",
            borderRadius: 32,
            animation: "ciSheetUp 0.55s cubic-bezier(0.32,0.72,0,1) 1.5s both",
            zIndex: 6,
          }}>
            {/* Gmail orb — 96×96, centred horizontally; pushed down per Figma (top: -37) */}
            <div style={{
              position: "absolute",
              left: "calc(50% - 48px)", top: -37,
              width: 96, height: 96, boxSizing: "border-box",
              background: "linear-gradient(180deg, #0073FF 0%, #0DA2FF 100%)",
              backgroundBlendMode: "plus-lighter, normal",
              boxShadow: "0px 24.7206px 32.2574px rgba(87, 177, 255, 0.1867), 0px 10.2677px 13.3981px rgba(87, 177, 255, 0.22), 0px 3.71362px 4.84582px rgba(87, 177, 255, 0.153301), 0px 0px 0px 4px #E0E9F2, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #D2EAFF, inset 0px 1px 4px 2px #D2EAFF",
              borderRadius: 100,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "ciGmailOrbIn 0.5s cubic-bezier(0.16,1,0.3,1) 1.7s both",
              zIndex: 7,
            }}>
              {/* Envelope mark — 36×36, white */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M3 9 L33 9 L33 27 L3 27 Z M3 9 L18 19 L33 9" stroke="#FFFFFF" strokeWidth="2.4" strokeLinejoin="round" fill="none" />
              </svg>
            </div>

            {/* Heading + body cluster — Frame 1991634523 (top 83) */}
            <div style={{
              position: "absolute", left: 16, right: 16, top: 83,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              {/* Heading — Blacklist 800 21px line-height 120% color #364060 */}
              <div style={{
                width: 235, textAlign: "center",
                fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 800, fontSize: 21,
                lineHeight: "120%", color: "#364060",
              }}>
                Help us identify your cards
              </div>
              {/* Body — Google Sans 400 14px line-height 140% color #808387 */}
              <div style={{
                width: 280, textAlign: "center",
                fontFamily: "'Google Sans',sans-serif", fontWeight: 400, fontSize: 14,
                lineHeight: "140%", color: "#808387",
              }}>
                So that we understand your spends and recommend the best ways to use your card
              </div>
            </div>

            {/* CTA cluster — Frame 1991634525 (bottom 18.49) */}
            <div style={{
              position: "absolute", left: 6, right: 6, bottom: 18.49,
              padding: "24px 12px 16px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 16, boxSizing: "border-box",
            }}>
              {/* Primary CTA — 292×50.51, #222941, neumorphic shadow stack */}
              <button onClick={onGmail} style={{
                width: "100%", height: 50.51, border: "none", cursor: "pointer",
                padding: "15.2561px 20.3415px",
                background: "#222941",
                boxShadow: "0.290071px 0.290071px 0.410222px -0.489341px rgba(0, 0, 0, 0.26), 0.789939px 0.789939px 1.11714px -0.978681px rgba(0, 0, 0, 0.247), 1.73442px 1.73442px 2.45284px -1.46802px rgba(0, 0, 0, 0.23), 3.85002px 3.85002px 5.44475px -1.95736px rgba(0, 0, 0, 0.192), 9.13436px 9.13436px 13.8406px -2.4467px rgba(0, 0, 0, 0.2), -0.326227px -0.326227px 0px rgba(0, 0, 0, 0.686), inset 0.652454px 0.652454px 0.652454px rgba(255, 255, 255, 0.7), inset -0.652454px -0.652454px 0.652454px rgba(0, 0, 0, 0.23)",
                borderRadius: 10.1707,
                display: "flex", justifyContent: "center", alignItems: "center", gap: 8.48,
              }}>
                <GmailLogo />
                <span style={{
                  fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 13.561,
                  lineHeight: "150%", textAlign: "center", color: "#FEFEFE",
                }}>Fetch them through my Gmail</span>
              </button>

              {/* Secondary link — 12px 600 #222941 */}
              <div onClick={onManual} style={{
                cursor: "pointer", textAlign: "center",
                fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 12,
                lineHeight: "150%", color: "#222941",
              }}>
                I'll enter them manually
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Inline Gmail "M" logo — 18×18 to match Figma spec
function GmailLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 16h3.5V7.5L1 4v10.5C1 15.33 1.67 16 2.5 16H2z" fill="#4285F4"/>
      <path d="M16.5 16H20a1 1 0 001-1V4l-4.5 3.5V16z" fill="#34A853"/>
      <path d="M16.5 1.5v6L21 4V2.5C21 1.12 19.42.32 18.32 1.16L16.5 1.5z" fill="#FBBC04"/>
      <path d="M5.5 7.5v-6L11 5.5l5.5-4v6L11 12 5.5 7.5z" fill="#EA4335"/>
      <path d="M1 2.5V4l4.5 3.5v-6L3.68 1.16C2.58.32 1 1.12 1 2.5z" fill="#C5221F"/>
    </svg>
  );
}
