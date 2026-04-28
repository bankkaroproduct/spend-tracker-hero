import { useEffect, useMemo, useState } from "react";
import { SAVINGS_BARS, SPEND_CATS, SPEND_BRANDS, TOTAL_ACC, CARD_PROMO } from "@/data/simulation/legacy";
import { f } from "@/lib/format";

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

export function TimeFilter({ label }) {
  return (
    <div className="legacy-tap" style={{ height: 31, borderRadius: 6, background: "rgb(244,248,255)", boxShadow: "10px 10px 21px -3.75px rgba(0,0,0,0.055), 2.6px 2.6px 3.8px -2.25px rgba(0,0,0,0.23), 1.2px 1.2px 1.7px -1.5px rgba(0,0,0,0.247), inset -1px -1px 0 0 rgba(0,0,0,0.1), inset 1px 1px 1px 0 rgba(255,255,255,1)", padding: "0 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 700, color: "rgb(34,41,65)" }}>
      {label}
      <ChevronDown size={6} color="rgb(34,41,65)" />
    </div>
  );
}

function ActionCard({ brand, mark, headline, onClick }) {
  const brands = {
    axis: { bg: "linear-gradient(135deg, #fff0f0 0%, #ffebe0 100%)", ring: "#E52124" },
    hsbcR: { bg: "linear-gradient(135deg, #f0fbff 0%, #e0ecff 100%)", ring: "#DB0011" },
    hsbcB: { bg: "linear-gradient(135deg, #f0f1ff 0%, #e0e7ff 100%)", ring: "#1B4F9C" },
    idfc: { bg: "linear-gradient(135deg, #fff4ec 0%, #ffe4d3 100%)", ring: "#7B1E1E" },
  };
  const b = brands[brand] || brands.axis;
  return (
    <div className="legacy-tap" onClick={onClick} style={{ width: 315, minHeight: 72, borderRadius: 12, padding: "14px 14px 12px", background: b.bg, border: "1px solid rgba(255,255,255,1)", boxShadow: "0 0.6px 2px rgba(9,84,171,0.11)", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: b.ring, fontWeight: 700, fontSize: 13, boxShadow: `inset 0 0 0 1.5px ${b.ring}20`, flexShrink: 0 }}>{mark}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6, color: "rgba(36,45,74,0.9)" }}>{headline}</div>
      </div>
    </div>
  );
}

export function ImportantActions({ onViewAll, onAction }) {
  return (
    <div style={{ paddingTop: 28, paddingBottom: 8 }}>
      <LegacySectionHeader label="Important Actions (10)" onAction={onViewAll} />
      <div className="legacy-h-rail" style={{ margin: "0 0 0 16px" }}>
        <ActionCard brand="axis" mark="A" headline={<>Credit Limit Reached. Repay outstanding to keep using Axis Flipkart card</>} onClick={() => onAction?.(0)} />
        <ActionCard brand="hsbcR" mark="H" headline={<>Dining rewards maxed out on HSBC Travel One. Switch to Axis Flipkart</>} onClick={() => onAction?.(1)} />
        <ActionCard brand="hsbcB" mark="H" headline={<>5,000 points expiring on HSBC Travel One. Redeem now</>} onClick={() => onAction?.(2)} />
        <ActionCard brand="idfc" mark="I" headline={<>Spend ₹8,000 more on IDFC Select to waive the annual fee</>} onClick={() => onAction?.(3)} />
      </div>
    </div>
  );
}

