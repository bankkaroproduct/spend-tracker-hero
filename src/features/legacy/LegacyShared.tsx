import { useEffect, useMemo, useState } from "react";
import { CreditCard, Gauge, Receipt, Trophy, Plane, Sparkles } from "lucide-react";
import { SCENARIO_PILL, SCENARIO_SAVED_COLOR, tagText } from "@/data/simulation/txnScenario";
import { SAVINGS_BARS, SPEND_BRANDS, SPEND_CATS, TOTAL_ACC } from "@/data/simulation/legacy";
import { f } from "@/lib/format";

// ───────────────────────────────────────────────────────────────────────────
// SAVINGS BREAKDOWN — shared (i) tooltip + bottom-sheet that explains a single
// card's savings number as a tally:
//   total = savingsOnSpends + milestoneBenefits − annualFee
// Used by the Spends Distribution rows in LegacyOptimiseScreen, CardDetailV2
// and PortfolioResultsScreen so the math always reconciles.
// ───────────────────────────────────────────────────────────────────────────
export function SavingsInfoIcon({ onClick }: { onClick: (e: any) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Savings breakdown"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 16, height: 16, marginLeft: 6, padding: 0,
        background: "rgba(11,146,81,0.12)", border: "none", borderRadius: "50%",
        color: "rgb(11,146,81)", cursor: "pointer", flexShrink: 0,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="rgb(11,146,81)" strokeWidth="1" fill="none"/>
        <text x="6" y="9" textAnchor="middle" fontSize="8" fontWeight="700" fill="rgb(11,146,81)" fontFamily="Georgia, serif">i</text>
      </svg>
    </button>
  );
}

export type SavingsBreakdownData = {
  cardName: string;            // displayed uppercase
  last4?: string;              // "XXXX 1234" or null
  cardImg: string;
  newCard?: boolean;           // shows "NEW CARD" badge instead of last4
  spend: string;               // pre-formatted: "₹8,00,000 / yr"
  save: string;                // pre-formatted: "₹15,000/yr"
  savingsOnSpends: number;
  milestoneBenefits: number;
  annualFee: number;
};

export function SavingsBreakdownSheet({ data, onClose }: { data: SavingsBreakdownData | null; onClose: () => void }) {
  if (!data) return null;
  const { cardName, last4, cardImg, newCard, spend, save, savingsOnSpends, milestoneBenefits, annualFee } = data;
  const total = savingsOnSpends + milestoneBenefits - annualFee;
  const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN");
  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, animation: "legacy-fade-in 0.2s ease both" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 201,
        background: "linear-gradient(360deg, #FFFFFF 87.42%, #FFFFFF 100%)",
        borderRadius: "24px 24px 0 0",
        padding: "60px 16px 24px",
        animation: "legacy-sheet-up 350ms cubic-bezier(0.32,0.72,0,1) both",
        fontFamily: "var(--legacy-sans)",
      }}>
        <div style={{
          position: "absolute", left: "50%", top: -57, transform: "translateX(-50%)",
          width: 150, height: 100, borderRadius: 7.5, overflow: "hidden",
          border: "0.625px solid rgba(255,255,255,0.2)",
          filter: "drop-shadow(0 22px 9px rgba(20,21,72,0.03)) drop-shadow(0 12px 7px rgba(20,21,72,0.1)) drop-shadow(0 5.5px 5.5px rgba(20,21,72,0.17)) drop-shadow(0 1px 2.7px rgba(20,21,72,0.2))",
        }}>
          <img src={cardImg} alt={cardName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: "140%", letterSpacing: "0.02em", textTransform: "uppercase", color: "#000" }}>{cardName}</div>
          {newCard ? (
            <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, background: "#E0F9ED", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: "#0B9251", textTransform: "uppercase" }}>NEW CARD</div>
          ) : (
            <div style={{ fontSize: 11, fontWeight: 700, lineHeight: "140%", letterSpacing: "0.04em", textTransform: "uppercase", color: "#6E7891" }}>{last4 || "Linked Card"}</div>
          )}
        </div>
        <div style={{
          padding: "16px 24px", display: "flex", alignItems: "center", gap: 16,
          background: "linear-gradient(0deg, #FBFBFE, #FBFBFE)",
          border: "1px solid #DADCEB", borderRadius: 8, marginBottom: 18,
        }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 400, lineHeight: "140%", color: "rgba(0,0,0,0.6)" }}>You spend</span>
            <span style={{ fontSize: 14, fontWeight: 700, lineHeight: "135%", letterSpacing: "-0.02em", color: "#3E4561" }}>{spend}</span>
          </div>
          <div style={{ width: 1, height: 37, background: "rgba(0,0,0,0.06)" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 400, lineHeight: "140%", color: "rgba(0,0,0,0.6)" }}>You save</span>
            <span style={{ fontSize: 14, fontWeight: 700, lineHeight: "135%", letterSpacing: "-0.02em", color: "#0B9251" }}>{save}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 14 }}>
          <span style={{ height: 1, flex: 1, background: "rgba(132,140,160,0.4)" }} />
          <span style={{ width: 4, height: 4, transform: "rotate(45deg)", background: "rgba(132,140,160,0.6)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#8A92A7", textTransform: "uppercase" }}>SAVINGS BREAKDOWN</span>
          <span style={{ width: 4, height: 4, transform: "rotate(45deg)", background: "rgba(132,140,160,0.6)" }} />
          <span style={{ height: 1, flex: 1, background: "rgba(132,140,160,0.4)" }} />
        </div>
        <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 11, fontWeight: 400, lineHeight: "155%", color: "#46505F" }}>Savings on Spends</span>
            <span style={{ fontSize: 12, fontWeight: 600, lineHeight: "140%", letterSpacing: "0.01em", color: "#46505F" }}>{fmt(savingsOnSpends)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 11, fontWeight: 400, lineHeight: "155%", color: "#46505F" }}>Milestone Benefits</span>
            <span style={{ fontSize: 12, fontWeight: 600, lineHeight: "140%", letterSpacing: "0.01em", color: "#46505F" }}>+ {fmt(milestoneBenefits)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 11, fontWeight: 400, lineHeight: "155%", color: "#46505F" }}>Annual Fee</span>
            <span style={{ fontSize: 12, fontWeight: 600, lineHeight: "140%", letterSpacing: "0.01em", color: "#46505F" }}>− {fmt(annualFee)}</span>
          </div>
          <svg width="100%" height="1" style={{ display: "block", margin: "4px 0" }}>
            <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" strokeDasharray="2 2" />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, lineHeight: "140%", letterSpacing: "0.01em", color: "#1C2A33" }}>Total Savings</span>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: "140%", letterSpacing: "0.01em", color: "#008846" }}>{fmt(total)}</span>
          </div>
        </div>
        <button onClick={onClose} className="legacy-tap" style={{
          marginTop: 22, width: "100%", height: 48.51,
          background: "linear-gradient(90deg, #222941 0%, #101C43 100%)",
          color: "#E8E8E8", fontSize: 12, fontWeight: 600, lineHeight: "150%",
          border: "none", borderRadius: 10.17, cursor: "pointer",
          boxShadow: "0.29px 0.29px 0.41px -0.49px rgba(0,0,0,0.26), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247), 1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 3.85px 3.85px 5.44px -1.96px rgba(0,0,0,0.192), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)",
        }}>Got it</button>
      </div>
    </>
  );
}