export function ToolsSection({ onOpenCalc, onOpenBestCards, onOpenRedeem }) {
  const tiles = [
    { img: "/tools/tools-savings-finder.png", label: "Savings\nFinder", bg: "#D6ECFF", circleBg: "#B8DCFF", circleW: 98, circleH: 98, circleLeft: 26, circleTop: 36, imgW: 82.85, imgH: 76, imgLeft: 29, imgTop: 38, onClick: onOpenCalc },
    { img: "/tools/tools-best-cards.png", label: "Best Cards\nfor you", bg: "#FFDBEE", circleBg: "rgba(255,195,224,0.7)", circleW: 109, circleH: 109, circleLeft: -4, circleTop: 42, imgW: 82.85, imgH: 115.87, imgLeft: 3, imgTop: "calc(50% - 115.87px/2 + 4.93px)", onClick: onOpenBestCards },
    { img: "/tools/tools-redeem.png", label: "Redeem\nReward Points", bg: "#FFEBB3", circleBg: "rgba(252,217,140,0.7)", circleW: 98, circleH: 98, circleLeft: 22, circleTop: 41, imgW: 82.85, imgH: 76, imgLeft: 19, imgTop: 47, onClick: onOpenRedeem },
  ];
  return (
    <div style={{ padding: "28px 0 8px" }}>
      <LegacySectionHeader label="Tools to help you" action={null} />
      <div style={{ display: "flex", justifyContent: "center", gap: 13, padding: "0 16px", marginTop: 2 }}>
        {tiles.map((t, i) => (
          <div key={i} className="legacy-tap" onClick={t.onClick} style={{ width: 100, height: 107, position: "relative", background: t.bg, borderRadius: 12, border: "1px solid rgba(255,255,255,0.72)", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}>
            <div style={{ position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)", width: 86, fontFamily: "var(--legacy-sans)", fontSize: 11, fontWeight: 500, lineHeight: "16px", letterSpacing: "0.02em", color: "#000000", whiteSpace: "pre-line", zIndex: 2 }}>{t.label}</div>
            <div style={{ position: "absolute", left: t.circleLeft, top: t.circleTop, width: t.circleW, height: t.circleH, borderRadius: "50%", background: t.circleBg }} />
            <img src={t.img} alt="" style={{ position: "absolute", left: t.imgLeft, top: t.imgTop, width: t.imgW, height: t.imgH, objectFit: "contain", pointerEvents: "none", zIndex: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TABar({ height, color1, color2, label, amount, labelColor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: labelColor, letterSpacing: "-0.01em", marginBottom: 6 }}>{amount}</div>
      <div style={{ width: 54, height, borderRadius: "8px 8px 0 0", background: `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`, boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5)", transformOrigin: "bottom", animation: "legacy-growY 600ms ease-out backwards" }} />
      <div style={{ marginTop: 10, fontSize: 10.5, color: "#242d4a", textAlign: "center", lineHeight: 1.25, whiteSpace: "pre-line", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export function TransactionAnalysis({ timeWindow = "Last 365 Days" }) {
  const bar1Val = Math.round(SAVINGS_BARS.bar1);
  const bar2Val = Math.round(SAVINGS_BARS.bar2);
  const bar3Val = Math.round(SAVINGS_BARS.bar3);
  const maxVal = Math.max(bar1Val, bar2Val, bar3Val, 1);
  const bar1H = Math.max(16, Math.round((bar1Val / maxVal) * 110));
  const bar2H = Math.max(16, Math.round((bar2Val / maxVal) * 110));
  const bar3H = Math.max(16, Math.round((bar3Val / maxVal) * 110));
  return (
    <div style={{ padding: "32px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 20px", marginBottom: 22 }}>
        <h2 className="legacy-serif" style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "rgba(54,64,96,0.92)" }}>
          Transaction Analysis
        </h2>
        <TimeFilter label={timeWindow} />
      </div>
      <div style={{
        margin: "0 16px", maxWidth: "calc(100% - 32px)",
        borderRadius: 12,
        background: "linear-gradient(0deg, #DBFCE5 0%, #F5F9FA 54.79%)",
        border: "2px solid rgba(0,101,224,0.08)",
        padding: "20px 12px 16px", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#eb8807", marginBottom: 4 }}>₹{f(bar1Val)} /yr</div>
            <div style={{ fontSize: 10.5, fontWeight: 500, color: "#242d4a", marginBottom: 8, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.25 }}>{"Current\nsavings"}</div>
            <div style={{ width: 54, height: bar1H, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #F2A454 0%, #D07820 100%)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5)", transformOrigin: "bottom", animation: "legacy-growY 600ms ease-out backwards" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#078146", marginBottom: 4 }}>₹{f(bar2Val)} /yr</div>
            <div style={{ fontSize: 10.5, fontWeight: 500, color: "#242d4a", marginBottom: 8, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.25 }}>{"If cards\nused right"}</div>
            <div style={{ width: 54, height: bar2H, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #3BA15F 0%, #237E3F 100%)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5)", transformOrigin: "bottom", animation: "legacy-growY 600ms ease-out backwards" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0e66d2", marginBottom: 4 }}>₹{f(bar3Val)} /yr</div>
            <div style={{ fontSize: 10.5, fontWeight: 500, color: "#242d4a", marginBottom: 8, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.25 }}>{"With the\nultimate card"}</div>
            <div style={{ width: 54, height: bar3H, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #4A82E8 0%, #2A5EBE 100%)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5)", transformOrigin: "bottom", animation: "legacy-growY 600ms ease-out backwards" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardPromo({ onClick }) {
  return (
    <div className="legacy-tap" onClick={onClick} style={{ margin: "28px 20px 0", borderRadius: 12, overflow: "hidden", boxShadow: "0 0.6px 4.4px rgba(63,66,70,0.11)" }}>
      <img src={`${ASSET_BASE}/amex-promo-banner.png`} alt={`Getting a ${CARD_PROMO.name} can help you save up to ₹${f(CARD_PROMO.savings)} /year`} style={{ display: "block", width: "100%", height: "auto" }} />
    </div>
  );
}

const categoryData = SPEND_CATS.map(c => ({ name: c.name, pct: Math.round((c.amt / TOTAL_ACC) * 100), amount: `₹${f(c.amt)}` }));

const brandData = SPEND_BRANDS.slice(0, 7).map(b => ({ name: b.name, pct: Math.round((b.amt / TOTAL_ACC) * 100), amount: `₹${f(b.amt)}` }));

// 3D category icons — same set used in the SpendAnalysis cinematic
const CATEGORY_IMG: Record<string, string> = {
  Shopping:      "/categories/shopping.png",
  Groceries:     "/categories/groceries.png",
  Bills:         "/categories/bills.png",
  Travel:        "/categories/travel.png",
  Insurance:     "/categories/milestones.png",
  Fuel:          "/categories/fuel.png",
  Entertainment: "/categories/entertainment.png",
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

export function SpendAnalysis({ timeWindow = "Last 365 Days", initialTab = "Categories" }) {
  const [tab, setTab] = useState(initialTab);
  const data = tab === "Categories" ? categoryData : brandData;
  return (
    <div style={{ padding: "32px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 20px", marginBottom: 22 }}>
        <h2 className="legacy-serif" style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "rgba(54,64,96,0.92)" }}>
          Spend Analysis
        </h2>
        <TimeFilter label={timeWindow} />
      </div>
      <div style={{ margin: "0 20px 22px", height: 82, borderRadius: 12, background: "#ffffff", border: "1px solid rgba(54,64,96,0.08)", boxShadow: "0 2px 10px rgba(63,66,70,0.05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "rgb(14,58,107)", letterSpacing: "-0.01em" }}>{`₹${f(TOTAL_ACC)}`}</div>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgb(123,131,152)" }}>Total Accounted Spends</div>
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
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: v.prefix === "sparkle" ? 5 : 10, background: v.bg, color: v.color, borderRadius: 4, padding: "6px 10px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: "120%" }}>
      {v.prefix === "sparkle" && <svg width="10" height="10" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}><path d="M4 0C4 2.2 5.8 4 8 4C5.8 4 4 5.8 4 8C4 5.8 2.2 4 0 4C2.2 4 4 2.2 4 0Z" fill="#0862CF" style={{}}/></svg>}
      <span>{text}</span>
      {v.chevron && <ChevronRight size={8} color={v.color} strokeWidth={2} />}
    </div>
  );
}

export function TransactionRow({ brand, merchant, cardLine, amount, saved, savedColor, cta, onClick }) {
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
      <DashedDivider />
      <InlineCTA {...cta} />
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
  const [activeTab, setActiveTab] = useState("Recent");
  const chips = ["Unaccounted", "via Axis Flipkart Card", "via HSBC Live +", "via HSBC Travel One"];
  const preview = transactions.slice(0, 4);
  const effectiveChip = activeChip ?? activeTab;
  const handleChip = (chip) => {
    setActiveTab(chip);
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
  const bar1 = SAVINGS_BARS?.bar1 || 0;
  const bar2 = SAVINGS_BARS?.bar2 || 0;
  const bar3 = SAVINGS_BARS?.bar3 || 0;
  const missingOut = Math.max(0, Math.round(bar3 - bar1));
  const isGreatJob = bar2 > 0 && bar1 >= bar2 * 0.85;
  const earnMore = Math.max(0, Math.round(bar3 - bar1));
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
      background: "linear-gradient(180deg, #6F01FD 0%, rgba(99, 134, 248, 0.00) 59.56%), linear-gradient(270deg, rgba(126, 255, 114, 0.00) 27%, rgba(114, 203, 255, 0.60) 100%), linear-gradient(331deg, #0027E9 2.42%, rgba(104, 185, 255, 0.00) 75.74%), linear-gradient(90deg, rgba(255, 47, 134, 0.00) 0%, #FF2F86 100%), #5A0EFF",
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
      {/* Headline + Chart */}
      {isGreatJob ? (<>
        <div className="legacy-serif" style={{ padding: "39px 16px 0", color: "#EAEDF7", fontSize: 22, lineHeight: 1.35, fontWeight: 700, maxWidth: 309 }}>
          You can earn upto <span style={{ color: "#72ca46" }}>₹{f(earnMore)}</span> more per year in credit card savings
        </div>
        <div style={{ position: "relative", height: 196, marginTop: 19 }}>
          <div style={{ position: "absolute", left: 50, top: 44, width: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 3 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>You saved</span>
            <span style={{ fontSize: 13, color: "#6dad65", fontWeight: 600 }}>₹{f(Math.round(bar1))}/yr</span>
          </div>
          <div style={{ position: "absolute", right: 30, top: 8, width: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 3 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>You could save</span>
            <span style={{ fontSize: 13, color: "#72ca46", fontWeight: 600 }}>₹{f(Math.round(bar3))}/yr</span>
          </div>
          {(()=>{ const maxH = 125; const b1H = bar3 > 0 ? Math.max(30, Math.round((bar1 / bar3) * maxH)) : 60; return (<>
            <div style={{ position: "absolute", left: 70, bottom: 18, width: 100, height: b1H, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #158000 0%, #144408 100%)", boxShadow: "inset 0 1px 4px 2px rgba(217,255,240,0.52)", transformOrigin: "bottom", animation: "legacy-growY 600ms ease-out 100ms backwards" }} />
            <div style={{ position: "absolute", right: 50, bottom: 18, width: 100, height: maxH, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #72ca46 0%, #00c278 100%)", boxShadow: "0 4px 5px rgba(0,229,141,0.15), 0 10px 13px rgba(0,229,141,0.22), inset 0 1px 4px 2px rgba(217,255,240,1), inset 0 1px 18px 2px rgba(217,255,240,1)", animation: "legacy-growY 700ms ease-out 350ms backwards, legacy-glowPulse 3.2s ease-in-out 1.2s infinite", transformOrigin: "bottom" }} />
          </>);})()}
          <div style={{ position: "absolute", left: 16, right: 16, bottom: -10, height: 48 }}>
            <div onClick={onOpenOptimize} className="legacy-tap" style={{ width: "100%", height: "100%", borderRadius: 10, background: "radial-gradient(circle at 30% 40%, #1a2707 0%, #0e0f13 80%)", boxShadow: "9px 9px 14px -2.5px rgba(0,0,0,0.2), 3.8px 3.8px 5.4px -2px rgba(0,0,0,0.19), 1.7px 1.7px 2.5px -1.5px rgba(0,0,0,0.23), inset -0.6px -0.6px 0.6px 0 rgba(0,0,0,0.23), inset 0.6px 0.6px 0.6px 0 rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "rgb(232,232,232)", fontWeight: 700, fontSize: 12 }}>
              See how you can earn more
              <ChevronRight size={8} color="#fff" strokeWidth={2} />
            </div>
          </div>
        </div>
      </>) : (<>
        <div className="legacy-serif" style={{ padding: "39px 16px 0", color: "#EAEDF7", fontSize: 22, lineHeight: 1.35, fontWeight: 700, maxWidth: 309 }}>
          You're missing out on <span style={{ color: "#72ca46" }}>₹{f(missingOut)}</span>
          <br />
          per year in extra savings
        </div>
        <div style={{ position: "relative", height: 196, marginTop: 19 }}>
          <div style={{ position: "absolute", left: 132, top: 84, width: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 3 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>You saved</span>
            <span style={{ fontSize: 13, color: "#6dad65", fontWeight: 600 }}>₹{f(Math.round(bar1))}/yr</span>
          </div>
          <div style={{ position: "absolute", right: 32, top: 8, width: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 3 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>You could save</span>
            <span style={{ fontSize: 13, color: "#72ca46", fontWeight: 600 }}>₹{f(Math.round(bar3))}/yr</span>
          </div>
          <div style={{ position: "absolute", left: 132, bottom: 18, width: 100, height: 50, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #158000 0%, #144408 100%)", boxShadow: "inset 0 1px 4px 2px rgba(217,255,240,0.52)", transformOrigin: "bottom", animation: "legacy-growY 600ms ease-out 100ms backwards" }} />
          <div style={{ position: "absolute", right: 32, bottom: 18, width: 100, height: 125, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #72ca46 0%, #00c278 100%)", boxShadow: "0 4px 5px rgba(0,229,141,0.15), 0 10px 13px rgba(0,229,141,0.22), inset 0 1px 4px 2px rgba(217,255,240,1), inset 0 1px 18px 2px rgba(217,255,240,1)", animation: "legacy-growY 700ms ease-out 350ms backwards, legacy-glowPulse 3.2s ease-in-out 1.2s infinite", transformOrigin: "bottom" }} />
          <div style={{ position: "absolute", left: 16, right: 16, bottom: -10, height: 48 }}>
            <div onClick={onOpenOptimize} className="legacy-tap" style={{ width: "100%", height: "100%", borderRadius: 10, background: "radial-gradient(circle at 30% 40%, #1a2707 0%, #0e0f13 80%)", boxShadow: "9px 9px 14px -2.5px rgba(0,0,0,0.2), 3.8px 3.8px 5.4px -2px rgba(0,0,0,0.19), 1.7px 1.7px 2.5px -1.5px rgba(0,0,0,0.23), inset -0.6px -0.6px 0.6px 0 rgba(0,0,0,0.23), inset 0.6px 0.6px 0.6px 0 rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "rgb(232,232,232)", fontWeight: 700, fontSize: 12 }}>
              See how you can improve
              <ChevronRight size={8} color="#fff" strokeWidth={2} />
            </div>
          </div>
        </div>
      </>)}
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