// Map a CONSIDER_HOOKS `cat` to a rounded-line icon + warm-toned stroke color.
// Muted/desaturated tones so they sit gently against the soft pastel bgs.
export const HOOK_CAT_ICON: Record<string, { Icon: any; color: string }> = {
  credit:    { Icon: CreditCard, color: "#B56A6A" }, // muted rose
  cap:       { Icon: Gauge,      color: "#B68A55" }, // muted amber
  fee:       { Icon: Receipt,    color: "#9B7A52" }, // muted bronze
  milestone: { Icon: Trophy,     color: "#A87858" }, // muted terracotta
  benefit:   { Icon: Plane,      color: "#A56B6B" }, // muted brick
  points:    { Icon: Sparkles,   color: "#B5825F" }, // muted orange
};

export const ASSET_BASE = "/legacy-assets";

/** Filenames under `public/legacy-assets/cards/` (spaces / `=` must be URL-encoded). */
export const LEGACY_CARD_AMEX_TRAVEL_PLATINUM_FILENAME = "amex-platinum-travel.png";
export const LEGACY_CARD_HDFC_INFINIA_FILENAME = "hdfc-infinia.png";

export function legacyCardAssetUrl(filename: string): string {
  return `${ASSET_BASE}/cards/${filename}`;
}

/**
 * Card frame follows asset orientation: tall images use a portrait frame,
 * wide images use a landscape frame (within the supplied max boxes).
 */
export function AdaptiveLegacyCardArt({
  src,
  alt = "",
  maxPortrait = { w: 133, h: 200 },
  maxLandscape = { w: 210, h: 132 },
  boxShadow = "0 5px 15px rgba(0,0,0,0.35)",
  style = {},
  children = null,
}) {
  const [natural, setNatural] = useState(null);

  useEffect(() => {
    setNatural(null);
  }, [src]);

  const { boxW, boxH } = useMemo(() => {
    if (!natural?.w || !natural?.h) {
      return { boxW: maxPortrait.w, boxH: maxPortrait.h };
    }
    const { w: nw, h: nh } = natural;
    const portrait = nh >= nw;
    const max = portrait ? maxPortrait : maxLandscape;
    const scale = Math.min(max.w / nw, max.h / nh);
    return { boxW: Math.max(1, Math.round(nw * scale)), boxH: Math.max(1, Math.round(nh * scale)) };
  }, [natural, maxPortrait, maxLandscape]);

  return (
    <div
      style={{
        position: "relative",
        width: boxW,
        height: boxH,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow,
        background: "linear-gradient(165deg, rgba(255,255,255,0.45), rgba(226,232,240,0.95))",
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget;
          if (naturalWidth && naturalHeight) setNatural({ w: naturalWidth, h: naturalHeight });
        }}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
      {children}
    </div>
  );
}

/**
 * Always-landscape card art: portrait images are auto-rotated -90deg.
 * `width`/`height` define the container in landscape orientation.
 */
export function HorizontalCardArt({
  src,
  alt = "",
  width = 220,
  height = 135,
  boxShadow = "0 5px 15px rgba(0,0,0,0.35)",
  style = {},
  children = null,
}) {
  const [isPortrait, setIsPortrait] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow,
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={(e) => {
          const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget;
          if (nh > nw * 1.15) setIsPortrait(true);
        }}
        style={
          isPortrait
            ? { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-90deg)", width: height, height: width, objectFit: "cover", display: "block" }
            : { width: "100%", height: "100%", objectFit: "cover", display: "block" }
        }
      />
      {children}
    </div>
  );
}

export const ChevronRight = ({ size = 10, color = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 10 14" fill="none">
    <path d="M1 1l6 6-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronDown = ({ size = 10, color = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size * 1.3} height={size} viewBox="0 0 13 10" fill="none">
    <path d="M1 2.5l5.5 5L12 2.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FlagIcon = ({ size = 16, color = "#8a94a8" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 2v12M3 3h9l-2 2.5L12 8H3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MerchantLogo = ({ brand }) => {
  const imgMap = {
    flipkart: "/brands/flipkart.png",
    amazon: "/brands/amazon.png",
    swiggy: "/brands/swiggy.png",
    zomato: "/brands/zomato.png",
    bigbasket: "/brands/bb.png",
    myntra: "/brands/myntra.png",
    adidas: "/brands/adiddas.png",
    muscleblaze: "/brands/muscle-blaze.png",
  };
  const letterMap = {
    makemytrip: { letter: "MT", color: "#2196F3", bg: "#E3F2FD" },
    uber: { letter: "U", color: "#000", bg: "#F0F0F0" },
    ola: { letter: "O", color: "#1C8E36", bg: "#E8F5E9" },
    shell: { letter: "S", color: "#DD1D21", bg: "#FFF3E0" },
    cleartrip: { letter: "C", color: "#E74C3C", bg: "#FFEBEE" },
    nykaa: { letter: "N", color: "#FC2779", bg: "#FFF0F6" },
  };
  if (brand === "unaccounted") {
    return (
      <div style={{ width: 38, height: 39, borderRadius: 4, border: "1px solid #EDEDED", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="#9CA3AF" strokeWidth="1.5"/><path d="M9.5 9.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 1.1-.7 1.7-1.4 2.1-.4.2-.6.4-.7.6-.1.2-.15.45-.15.8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="16.5" r="0.75" fill="#9CA3AF"/></svg>
      </div>
    );
  }
  const img = imgMap[brand];
  if (img) {
    return (
      <div style={{ width: 38, height: 39, borderRadius: 4, border: "1px solid #EDEDED", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        <img src={img} alt={brand} style={{ width: 36, height: 31, objectFit: "contain" }} />
      </div>
    );
  }
  const m = letterMap[brand] || { letter: (brand || "?").charAt(0).toUpperCase(), color: "#8a94a8", bg: "#F0F2F6" };
  return (
    <div style={{ width: 38, height: 39, borderRadius: 4, border: "1px solid #EDEDED", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", color: m.color, fontWeight: 800, fontSize: 13, letterSpacing: "-0.02em", flexShrink: 0 }}>
      {m.letter}
    </div>
  );
};

const CalculatorIllustration = () => (
  <div style={{ position: "relative", width: 56, height: 56 }}>
    <div style={{ position: "absolute", left: 4, top: 6, width: 48, height: 46, borderRadius: 10, background: "linear-gradient(160deg, #FFD166 0%, #F4A93B 100%)", boxShadow: "0 6px 10px rgba(244,169,59,0.35), inset 0 -3px 0 rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)" }} />
    <div style={{ position: "absolute", left: 8, top: 10, width: 40, height: 12, borderRadius: 3, background: "linear-gradient(180deg, #FFFCE5 0%, #FFE67A 100%)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }} />
    {[0, 1, 2, 3].map((r) =>
      [0, 1, 2].map((c) => (
        <div key={`${r}-${c}`} style={{ position: "absolute", left: 9 + c * 12, top: 25 + r * 6, width: 9, height: 4.5, borderRadius: 1.5, background: r === 3 && c === 2 ? "#E45C25" : "#fff", boxShadow: "0 0.5px 1px rgba(0,0,0,0.15)" }} />
      )),
    )}
  </div>
);

const WalletIllustration = () => (
  <div style={{ position: "relative", width: 56, height: 56 }}>
    <div style={{ position: "absolute", left: 4, top: 16, width: 48, height: 32, borderRadius: 8, background: "linear-gradient(155deg, #3DD28B 0%, #1A9562 100%)", boxShadow: "0 7px 12px rgba(26,149,98,0.35), inset 0 -2px 0 rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)" }} />
    <div style={{ position: "absolute", left: 18, top: 6, width: 26, height: 18, borderRadius: 4, background: "linear-gradient(180deg, #5DE1A3 0%, #2EB87A 100%)", transform: "rotate(-10deg)", boxShadow: "0 3px 6px rgba(0,0,0,0.18)" }} />
    <div style={{ position: "absolute", left: 28, top: 8, width: 26, height: 18, borderRadius: 4, background: "linear-gradient(180deg, #FFD166 0%, #F4A93B 100%)", transform: "rotate(6deg)", boxShadow: "0 3px 6px rgba(0,0,0,0.18)" }} />
  </div>
);

const GiftIllustration = () => (
  <div style={{ position: "relative", width: 56, height: 56 }}>
    <div style={{ position: "absolute", left: 8, top: 4, color: "#F59FD6", fontSize: 10 }}>✦</div>
    <div style={{ position: "absolute", left: 44, top: 14, color: "#C98BFF", fontSize: 8 }}>✦</div>
    <div style={{ position: "absolute", left: 8, top: 22, width: 40, height: 28, borderRadius: 4, background: "linear-gradient(155deg, #B87BFF 0%, #7A3DD9 100%)", boxShadow: "0 6px 10px rgba(122,61,217,0.35), inset 0 -2px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)" }} />
    <div style={{ position: "absolute", left: 25, top: 22, width: 6, height: 28, background: "linear-gradient(180deg, #F59FD6 0%, #C85CAA 100%)" }} />
    <div style={{ position: "absolute", left: 5, top: 18, width: 46, height: 10, borderRadius: 4, background: "linear-gradient(180deg, #E9B4FF 0%, #A266E8 100%)", transform: "rotate(-8deg)", boxShadow: "0 3px 6px rgba(0,0,0,0.2)" }} />
  </div>
);

export function LegacySectionHeader({ label, action = "View All", onAction = undefined, serif = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 20px", marginBottom: 20 }}>
      {serif ? (
        <h2 className="legacy-serif" style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "rgba(54,64,96,0.92)" }}>
          {label}
        </h2>
      ) : (
        <span className="legacy-overline">{label}</span>
      )}
      {action && (
        <div className="legacy-tap" style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 11, fontWeight: 700, color: "rgb(47,55,75)" }} onClick={onAction}>
          {action} <ChevronRight size={8} color="rgb(47,55,75)" strokeWidth={1.6} />
        </div>
      )}
    </div>
  );
}

export function TimeFilter({ label, options, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const interactive = Array.isArray(options) && typeof onSelect === "function";
  return (
    <div style={{ position: "relative" }}>
      <div
        className="legacy-tap"
        onClick={() => { if (interactive) setOpen(o => !o); }}
        style={{ height: 31, borderRadius: 6, background: "rgb(244,248,255)", boxShadow: "10px 10px 21px -3.75px rgba(0,0,0,0.055), 2.6px 2.6px 3.8px -2.25px rgba(0,0,0,0.23), 1.2px 1.2px 1.7px -1.5px rgba(0,0,0,0.247), inset -1px -1px 0 0 rgba(0,0,0,0.1), inset 1px 1px 1px 0 rgba(255,255,255,1)", padding: "0 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 700, color: "rgb(34,41,65)" }}
      >
        {label}
        <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms ease" }}>
          <ChevronDown size={6} color="rgb(34,41,65)" />
        </span>
      </div>
      {interactive && open && (
        <>
          {/* click-away */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 20,
            minWidth: 132,
            background: "#FFFFFF",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 8px 24px rgba(15,28,67,0.14), 0 2px 6px rgba(15,28,67,0.08)",
            padding: 4,
            overflow: "hidden",
          }}>
            {options.map((d) => {
              const isSel = d === value;
              return (
                <div
                  key={d}
                  className="legacy-tap"
                  onClick={() => { onSelect(d); setOpen(false); }}
                  style={{
                    padding: "8px 10px",
                    fontSize: 11,
                    fontWeight: isSel ? 700 : 500,
                    color: isSel ? "rgb(34,41,65)" : "rgba(74,83,112,0.85)",
                    background: isSel ? "rgb(244,248,255)" : "transparent",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span>Last {d} Days</span>
                  {isSel && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5.2l2.4 2.4L8.5 2.6" stroke="rgb(34,41,65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ActionCard({ brand, mark, headline, onClick, bgOverride, width, Icon, iconColor }: any) {
  const brands = {
    axis: { bg: "linear-gradient(135deg, #ffd9d9 0%, #ffc7b3 100%)", ring: "#E52124" },
    hsbcR: { bg: "linear-gradient(135deg, #c4e2fb 0%, #9fc4ee 100%)", ring: "#DB0011" },
    hsbcB: { bg: "linear-gradient(135deg, #c8ccf5 0%, #a9b2e8 100%)", ring: "#1B4F9C" },
    idfc: { bg: "linear-gradient(135deg, #ffe1c8 0%, #fcc7a0 100%)", ring: "#7B1E1E" },
  };
  const b = brands[brand] || brands.axis;
  const ringColor = iconColor || b.ring;
  return (
    <div className="legacy-tap" onClick={onClick} style={{ width: width || 250, minHeight: 72, borderRadius: 12, padding: "12px 12px", background: bgOverride || b.bg, border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 1px 3px rgba(9,84,171,0.10)", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: ringColor, fontWeight: 700, fontSize: 13, boxShadow: `inset 0 0 0 1.5px ${ringColor}20`, flexShrink: 0 }}>
        {Icon ? <Icon size={17} strokeWidth={1.5} color={ringColor}/> : mark}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6, color: "rgba(36,45,74,0.9)" }}>{headline}</div>
      </div>
    </div>
  );
}

// Map a CONSIDER_HOOKS cardBrand → ActionCard visual brand + first-letter mark.
const HOOK_BRAND_MAP: Record<string, { brand: string; mark: string }> = {
  axis:  { brand: "axis",  mark: "A" },
  hsbc:  { brand: "hsbcR", mark: "H" },
  idfc:  { brand: "idfc",  mark: "I" },
  hdfc:  { brand: "axis",  mark: "H" },
  amex:  { brand: "axis",  mark: "A" },
};

// Very low-saturation warm palette. Closer to neutral cream/pearl with the
// faintest hue tint so the icon and text breathe without high contrast.
const HUE_SCHEMES: string[] = [
  "linear-gradient(135deg, #fcf2f2 0%, #f7e9e9 100%)", // hint rose
  "linear-gradient(135deg, #fdf1ea 0%, #f8e6db 100%)", // hint peach
  "linear-gradient(135deg, #fdf6e4 0%, #f8eed5 100%)", // hint butter
  "linear-gradient(135deg, #fdf0f5 0%, #f8e5ee 100%)", // hint pink
  "linear-gradient(135deg, #fdf2e8 0%, #f9e6d4 100%)", // hint apricot
  "linear-gradient(135deg, #fdf6da 0%, #f8edc1 100%)", // hint cream
  "linear-gradient(135deg, #fbeee2 0%, #f6e1cd 100%)", // hint terracotta
  "linear-gradient(135deg, #fcecea 0%, #f7e0db 100%)", // hint coral
  "linear-gradient(135deg, #fbeede 0%, #f5e2c8 100%)", // hint amber
  "linear-gradient(135deg, #fbe8df 0%, #f7dccd 100%)", // hint salmon
];

// Approximate width needed so the headline wraps to ≤ 2 lines.
// Char-budget grows with card width given 12px / 700 font + ~190px text column @ 250px card.
function widthForHeadline(text: string): number {
  const len = (text || "").length;
  if (len <= 44) return 250;
  if (len <= 56) return 300;
  return 340;
}

export function ImportantActions({ hooks, onViewAll, onAction }) {
  // Fall back to the original hardcoded set if no hooks are supplied (keeps old usages working).
  if (!Array.isArray(hooks) || hooks.length === 0) {
    return (
      <div style={{ paddingTop: 28, paddingBottom: 8 }}>
        <LegacySectionHeader label="Important Actions" onAction={onViewAll} />
        <div className="legacy-h-rail" style={{ margin: "0 0 0 16px" }}>
          <ActionCard brand="axis" mark="A" headline={<>Credit Limit Reached. Repay outstanding to keep using Axis Flipkart card</>} onClick={() => onAction?.(0)} />
          <ActionCard brand="hsbcR" mark="H" headline={<>Dining rewards maxed out on HSBC Travel One. Switch to Axis Flipkart</>} onClick={() => onAction?.(1)} />
          <ActionCard brand="hsbcB" mark="H" headline={<>5,000 points expiring on HSBC Travel One. Redeem now</>} onClick={() => onAction?.(2)} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ paddingTop: 28, paddingBottom: 8 }}>
      <LegacySectionHeader label="Important Actions" onAction={onViewAll} />
      <div className="legacy-h-rail" style={{ margin: "0 0 0 16px" }}>
        {hooks.map((h, i) => {
          const map = HOOK_BRAND_MAP[h.cardBrand] || { brand: "axis", mark: (h.cardName || "?").charAt(0).toUpperCase() };
          const bg = HUE_SCHEMES[i % HUE_SCHEMES.length];
          const w = widthForHeadline(h.title || "");
          const catIcon = HOOK_CAT_ICON[h.cat];
          return (
            <ActionCard
              key={h.id || i}
              brand={map.brand}
              mark={map.mark}
              headline={<>{h.title}</>}
              onClick={() => onAction?.(i)}
              bgOverride={bg}
              width={w}
              Icon={catIcon?.Icon}
              iconColor={catIcon?.color}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ToolsSection({ onOpenCalc, onOpenBestCards, onOpenRedeem }) {
  // Per Figma: 100×107 tile, label at top, large 3D icon overlapping a soft
  // colored ellipse at the bottom-right. Each tile has its own warm-but-soft hue.
  const Tile = ({ img, label, onClick, bg, ellipse }) => (
    <div
      className="legacy-tap"
      onClick={onClick}
      style={{
        flex: 1,
        height: 107,
        background: bg,
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 1px 3px rgba(9,84,171,0.10)",
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ellipse */}
      <div style={{
        position: "absolute",
        width: 98, height: 98,
        right: -20, bottom: -28,
        borderRadius: "50%",
        background: ellipse,
        pointerEvents: "none",
      }}/>
      {/* Label at top */}
      <div style={{
        position: "absolute", top: 10, left: 10, right: 10,
        fontFamily: "'Google Sans', system-ui, sans-serif",
        fontSize: 11, fontWeight: 500, lineHeight: "16px",
        letterSpacing: "0.02em", color: "#000000",
        whiteSpace: "pre-line",
      }}>{label}</div>
      {/* 3D icon — anchored bottom-right, overlapping the ellipse */}
      <img
        src={img}
        alt=""
        style={{
          position: "absolute",
          width: 82, height: 82,
          right: -4, bottom: -4,
          objectFit: "contain",
          pointerEvents: "none",
        }}
      />
    </div>
  );
  return (
    <div style={{ padding: "28px 0 8px" }}>
      <LegacySectionHeader label="Tools to help you" action={null} />
      <div style={{ padding: "0 16px", display: "flex", gap: 13, marginTop: 2 }}>
        <Tile img="/cdn/tool-savings.webp"     label={"Savings\nFinder"} onClick={onOpenCalc} bg="#D6ECFF" ellipse="#B8DCFF" />
        <Tile img="/cdn/tool-best-cards.webp"  label={"Best Cards\nfor you"} onClick={onOpenBestCards} bg="#FFDBEE" ellipse="rgba(255,195,224,0.7)" />
        <Tile img="/cdn/tool-redeem.webp"      label={"Redeem\nReward Points"} onClick={onOpenRedeem} bg="#FFEBB3" ellipse="rgba(252,217,140,0.7)" />
      </div>
    </div>
  );
}

export function TransactionAnalysis({ timeWindow = "Last 365 Days" }) {
  const [days, setDays] = useState(365);
  const factor = days / 365;
  const fmt = (n) => "₹" + n.toLocaleString("en-IN");
  const fmtYr = (n) => "₹" + n.toLocaleString("en-IN") + " /yr";
  const currentSavings = Math.round(SAVINGS_BARS.bar1 * factor);
  const idealSavings = Math.round(SAVINGS_BARS.bar2 * factor);
  const ultimateSavings = Math.round(SAVINGS_BARS.bar3 * factor);
  const maxVal = Math.max(ultimateSavings, idealSavings, currentSavings, 1);
  const maxBarH = 160;
  const orangeH = Math.max(12, Math.round((currentSavings / maxVal) * maxBarH));
  const greenH = Math.max(20, Math.round((idealSavings / maxVal) * maxBarH));
  const blueH = Math.max(28, Math.round((ultimateSavings / maxVal) * maxBarH));
  const chartH = 240;
  const barW = 72;
  const gap = 16;
  const totalW = barW * 3 + gap * 2;
  const startX = (368 - totalW) / 2;
  const labelStyle = { fontFamily: "'Google Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 500, lineHeight: "137%", letterSpacing: "-0.01em", color: "rgba(54,64,96,0.85)", textAlign: "center" as const };
  const valStyle = { fontFamily: "'Google Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 600, lineHeight: "150%", letterSpacing: "-0.01em", textAlign: "center" as const };
  const barBase = { boxSizing: "border-box" as const, borderRadius: "8px 8px 0 0", transformOrigin: "bottom" as const, transition: "height 280ms ease-out", animation: "legacy-growY 600ms ease-out backwards", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4)" };
  const oTop = chartH - orangeH - 46;
  const gTop = chartH - greenH - 46;
  const bTop = chartH - blueH - 46;
  return (
    <div style={{ padding: "32px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 20px", marginBottom: 22 }}>
        <h2 className="legacy-serif" style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "rgba(54,64,96,0.92)" }}>
          Transaction Analysis
        </h2>
        <TimeFilter label={`Last ${days} Days`} options={TIME_WINDOW_OPTIONS} value={days} onSelect={setDays} />
      </div>
      <div style={{ position: "relative", margin: "0 16px", height: chartH, background: "linear-gradient(0deg, #DBFCE5 0%, #F5F9FA 54.79%)", border: "1px solid rgba(54,64,96,0.08)", boxShadow: "0 2px 10px rgba(63,66,70,0.05)", borderRadius: 12, overflow: "hidden" }}>
        {/* Orange — Current savings */}
        <div style={{ position: "absolute", left: startX, top: oTop, width: barW, ...valStyle, color: "#EB8807" }}>{fmt(currentSavings)}</div>
        <div style={{ position: "absolute", left: startX, top: oTop + 20, width: barW, ...labelStyle }}>Current savings</div>
        <div style={{ position: "absolute", left: startX, width: barW, bottom: 0, height: orangeH, background: "linear-gradient(180deg, #EB8807 0%, #FCAA3F 100%)", border: "1px solid #F8A130", ...barBase }} />

        {/* Green — If cards used right */}
        <div style={{ position: "absolute", left: startX + barW + gap, top: gTop, width: barW, ...valStyle, color: "#078146" }}>{fmt(idealSavings)}</div>
        <div style={{ position: "absolute", left: startX + barW + gap, top: gTop + 20, width: barW, ...labelStyle }}>If cards used right</div>
        <div style={{ position: "absolute", left: startX + barW + gap, width: barW, bottom: 0, height: greenH, background: "linear-gradient(180deg, #117E47 0%, #0AA759 100%)", border: "1px solid #22AB66", ...barBase }} />

        {/* Blue — With ultimate card */}
        <div style={{ position: "absolute", left: startX + (barW + gap) * 2, top: bTop, width: barW, ...valStyle, color: "#1D6AE5" }}>{fmtYr(ultimateSavings)}</div>
        <div style={{ position: "absolute", left: startX + (barW + gap) * 2, top: bTop + 20, width: barW + 16, marginLeft: -8, ...labelStyle }}>With ultimate card</div>
        <div style={{ position: "absolute", left: startX + (barW + gap) * 2, width: barW, bottom: 0, height: blueH, background: "linear-gradient(180deg, #1D6AE5 0%, #5B9CF5 100%)", border: "1px solid #4B8DE8", ...barBase, borderRadius: "10px 10px 0 0" }} />
      </div>
    </div>
  );
}

export function CardPromo({ onClick }) {
  return (
    <div className="legacy-tap" onClick={onClick} style={{ margin: "28px 20px 0", borderRadius: 12, overflow: "hidden", boxShadow: "0 0.6px 4.4px rgba(63,66,70,0.11)" }}>
      <img src={`${ASSET_BASE}/amex-promo-banner.png`} alt="Getting an Amex Travel Platinum Card can help you save up to ₹1,00,845 /year" style={{ display: "block", width: "100%", height: "auto" }} />
    </div>
  );
}

const legacyCategoryData = [];
const legacyBrandData = [];

// Unified category icon helper — points to the new /cdn/categories/<Name>.webp set.
// All 12 canonical categories supported (incl. Friends and Family for spend-analysis).
const pctOfTotal = (amount: number) => Math.round((amount / Math.max(1, TOTAL_ACC)) * 100);
const categoryData = SPEND_CATS.map((c: any) => ({ name: c.name, pct: pctOfTotal(c.amt || 0), amount: "₹" + f(c.amt || 0) }));
const brandData = SPEND_BRANDS.map((c: any) => ({ name: c.name, pct: pctOfTotal(c.amt || 0), amount: "₹" + f(c.amt || 0) }));

export const CAT_IMG = (name: string): string =>
  `/cdn/categories/${name}.webp`;

const CATEGORY_IMG: Record<string, string> = {
  "Shopping":           CAT_IMG("Shopping"),
  "Groceries":          CAT_IMG("Groceries"),
  "Dining Out":         CAT_IMG("Dining Out"),
  "Dining":             CAT_IMG("Dining Out"),
  "Food Ordering":      CAT_IMG("Food Ordering"),
  "Bills":              CAT_IMG("Bills"),
  "Fuel":               CAT_IMG("Fuel"),
  "Flights":            CAT_IMG("Flights"),
  "Travel":             CAT_IMG("Flights"),
  "Hotels":             CAT_IMG("Hotels"),
  "Entertainment":      CAT_IMG("Entertainment"),
  "Rent":               CAT_IMG("Rent"),
  "Insurance":          CAT_IMG("Insurance"),
  "Friends and Family": CAT_IMG("Friends and Family"),
  "Cab Rides":          CAT_IMG("Shopping"),
  "Education":          CAT_IMG("Bills"),
};

function CategoryIcon({ kind }) {
  const img = CATEGORY_IMG[kind];
  return (
    <div style={{
      width: 32,
      height: 33,
      borderRadius: 4,
      background: "#FFFFFF",
      border: "0.9px solid #EDEDED",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
      position: "relative",
    }}>
      {img && (
        <img
          src={img}
          alt=""
          style={{
            position: "absolute",
            inset: 1,
            width: "calc(100% - 2px)",
            height: "calc(100% - 2px)",
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

const TIME_WINDOW_OPTIONS = [30, 60, 90, 120, 240, 365];
const SPEND_TOTAL_365 = TOTAL_ACC;

export function SpendAnalysis({ timeWindow = "Last 365 Days", initialTab = "Categories" }) {
  const [tab, setTab] = useState(initialTab);
  const [days, setDays] = useState(365);
  const factor = days / 365;
  const total = Math.round(SPEND_TOTAL_365 * factor);
  const fmt = (n) => "₹" + n.toLocaleString("en-IN");
  const baseData = tab === "Categories" ? categoryData : brandData;
  const data = baseData.map((c) => {
    const baseAmt = parseInt(c.amount.replace(/[^\d]/g, ""), 10) || 0;
    return { ...c, amount: fmt(Math.round(baseAmt * factor)) };
  });
  return (
    <div style={{ padding: "32px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 20px", marginBottom: 22 }}>
        <h2 className="legacy-serif" style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "rgba(54,64,96,0.92)" }}>
          Spend Analysis
        </h2>
        <TimeFilter
          label={`Last ${days} Days`}
          options={TIME_WINDOW_OPTIONS}
          value={days}
          onSelect={setDays}
        />
      </div>
      <div style={{
        margin: "0 16px 22px",
        height: 99,
        padding: "22px 40px",
        boxSizing: "border-box",
        borderRadius: 8,
        background: "linear-gradient(180deg, rgba(220,234,255,0.30) 0%, rgba(151,193,255,0.22) 100%)",
        boxShadow: "inset 0 -2px 1px rgba(151,193,255,0.20)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <div style={{ fontFamily: "'Outfit','Google Sans',system-ui,sans-serif", fontSize: 24, fontWeight: 800, lineHeight: "30px", color: "#1C2A33", textAlign: "center" }}>{fmt(total)}</div>
        <div style={{ fontFamily: "'Google Sans',system-ui,sans-serif", fontSize: 10, fontWeight: 600, lineHeight: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B6478", textAlign: "center" }}>Total Accounted Spends</div>
      </div>
      <div style={{ margin: "0 20px", padding: 2, height: 37, borderRadius: 8, background: "rgba(6,60,109,0.04)", boxShadow: "0 1px 0 rgba(255,255,255,0.25), inset 0 1px 2px rgba(6,60,109,0.12)", display: "flex" }}>
        {["Categories", "Brands"].map((opt) => {
          const isActive = opt === tab;
          return (
            <div key={opt} className="legacy-tap" onClick={() => setTab(opt)} style={{ flex: 1, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? "rgb(244,248,255)" : "transparent", boxShadow: isActive ? "10px 10px 21px -3.75px rgba(0,0,0,0.055), 2.6px 2.6px 3.8px -2.25px rgba(0,0,0,0.23), 1.2px 1.2px 1.7px -1.5px rgba(0,0,0,0.247), inset -1px -1px 0 0 rgba(0,0,0,0.1), inset 1px 1px 1px 0 rgba(255,255,255,1)" : "none", fontSize: 12, fontWeight: isActive ? 600 : 500, color: isActive ? "rgba(74,83,112,0.95)" : "rgba(74,83,112,0.7)", letterSpacing: "-0.01em" }}>
              {opt}
            </div>
          );
        })}
      </div>
      {/* Categories card — Figma Frame 1991634918:
          328 wide, padding 16/12, gap 20 between rows, radius 8, soft shadow.
          Each row: 32.15-tall icon+label+amount (gap 12) + 8-gap to 10-tall bar.
          Bar bg: rgba(123,142,178,0.1) with inset shadow + 0.788916 highlight.
          Bar fill: linear-gradient(180deg #117E47 → #0AA759), 1px #22AB66 border,
          inset 0 2px 0 rgba(255,255,255,0.4) shine, radius 0 2 2 0 (right cap). */}
      <div style={{ margin: "22px 16px 0", padding: "16px 12px", background: "#FFFFFF", borderRadius: 8, boxShadow: "0px 0.621951px 4.35366px rgba(63, 66, 70, 0.11)", display: "flex", flexDirection: "column", gap: 20 }}>
        {data.map((c) => {
          // Bar width: proportional to pct, scaled so the dominant category
          // (Shopping ~44–48%) fills roughly half the 304-wide bar — matches Figma's
          // 48% → 155px ratio. Smaller bars stay legibly visible at lower percentages.
          const barWidthPx = Math.max(3, Math.round(c.pct * 3.23));
          return (
            <div key={c.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Top row: icon + label + amount */}
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                {tab === "Categories" ? <CategoryIcon kind={c.name} /> : <MerchantLogo brand={c.name.toLowerCase()} />}
                <div style={{ flex: 1, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 12, lineHeight: "150%", color: "#364060" }}>
                  {c.name} — {c.pct}%
                </div>
                <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 12, lineHeight: "150%", color: "#364060", textAlign: "right" }}>{c.amount}</div>
              </div>
              {/* Progress bar */}
              <div style={{
                position: "relative",
                width: "100%",
                height: 10,
                background: "rgba(123, 142, 178, 0.1)",
                boxShadow: "0px 0.788916px 0px rgba(255, 255, 255, 0.19), inset 0.788916px 0.788916px 1.57783px rgba(0, 0, 0, 0.11)",
                borderRadius: 3.15566,
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute",
                  left: 0, top: 0,
                  height: "100%",
                  width: barWidthPx,
                  background: "linear-gradient(180deg, #117E47 0%, #0AA759 100%)",
                  border: "1px solid #22AB66",
                  boxShadow: "inset 0px 2px 0px rgba(255, 255, 255, 0.4)",
                  borderRadius: "0px 2px 2px 0px",
                  boxSizing: "border-box",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildLegacyTransactions(n = 100) {
  const merchants = [{ brand: "flipkart", merchant: "Flipkart" }, { brand: "swiggy", merchant: "Swiggy" }, { brand: "zomato", merchant: "Zomato" }, { brand: "bigbasket", merchant: "BigBasket" }, { brand: "amazon", merchant: "Amazon" }];
  const cards = ["Axis Flipkart", "HSBC Live+", "HSBC Travel One", "IDFC First Select", "via UPI"];
  const ctaPool = [{ variant: "best", text: "Used best card for this" }, { variant: "switch", text: "Use Axis Flipkart and save ₹15" }, { variant: "newcard", text: "Get IDFC First Select & earn ₹24" }, { variant: "switch", text: "Use HSBC Live+ and save ₹22" }, { variant: "best", text: "Used best card for this" }];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const rand = mulberry32(42);
  const out = [];
  let day = 27;
  let monthIdx = 0;
  for (let i = 0; i < n; i++) {
    const m = merchants[Math.floor(rand() * merchants.length)];
    const card = cards[Math.floor(rand() * cards.length)];
    const amt = Math.round((100 + rand() * 4900) / 10) * 10;
    const savedAmt = rand() < 0.55 ? Math.round(rand() * 80) : 0;
    const cta = ctaPool[Math.floor(rand() * ctaPool.length)];
    out.push({
      id: i,
      brand: m.brand,
      merchant: m.merchant,
      cardLine: `${card}  |  ${day} ${months[monthIdx]}`,
      card,
      amount: `₹${amt.toLocaleString("en-IN")}`,
      saved: savedAmt ? `₹${savedAmt}` : null,
      savedColor: savedAmt ? "#078146" : "#eb8807",
      cta,
    });
    if (i % 2 === 1) {
      day -= 1;
      if (day <= 0) {
        day = 28;
        monthIdx = (monthIdx + 1) % 12;
      }
    }
  }
  return out;
}

const actionPillStyle = {
  padding: "7px 12px",
  borderRadius: 6,
  border: "1px solid rgba(23, 51, 144, 0.06)",
  background: "linear-gradient(90deg, #FAFCFF 0%, #FFF 100%)",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(74,83,112,0.95)",
  letterSpacing: "-0.01em",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const SortIcon = ({ color = "rgba(74,83,112,0.95)" }) => (
  <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
    <path d="M3 1v9m0 0L1 8m2 2l2-2M7 10V1m0 0L5 3m2-2l2 2" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FilterIcon = ({ color = "rgba(74,83,112,0.95)" }) => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M1.5 2.5h8m-6 3h4m-3 3h2" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="7" cy="2.5" r="1.1" fill="#fff" stroke={color} strokeWidth="1.1" />
    <circle cx="4" cy="5.5" r="1.1" fill="#fff" stroke={color} strokeWidth="1.1" />
    <circle cx="6" cy="8.5" r="1.1" fill="#fff" stroke={color} strokeWidth="1.1" />
  </svg>
);

const QIcon = ({ color = "rgba(74,83,112,0.7)" }) => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <circle cx="5.5" cy="5.5" r="4.6" stroke={color} strokeWidth="1" />
    <path d="M4.2 4.3c.15-.9 1-1.3 1.7-1.1.65.2 1.1.8.9 1.5-.2.6-1 .7-1.2 1.2v.4" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
    <circle cx="5.5" cy="7.8" r="0.5" fill={color} />
  </svg>
);

export function ActionBar({ sort, onSortClick, filter, onFilterClick, chips, activeChip, onChipClick }) {
  return (
    <div className="legacy-h-rail" style={{ padding: "0 20px 0 0", gap: 8, margin: "14px 0 14px 16px", overflowX: "auto", flexWrap: "nowrap" }}>
      <div className="legacy-tap" style={actionPillStyle} onClick={onSortClick}>
        <SortIcon /> <span>{sort}</span>
        <ChevronDown size={8} color="rgba(74,83,112,0.7)" strokeWidth={1.8} />
      </div>
      <div className="legacy-tap" style={actionPillStyle} onClick={onFilterClick}>
        <FilterIcon /> <span>{filter}</span>
      </div>
      <div style={{ width: 1, height: 16, alignSelf: "center", flexShrink: 0, background: "rgba(128,131,135,0.4)" }} />
      {chips.map((chip) => {
        const isActive = chip === activeChip;
        const isUnaccActive = isActive && chip === "Unaccounted";
        return (
          <div key={chip} className="legacy-tap" onClick={() => onChipClick(chip)} style={{ ...actionPillStyle, color: isActive ? "rgb(47,55,75)" : "rgba(74,83,112,0.85)", fontWeight: isActive ? 700 : 500, borderColor: isUnaccActive ? "#173390" : isActive ? "rgba(23,51,144,0.18)" : "rgba(23, 51, 144, 0.06)", ...(isUnaccActive ? { background: "rgba(243,246,255,0.5)", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", padding: "6px 12px" } : {}) }}>
            {chip === "Unaccounted" && <QIcon color={isUnaccActive ? "#173390" : "rgba(74,83,112,0.8)"} />}
            <span>{chip}</span>
            {isUnaccActive && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="#173390" strokeWidth="1.6" strokeLinecap="round"/></svg>}
          </div>
        );
      })}
    </div>
  );
}

const DashedDivider = () => (
  <svg width="100%" height="1" style={{ display: "block", margin: "14px 0" }}>
    <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#D1E3F6" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

const ctaVariants = {
  best: { bg: "#EAFBF3", color: "#078146", prefix: null },
  switch: { bg: "#F9F9E0", color: "#CF7908", prefix: null },
  newcard: { bg: "linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)", color: "#0862CF", prefix: "sparkle" },
  needsdata: { bg: "#EDEDED", color: "#7a8296", prefix: null, chevron: true },
};

function InlineCTA({ variant, text }) {
  const v = ctaVariants[variant];
  if (!v || !text) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: v.prefix === "sparkle" ? 5 : 10, background: v.bg, color: v.color, borderRadius: 4, padding: "6px 10px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "120%" }}>
      {v.prefix === "sparkle" && <svg width="10" height="10" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}><path d="M4 0C4 2.2 5.8 4 8 4C5.8 4 4 5.8 4 8C4 5.8 2.2 4 0 4C2.2 4 4 2.2 4 0Z" fill="#0862CF" style={{}}/></svg>}
      <span>{text}</span>
      {v.chevron && <ChevronRight size={8} color={v.color} strokeWidth={2} />}
    </div>
  );
}

function ctaFromScenario(scenario) {
  if (!scenario || scenario.id === "S6") return null;
  const pill = SCENARIO_PILL[scenario.id];
  const text = tagText(scenario);
  if (!text) return null;
  return {
    variant: pill?.variant || "switch",
    text,
    bg: pill?.bg,
    color: pill?.color,
  };
}

function InlineScenarioCTA({ cta }) {
  if (!cta?.text) return null;
  if (!cta.bg || !cta.color) return <InlineCTA variant={cta.variant} text={cta.text} />;
  const showSparkle = cta.variant === "newcard";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: showSparkle ? 5 : 10, background: cta.bg, color: cta.color, borderRadius: 4, padding: "6px 10px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "120%" }}>
      {showSparkle && <svg width="10" height="10" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}><path d="M4 0C4 2.2 5.8 4 8 4C5.8 4 4 5.8 4 8C4 5.8 2.2 4 0 4C2.2 4 4 2.2 4 0Z" fill={cta.color} /></svg>}
      <span>{cta.text}</span>
    </div>
  );
}

export function TransactionRow({ brand, merchant, cardLine, amount, saved, savedColor, cta, scenario, hideRewards = false, onClick }) {
  const scenarioSaved = scenario ? `₹${Math.round(scenario.actualSavings || 0).toLocaleString("en-IN")}` : saved;
  const effectiveSaved = hideRewards ? null : scenarioSaved;
  const effectiveSavedColor = scenario ? SCENARIO_SAVED_COLOR[scenario.id] : savedColor;
  const effectiveCta = hideRewards ? null : ctaFromScenario(scenario) || cta;
  saved = effectiveSaved;
  savedColor = effectiveSavedColor;
  cta = effectiveCta;
  return (
    <div className="legacy-tap" onClick={onClick} style={{ background: "#fff", borderRadius: 8, boxShadow: "0px 0.62px 4.35px rgba(63,66,70,0.11)", padding: "12px 12px 14px 12px" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <MerchantLogo brand={brand} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#242d4a", letterSpacing: "-0.01em" }}>{merchant}</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: "#808387", lineHeight: "140%", marginTop: 4 }}>{cardLine}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#242d4a" }}>{amount}</div>
          {saved && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "120%", color: saved === "₹0" ? "#B56D3C" : savedColor, marginTop: 6 }}>Saved {saved}</div>}
        </div>
        <ChevronRight size={6} color="#6b7489" strokeWidth={2} />
      </div>
      {cta && <DashedDivider />}
      <InlineScenarioCTA cta={cta} />
    </div>
  );
}

export function UnaccountedRow({ onClick }) {
  return (
    <div className="legacy-tap" onClick={onClick} style={{ background: "#fff", borderRadius: 8, boxShadow: "0px 0.62px 4.35px rgba(63,66,70,0.11)", padding: "12px 12px 14px 12px" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 38, height: 39, borderRadius: 4, border: "1px solid #EDEDED", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="#9CA3AF" strokeWidth="1.5"/><path d="M9.5 9.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 1.1-.7 1.7-1.4 2.1-.4.2-.6.4-.7.6-.1.2-.15.45-.15.8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="16.5" r="0.75" fill="#9CA3AF"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#242d4a", letterSpacing: "-0.01em" }}>Unaccounted · ₹3,000</div>
          <div style={{ fontSize: 12, color: "rgba(74,83,112,0.7)", marginTop: 6 }}>via UPI</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "rgba(74,83,112,0.7)" }}>27 Jan</div>
        </div>
        <ChevronRight size={6} color="#6b7489" strokeWidth={2} />
      </div>
      <DashedDivider />
      <InlineCTA variant="needsdata" text="Need more details about this transaction" />
    </div>
  );
}

export function TransactionsPreview({ transactions, onOpenTransactions, onSortClick, onFilterClick, onChipClick, activeChip, onRowClick, onUnaccountedClick }) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const chips = ["Unaccounted", "via Axis Flipkart Card", "via HSBC Live +", "via HSBC Travel One"];
  const preview = transactions.slice(0, 4);
  // Parent's activeChip (driven by global filters) wins; activeTab is a local
  // fallback that mirrors clicks when no parent filter is wired.
  const effectiveChip = activeChip ?? activeTab;
  const handleChip = (chip) => {
    // Toggle locally so a second click on the same chip clears the highlight.
    setActiveTab(prev => prev === chip ? null : chip);
    onChipClick?.(chip);
  };
  return (
    <div style={{ padding: "28px 0 0" }}>
      <LegacySectionHeader label="Transactions" onAction={onOpenTransactions} />
      <ActionBar sort="Sort By" onSortClick={onSortClick || (() => {})} filter="Filter" onFilterClick={onFilterClick || (() => {})} chips={chips} activeChip={effectiveChip} onChipClick={handleChip} />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 18 }}>
        {preview.map((t) => (
          <TransactionRow key={t.id} {...t} onClick={() => onRowClick?.(t)} />
        ))}
        <UnaccountedRow onClick={onUnaccountedClick} />
      </div>
    </div>
  );
}

export function HeroSection({ onOpenOptimize, onOpenCards, onOpenCard, onAddCard }) {
  const CardTile = ({ art, label, onClick }) => {
    const [isPortrait, setIsPortrait] = useState(false);
    return (
      <div
        className="legacy-tap"
        onClick={onClick}
        style={{
          width: 71,
          height: 47,
          borderRadius: 3.55,
          overflow: "hidden",
          flexShrink: 0,
          boxShadow: "0 6.5px 27px rgba(23,59,3,0.1), 0 0 0 0.3px rgba(255,255,255,0.2)",
          background: "#e2e8f0",
          position: "relative",
        }}
      >
        <img
          src={art}
          alt={label}
          onLoad={(e) => {
            const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget;
            if (nh > nw) setIsPortrait(true);
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: isPortrait
              ? "translate(-50%, -50%) rotate(-90deg)"
              : "translate(-50%, -50%)",
            width: isPortrait ? 52 : "100%",
            height: isPortrait ? 80 : "100%",
            objectFit: "cover",
          }}
        />
      </div>
    );
  };
  return (
    <div style={{
      position: "relative",
      // Figma hero gradient: 5 stacked layers + base purple (with cyan-green sheen)
      background: "linear-gradient(180deg, rgb(1,4,9) 0%, rgb(88,7,88) 100%)",
      backgroundBlendMode: "normal, normal, normal, saturation, normal",
      paddingBottom: 30, minHeight: 480, overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "18px 18px", pointerEvents: "none" }} />
      {/* Status bar — 9:41 sits at top 16 (per Figma) */}
      <div style={{ position: "relative", height: 38, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0", color: "#f5f9fa", fontFamily: "-apple-system, system-ui", fontSize: 15, fontWeight: 700 }}>9:41</div>
      {/* Eyebrow row — Figma 332×25 at top 54 (16px above this block + status bar) */}
      <div style={{ padding: "0 14px", marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 25, padding: "4px 8px" }}>
          <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.1em", color: "#EBEBEE", textTransform: "uppercase" }}>Tap to see your cards</span>
          <div className="legacy-tap" onClick={onOpenCards} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#FFFFFF", fontWeight: 500 }}>View All <ChevronRight size={9} color="#FFFFFF" strokeWidth={1.6} /></div>
        </div>
        {/* Cards row — Figma top 92, gap 12 (eyebrow row ends at ~79, gap 13) */}
        <div className="legacy-h-rail" style={{ gap: 12, marginTop: 13 }}>
          <div className="legacy-tap" onClick={onAddCard} style={{ width: 71, height: 47, borderRadius: 4, background: "rgba(248,253,254,0.2)", border: "0.93px solid rgba(255,255,255,0.2)", backdropFilter: "blur(4.66px)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: 18, flexShrink: 0 }}>+</div>
          <CardTile art={`${ASSET_BASE}/cards/axis-flipkart.png`} label="Axis Flipkart" onClick={() => onOpenCard?.(1)} />
          <CardTile art={`${ASSET_BASE}/cards/hsbc-live.png`} label="HSBC Live+" onClick={() => onOpenCard?.(2)} />
          <CardTile art={`${ASSET_BASE}/cards/hsbc-travel-one.png`} label="HSBC Travel One" onClick={() => onOpenCard?.(0)} />
        </div>
      </div>
      {/* Headline — Figma top 178, 309×60, Blacklist 22px line 135% #EAEDF7 */}
      <div style={{ padding: "39px 16px 0", color: "#EAEDF7", fontFamily: "'Google Sans', system-ui, sans-serif", fontSize: 20, lineHeight: 1.55, fontWeight: 700, maxWidth: 360 }}>
        You can save upto <span style={{ color: "#72ca46" }}>₹{f(SAVINGS_BARS.bar3)}/yr</span> in credit card savings
      </div>
      {/* Savings chart — bars start ~ top 310 / 397, badges floating above */}
      <div style={{ position: "relative", height: 196, marginTop: 19 }}>
        <div style={{ position: "absolute", left: 132, top: 84, width: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 3 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>You saved</span>
          <span style={{ fontSize: 13, color: "#6dad65", fontWeight: 600 }}>₹{f(SAVINGS_BARS.bar1)}/yr</span>
        </div>
        <div style={{ position: "absolute", right: 32, top: 8, width: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 3 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>You could save</span>
          <span style={{ fontSize: 13, color: "#72ca46", fontWeight: 600 }}>₹{f(SAVINGS_BARS.bar3)}/yr</span>
        </div>
        <div style={{ position: "absolute", left: 132, bottom: 18, width: 100, height: 50, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #158000 0%, #144408 100%)", boxShadow: "inset 0 1px 4px 2px rgba(217,255,240,0.52)", transformOrigin: "bottom", animation: "legacy-growY 600ms ease-out 100ms backwards" }} />
        <div style={{ position: "absolute", right: 32, bottom: 18, width: 100, height: 125, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #72ca46 0%, #00c278 100%)", boxShadow: "0 4px 5px rgba(0,229,141,0.15), 0 10px 13px rgba(0,229,141,0.22), inset 0 1px 4px 2px rgba(217,255,240,1), inset 0 1px 18px 2px rgba(217,255,240,1)", animation: "legacy-growY 700ms ease-out 350ms backwards, legacy-glowPulse 3.2s ease-in-out 1.2s infinite", transformOrigin: "bottom" }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: -10, height: 48 }}>
          <div onClick={onOpenOptimize} className="legacy-tap" style={{ width: "100%", height: "100%", borderRadius: 10, background: "radial-gradient(circle at 30% 40%, #1a2707 0%, #0e0f13 80%)", boxShadow: "9px 9px 14px -2.5px rgba(0,0,0,0.2), 3.8px 3.8px 5.4px -2px rgba(0,0,0,0.19), 1.7px 1.7px 2.5px -1.5px rgba(0,0,0,0.23), inset -0.6px -0.6px 0.6px 0 rgba(0,0,0,0.23), inset 0.6px 0.6px 0.6px 0 rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "rgb(232,232,232)", fontWeight: 700, fontSize: 12 }}>
            See how you can save more
            <ChevronRight size={8} color="#fff" strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function extractDate(cardLine) {
  const parts = cardLine.split("|").map((s) => s.trim());
  return parts[parts.length - 1];
}

export function groupByDate(txns) {
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const byMonth = new Map();
  for (const t of txns) {
    const d = extractDate(t.cardLine);
    const parts = d.split(" ");
    const month = parts.length > 1 ? parts[1] : d;
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(t);
  }
  const sorted = [...byMonth.keys()].sort((a, b) => mo.indexOf(b) - mo.indexOf(a));
  return sorted.map((m, i) => {
    const mu = m.toUpperCase();
    if (i === 0) return { date: m, label: `1 ${mu} - TODAY`, items: byMonth.get(m) };
    const prevMonth = sorted[i - 1];
    return { date: m, label: `1 ${mu} - 1 ${prevMonth.toUpperCase()}`, items: byMonth.get(m) };
  });
}

export function useTransactionGroups(transactions, activeChip) {
  const filtered = useMemo(() => {
    if (!activeChip) return transactions;
    if (activeChip === "Unaccounted") return transactions.filter((t) => t.id % 5 === 3);
    if (activeChip === "via Axis Flipkart Card") return transactions.filter((t) => t.card === "Axis Flipkart");
    if (activeChip === "via HSBC Live +") return transactions.filter((t) => t.card === "HSBC Live+");
    if (activeChip === "via HSBC Travel One") return transactions.filter((t) => t.card === "HSBC Travel One");
    return transactions;
  }, [activeChip, transactions]);
  return useMemo(() => groupByDate(filtered), [filtered]);
}
