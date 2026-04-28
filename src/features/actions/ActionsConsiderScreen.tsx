// @ts-nocheck
// New "Actions to consider" screen — list + bottom sheet detail.
// To revert: in src/features/actions/ActionsScreen.tsx, set USE_NEW_FLOW = false.

import React, { useState } from "react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";
import { CONSIDER_HOOKS, TABS } from "@/data/actionsConsider";
import { HOOK_CAT_ICON } from "@/features/legacy/LegacyShared";
import "@/features/legacy/legacy.css";

// ─── Brand mark for list rows ───
function BrandIcon({ brand }: { brand: string }) {
  if (brand === "axis") return <img src="/legacy-assets/opt/axis-logo-a.png" alt="Axis" style={{ width: 22, height: 22, objectFit: "contain" }} />;
  if (brand === "hdfc") return (
    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#004B87", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>D</div>
  );
  // hsbc
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 4L4 12l8 8 8-8-8-8Z" fill="#DB0011" />
      <path d="M12 7.2L7.2 12 12 16.8 16.8 12 12 7.2Z" fill="#fff" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}

// ─── Card art map (used by some sheet headers — per Figma "Credit Limit" shows the card) ───
const CARD_ART: Record<string, string> = {
  axis: "/legacy-assets/cards/axis-flipkart.png",
  hsbc: "/legacy-assets/cards/hsbc-travel-one.png",
  hdfc: "/legacy-assets/cards/hdfc-infinia.png",
};

// ─── Hero icon for sheet header (3D-style 60×60 lockups) ───
function HeroIcon({ kind }: { kind: string }) {
  if (kind === "gauge") return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="34" r="24" fill="#FFFFFF" stroke="#E6E9EE" strokeWidth="1.2"/>
      <path d="M9 34a21 21 0 0142 0" stroke="#E6E9EE" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M9 34a21 21 0 0114-19.8" stroke="#0E8A4F" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M37 12a21 21 0 0114 22" stroke="#FFB42E" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M51 34a21 21 0 01-2 8" stroke="#C0362C" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M30 34l11-4" stroke="#0F1B2D" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="30" cy="34" r="2.5" fill="#0F1B2D"/>
    </svg>
  );
  if (kind === "gift") return (
    <div style={{ position: "relative", width: 60, height: 60 }}>
      <img src="/legacy-assets/opt/0e60286a81e4.png" alt="" style={{ width: 60, height: 60, objectFit: "contain" }}/>
      <div style={{ position: "absolute", right: -2, bottom: -2, width: 22, height: 22, borderRadius: 6, background: "#FEF3C7", border: "1.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L22 20H2L12 2Z" stroke="#F79A18" strokeWidth="2" fill="#FEF3C7" strokeLinejoin="round"/><path d="M12 9V13" stroke="#F79A18" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#F79A18"/></svg>
      </div>
    </div>
  );
  if (kind === "receipt-check") return (
    <div style={{ position: "relative", width: 60, height: 60 }}>
      <svg width="56" height="60" viewBox="0 0 56 60" fill="none">
        <path d="M10 4h32l4 4v50l-6-4-6 4-6-4-6 4-6-4-6 4V8l4-4z" fill="#F4F8FF" stroke="#C6D5EB" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M22 18l4 4 8-8" stroke="#1E5BB8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0,4)"/>
      </svg>
      <div style={{ position: "absolute", right: 0, bottom: 4, width: 22, height: 22, borderRadius: "50%", background: "#0E8A4F", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-9"/></svg>
      </div>
    </div>
  );
  if (kind === "milestones") return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <path d="M22 30h16v22H22V30z" fill="#A8B5E8"/>
      <path d="M10 40h12v12H10V40z" fill="#9AA8DD"/>
      <path d="M38 36h12v16H38V36z" fill="#9AA8DD"/>
      <text x="30" y="46" fontFamily="Arial" fontSize="12" fontWeight="700" textAnchor="middle" fill="#fff">F</text>
      <path d="M30 8l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7z" fill="#FFB42E"/>
    </svg>
  );
  return null;
}

// ─── Green-tinted "days left" pill (per Figma — only for fee/points rows) ───
function DaysLeftPill({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: 8, borderRadius: 4,
      background: "linear-gradient(90deg, #E2F9E0 0%, rgba(226,249,224,0) 100%)",
      fontFamily: FN, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      color: "#1E8714", lineHeight: "120%",
    }}>{label}</span>
  );
}

// ─── Small inline list-row chevron (rotated tiny arrow, per Figma) ───
function RowChevron() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 1l4 4-4 4" stroke="#222941" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Bottom-sheet primary CTA (per Figma: 48.51px, #222941→#101C43 gradient + layered shadows) ───
function PrimaryCta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="legacy-tap" style={{
      width: "100%", height: 48.51, border: "none", cursor: "pointer",
      padding: "15.26px 20.34px",
      borderRadius: 10.17,
      background: "linear-gradient(90deg, #222941 0%, #101C43 100%)",
      color: "#E8E8E8", fontFamily: FN, fontSize: 12, fontWeight: 600, lineHeight: "150%",
      boxShadow: "0.29px 0.29px 0.41px -0.49px rgba(0,0,0,0.26), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247), 1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 3.85px 3.85px 5.44px -1.96px rgba(0,0,0,0.192), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2), -0.33px -0.33px 0px rgba(0,0,0,0.686), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8.48,
    }}>
      {label} <span style={{ fontSize: 14, fontWeight: 400 }}>→</span>
    </button>
  );
}

// ─── Progress bar (16px, neumorphic — per Figma + CLAUDE.md) ───
function ProgressBar({ pct, tone }: { pct: number; tone: string }) {
  // Tone presets with inset & rim shadow recipes per Figma
  const fill: any = tone === "red"
    ? { bg: "#FF7D66", inset: "1.5px 1.75px 4px #FF5D45 inset", rim: "-2px -2px 3.75px rgba(214,174,174,0.6) inset" }
    : tone === "amber"
      ? { bg: "#FFA666", inset: "1.5px 1.75px 4px #FFCB45 inset", rim: "-2px -2px 3.75px rgba(214,174,174,0.6) inset" }
      : tone === "dark"
        ? { bg: "#313131", inset: "1.5px 1.75px 4px #171717 inset", rim: "-2px -2px 3.75px rgba(70,70,70,0.6) inset" }
        : { bg: "#4DC20D", inset: "1.5px 1.75px 4px #70FF45 inset", rim: "-2px -2px 3.75px rgba(214,174,174,0.6) inset" };
  return (
    <div style={{
      width: "100%", height: 16, borderRadius: 4,
      background: "rgba(123, 142, 178, 0.1)",
      boxShadow: "0px 1px 0px rgba(255,255,255,0.19), inset 1px 1px 2px rgba(0,0,0,0.11)",
      overflow: "hidden", position: "relative",
    }}>
      <div style={{
        height: "100%", width: `${Math.min(100, pct)}%`,
        background: fill.bg, borderRadius: 4,
        boxShadow: `0px 2.75px 5px rgba(0,0,0,0.12), ${fill.inset}, ${fill.rim}`,
        transition: "width 0.6s ease",
      }}/>
    </div>
  );
}

// ─── Expandable accordion row (per Figma: white card 10px radius, 12/500 title, 11/400 body) ───
function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 10, padding: "15px 16px", marginBottom: 10 }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", height: 18 }}>
        <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, lineHeight: "150%", color: "#222941" }}>{q}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
          <path d="M1 1l4 4 4-4" stroke="#222941" strokeWidth="1.07" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && <div style={{ marginTop: 16, fontFamily: FN, fontSize: 11, fontWeight: 400, lineHeight: "150%", color: "#808387" }}>{a}</div>}
    </div>
  );
}

// ─── The Bottom Sheet itself ───
export function ConsiderSheet({ hook, onClose, onPrimary }: any) {
  if (!hook) return null;
  const s = hook.sheet;

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(15,27,45,0.5)",
        zIndex: 90, animation: "fadeIn .2s",
      }}/>
      <div style={{
        position: "fixed", left: "50%", bottom: 0, transform: "translateX(-50%)",
        width: "100%", maxWidth: 400, background: "#F6F7F9",
        borderRadius: "24px 24px 0 0", zIndex: 91,
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        animation: "sheetUp .35s cubic-bezier(0.32,0.72,0,1)",
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: "#D7DBE3", borderRadius: 99, margin: "8px auto 0", flexShrink: 0 }}/>

        {/* Header — card art (or hero icon) + title + card name (per Figma: 14/600 + 11/500) */}
        <div style={{ display: "flex", alignItems: "center", gap: 19, padding: "15px 20px 14px", flexShrink: 0 }}>
          <div style={{ width: 65, height: 57, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hook.cat === "credit"
              ? <img src={CARD_ART[hook.cardBrand] || CARD_ART.axis} alt="" style={{ width: 65, height: 57, objectFit: "contain" }}/>
              : <HeroIcon kind={s.heroIcon}/>}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "4px 0", gap: 5 }}>
            <div style={{ fontFamily: FN, fontSize: 14, fontWeight: 600, lineHeight: "17px", color: "#36405E" }}>{s.sheetTitle}</div>
            <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 500, lineHeight: "140%", color: "#808387" }}>{hook.cardName}</div>
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(5,34,73,0.15)", flexShrink: 0 }}/>

        {/* Scrollable body */}
        <div data-scroll="1" style={{ overflowY: "auto", padding: "20px 16px 16px", flex: 1 }}>

          {/* Standard hero (label + right-aligned value · progress bar · resets-in meta) */}
          {s.hero && s.template !== "benefit" && s.template !== "milestone" && s.template !== "points" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, lineHeight: "150%", color: "#222941" }}>{s.hero.label}</span>
                <span style={{ fontFamily: FN, fontSize: 10, fontWeight: 700, lineHeight: "140%", color: "#364060" }}>
                  {s.hero.rightLabel}{s.hero.rightSuffix && <span style={{ fontWeight: 400, color: "#364060" }}> {s.hero.rightSuffix}</span>}
                </span>
              </div>
              {typeof s.hero.progressPct === "number" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <ProgressBar pct={s.hero.progressPct} tone={s.hero.progressTone}/>
                  {s.hero.meta && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                      <span style={{ fontFamily: FN, fontSize: 10, fontWeight: 500, lineHeight: "140%", color: "rgba(54,64,96,0.6)" }}>{s.hero.meta}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CL1 — Section label + Bill Statement card (single bordered card, 3 cells separated by border-right) */}
          {s.template === "standard" && s.billStatement && (
            <>
              <div style={{ fontFamily: FN, fontSize: 9.28, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2F374B", lineHeight: "11px", marginBottom: 14, marginLeft: 3 }}>{s.sectionLabel}</div>
              <div style={{
                boxSizing: "border-box",
                border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8,
                padding: 16,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 7,
                marginBottom: 20,
              }}>
                {[
                  { l: "Amount Due", v: s.billStatement.amountDue },
                  { l: "Min Due",    v: s.billStatement.minDue },
                  { l: "Due by",     v: s.billStatement.dueBy },
                ].map((c, i) => (
                  <div key={i} style={{
                    flex: 1, display: "flex", flexDirection: "column", gap: 4,
                    paddingRight: i < 2 ? 11 : 0,
                    borderRight: i < 2 ? "1px solid rgba(0,0,0,0.1)" : "none",
                  }}>
                    <span style={{ fontFamily: FN, fontSize: 10, fontWeight: 400, lineHeight: "140%", color: "rgba(54,64,96,0.7)" }}>{c.l}</span>
                    <span style={{ fontFamily: FN, fontSize: 10, fontWeight: 700, lineHeight: "140%", color: "#364060" }}>{c.v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Amber/Red Alert (per Figma: warm orange #F79A18 on #FEF6EB) */}
          {s.alert && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", borderRadius: 7,
              background: s.alert.tone === "red" ? "#FCEBE9" : "#FEF6EB",
              marginBottom: 20,
            }}>
              <div style={{ width: 30, height: 32, borderRadius: 6, background: "#FCE7CA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="14" viewBox="0 0 18 16" fill="none"><path d="M9 1.5L17 14.5H1L9 1.5Z" stroke="#F79A18" strokeWidth="1.5" strokeLinejoin="round" fill="none"/><path d="M9 7V10" stroke="#F79A18" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="11.8" r="0.9" fill="#F79A18"/></svg>
              </div>
              <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, color: "#F79A18", lineHeight: "21px" }}>{s.alert.text}</span>
            </div>
          )}

          {/* C3 — Stacked cap rows (per Figma: each row = label + right-aligned status + 16px progress bar + resets-in meta) */}
          {s.template === "multi-cap" && s.multiCaps && (
            <div style={{ display: "flex", flexDirection: "column", gap: 26, marginBottom: 24 }}>
              {s.multiCaps.map((cap: any, i: number) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                    <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 500, lineHeight: "150%", color: "#222941" }}>{cap.label}</span>
                    <span style={{ fontFamily: FN, fontSize: 10, fontWeight: 700, lineHeight: "140%", color: "#364060" }}>
                      {cap.rightLabel}{cap.rightSuffix && <span style={{ fontWeight: 400, color: "#364060" }}> {cap.rightSuffix}</span>}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    <ProgressBar pct={cap.progressPct} tone={cap.progressTone}/>
                    {cap.meta && (
                      <div style={{ padding: "0 4px" }}>
                        <span style={{ fontFamily: FN, fontSize: 10, fontWeight: 500, lineHeight: "140%", color: "rgba(54,64,96,0.6)" }}>{cap.meta}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* "Best Alternatives" — per Figma: 328×87 white card, layered drop shadows on card art */}
          {s.template === "alternatives" && s.alternatives && (
            <>
              <div style={{ fontFamily: FN, fontSize: 9.28, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2F374B", lineHeight: "11px", textAlign: "center", marginBottom: 16 }}>{s.sectionLabel}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                {s.alternatives.map((alt: any, i: number) => (
                  <div key={i} style={{ position: "relative", background: "#FFFFFF", borderRadius: 10, height: 87, boxShadow: "0px 0.62px 4.35px rgba(63,66,70,0.11)" }}>
                    <div style={{
                      position: "absolute", left: 14.05, top: 24.45,
                      width: 62.3, height: 41.53, borderRadius: 3.11, overflow: "hidden",
                      border: "0.26px solid rgba(255,255,255,0.2)",
                      filter: "drop-shadow(0 9.23px 3.69px rgba(20,21,72,0.03)) drop-shadow(0 5.08px 3px rgba(20,21,72,0.1)) drop-shadow(0 2.31px 2.31px rgba(20,21,72,0.17)) drop-shadow(0 0.46px 1.15px rgba(20,21,72,0.2))",
                    }}>
                      <img src={alt.cardImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
                    </div>
                    <div style={{ position: "absolute", left: 89, top: 15, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, padding: 10 }}>
                      <span style={{ fontFamily: FN, fontSize: 14, fontWeight: 500, lineHeight: "18px", color: "#36405E" }}>{alt.cardName}</span>
                      <span style={{ fontFamily: FN, fontSize: 9, fontWeight: 700, lineHeight: "120%", letterSpacing: "0.1em", textTransform: "uppercase", color: "#098039" }}>{alt.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* "Best Categories To Spend" — F1 (per Figma: 328×69 white card with #DFE7FF border, 38.71×40 icon, 12/600 title, 9/700 rate) */}
          {s.template === "fee-waiver" && s.categories && (
            <>
              <div style={{ fontFamily: FN, fontSize: 9.28, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2F374B", lineHeight: "11px", textAlign: "center", marginBottom: 16 }}>{s.sectionLabel}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                {s.categories.map((c: any, i: number) => (
                  <div key={i} style={{
                    boxSizing: "border-box",
                    background: "#FFFFFF", border: "0.62px solid #DFE7FF",
                    boxShadow: "0px 0.62px 4.35px rgba(63,66,70,0.11)",
                    borderRadius: 8, padding: "12px 12px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      boxSizing: "border-box",
                      width: 38.71, height: 40, borderRadius: 4.42,
                      border: "1.11px solid #F5F5F5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, overflow: "hidden",
                    }}>
                      <img src={c.img} alt="" style={{ width: 35, height: 38, objectFit: "contain" }}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, padding: "4px 0" }}>
                      <span style={{ fontFamily: FN, fontSize: 12, fontWeight: 600, lineHeight: "150%", color: "#364060" }}>{c.name}</span>
                      <span style={{ fontFamily: FN, fontSize: 9, fontWeight: 700, lineHeight: "120%", letterSpacing: "0.1em", textTransform: "uppercase", color: "#098039" }}>{c.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Milestone timeline */}
          {s.template === "milestone" && s.milestones && (
            <div style={{ display: "flex", gap: 13, marginBottom: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 4px", flexShrink: 0 }}>
                {s.milestones.map((m: any, i: number) => {
                  const isLast = i === s.milestones.length - 1;
                  return (
                    <React.Fragment key={i}>
                      {m.state === "claimed" ? (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#08CF6F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-9"/></svg>
                        </div>
                      ) : m.state === "active" ? (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F5FCF9", border: "2px solid #08CF6F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#08CF6F" }}/>
                        </div>
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F5FCF9", border: "1.5px solid #C9D5DC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8FB9AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
                        </div>
                      )}
                      {!isLast && <div style={{ width: 0, flex: 1, minHeight: 60, borderLeft: m.state === "claimed" ? "2px solid #08CF6F" : "2px dashed #C9D5DC" }}/>}
                    </React.Fragment>
                  );
                })}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                {s.milestones.map((m: any, i: number) => {
                  const cardStyle: any = m.state === "claimed"
                    ? { background: "#F5FCF9", border: "1px solid rgba(37,220,155,0.3)" }
                    : m.state === "active"
                      ? { background: "#fff", border: "1.5px solid #25DC9B" }
                      : { background: "#fff", border: "1px solid #E6E9EE", opacity: 0.85 };
                  return (
                    <div key={i} style={{ ...cardStyle, padding: "14px 16px", borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontFamily: FN, fontSize: 16, fontWeight: 600, color: "#0F1B2D" }}>{m.title}</div>
                      <div style={{ fontFamily: FN, fontSize: 13, color: "#7A8699" }}>{m.sub}</div>
                      {m.chips && (
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          {m.chips.map((c: string, ci: number) => (
                            <span key={ci} style={{
                              padding: "8px 12px", borderRadius: 6,
                              background: ci === 0 ? "linear-gradient(90deg, #EAF2FC 0%, rgba(234,242,252,0) 100%)" : "linear-gradient(90deg, #FCF9EA 0%, rgba(252,244,234,0) 100%)",
                              fontFamily: FN, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                              color: ci === 0 ? "#0897CF" : "#CF6C08",
                            }}>{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Benefit (hero serif card + Why + How to use) */}
          {s.template === "benefit" && s.heroBig && (
            <>
              <div style={{ background: "#F0F4FA", borderRadius: 16, padding: "24px 24px 28px", marginBottom: 24 }}>
                <div style={{ fontFamily: FN, fontSize: 14, color: "#7A8699", marginBottom: 8 }}>{s.heroBig.meta}</div>
                <div style={{ fontFamily: "var(--legacy-serif), Georgia, serif", fontSize: 26, fontWeight: 700, color: "#0F1B2D", lineHeight: 1.25 }}>{s.heroBig.title}</div>
              </div>
              {s.whyTitle && (
                <>
                  <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#3D4A5C", marginBottom: 12 }}>{s.whyTitle}</div>
                  <div style={{ background: "#F4F8FF", border: "1px solid #E1E8F4", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 24 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E1E8F4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E5BB8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16V12M12 8h.01"/></svg>
                    </div>
                    <span style={{ fontFamily: FN, fontSize: 14, color: "#0F1B2D", lineHeight: 1.5 }}>{s.whyText}</span>
                  </div>
                </>
              )}
              {s.howTitle && (
                <>
                  <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#3D4A5C", marginBottom: 12 }}>{s.howTitle}</div>
                  <div style={{ background: "#fff", border: "1px solid #E6E9EE", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
                    {s.howSteps.map((step: string, i: number) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderTop: i > 0 ? "1px solid #EFF1F4" : "none" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #C7E8DD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: FN, fontSize: 14, fontWeight: 600, color: "#0F1B2D" }}>{i + 1}</div>
                        <span style={{ fontFamily: FN, fontSize: 15, color: "#0F1B2D" }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Points template */}
          {s.template === "points" && s.pointsOptions && (
            <>
              <div style={{ background: "#fff", border: "1px solid #E6E9EE", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
                <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A8699" }}>{s.hero.label}</div>
                <div style={{ fontFamily: "var(--legacy-serif), Georgia, serif", fontSize: 36, fontWeight: 600, color: "#C0362C", marginTop: 6, letterSpacing: "-0.02em" }}>{s.hero.rightLabel}</div>
                <div style={{ fontFamily: FN, fontSize: 14, color: "#3D4A5C", marginTop: 8 }}>{s.hero.rightSuffix}</div>
              </div>
              <div style={{ fontFamily: FN, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A8699", marginBottom: 12 }}>{s.sectionLabel}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {s.pointsOptions.map((opt: any, i: number) => (
                  <div key={i} style={{ border: opt.best ? "1.5px solid #0E8A4F" : "1px solid #E6E9EE", background: opt.best ? "#FAFEFB" : "#fff", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: FN, fontSize: 15, fontWeight: 600, color: "#0F1B2D" }}>{opt.name}</span>
                        {opt.best && <span style={{ background: "#0E8A4F", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em" }}>BEST</span>}
                      </div>
                      <div style={{ fontFamily: FN, fontSize: 12, color: "#7A8699", marginTop: 3 }}>{opt.rate}</div>
                    </div>
                    <span style={{ fontFamily: FN, fontSize: 15, fontWeight: 600, color: "#0F1B2D" }}>{opt.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Accordions */}
          {s.details && s.details.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {s.details.map((d: any, i: number) => <Accordion key={i} q={d.q} a={d.a}/>)}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", background: "#F6F7F9", borderTop: "1px solid #E6E9EE", flexShrink: 0 }}>
          <PrimaryCta label={s.primaryCta} onClick={onPrimary}/>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheetUp { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }
      `}</style>
    </>
  );
}

// ─── The Screen itself ───
export function ActionsConsiderScreen() {
  const ctx: any = useAppContext();
  const { setScreen, setRedeemCard, setRedeemPts, setRedeemResult, setRedeemPref, openCard } = ctx;

  const [activeTab, setActiveTab] = useState("all");
  const [openHook, setOpenHook] = useState<any>(null);

  const filtered = activeTab === "all" ? CONSIDER_HOOKS : CONSIDER_HOOKS.filter(h => h.cat === activeTab);

  const handlePrimary = (hook: any) => {
    // Route the primary CTA to the most appropriate destination
    if (hook.cat === "points") {
      setRedeemCard(null); setRedeemPts(""); setRedeemResult(null); setRedeemPref(null);
      setOpenHook(null);
      setScreen("redeem");
      return;
    }
    if (hook.cat === "credit") {
      setOpenHook(null);
      // Mock — would navigate to a "Pay Bill" flow
      return;
    }
    if (hook.cat === "fee" || hook.cat === "cap" || hook.cat === "milestone") {
      // Send to savings finder / calc
      setOpenHook(null);
      setScreen("calculate");
      return;
    }
    if (hook.cat === "benefit") {
      setOpenHook(null);
      // Open the parent card detail benefits tab — Travel One = index 0
      openCard(2); // tab 2 = Benefits
      return;
    }
  };

  return (
    <div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", position: "relative", background: "#F5F9FA", overflow: "hidden" }}>
      <FL/>
      <div data-scroll="1" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 40 }}>
        <div className="slide-in">
          {/* ── HEADER (135px tall, dark gradient #010411 → #543020) ── */}
          <div style={{ background: "linear-gradient(180deg, #010411 -15.07%, #543020 112.18%)", color: "#fff", height: 135, position: "relative" }}>
            {/* iOS status bar 46px */}
            <div style={{ height: 46, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0", fontFamily: "-apple-system, system-ui", fontSize: 15, fontWeight: 700, color: "#F5F9FA" }}>
              <span style={{ letterSpacing: "-0.02em" }}>9:41</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#F5F9FA"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></g></svg>
                <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#F5F9FA"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z"/><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z"/><circle cx="8" cy="10" r="1.2"/></g></svg>
              </div>
            </div>
            {/* Back arrow row */}
            <div style={{ height: 24, padding: "0 16px", display: "flex", alignItems: "center" }}>
              <div className="legacy-tap" onClick={() => setScreen("home")} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7H1M7 1L1 7l6 6"/></svg>
              </div>
            </div>
            {/* Title — Blacklist 22px / 700 / #EAEDF7 at top: 86px */}
            <div style={{ position: "absolute", top: 86, left: 16, right: 16 }}>
              <span style={{ fontFamily: "var(--legacy-serif), Georgia, serif", fontSize: 22, lineHeight: "30px", fontWeight: 700, color: "#EAEDF7", letterSpacing: 0 }}>Actions to consider</span>
            </div>
          </div>

          {/* ── TABS (per Figma: #FAFEFF bg, dashed top + solid bottom dividers, M3 pill indicator + filled badges) ── */}
          <div style={{
            background: "#FAFEFF",
            borderTop: "0.8px dashed #E3EBED",
            borderBottom: "0.8px solid rgba(202,196,208,0.7)",
            position: "sticky", top: 0, zIndex: 5,
            overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: "none",
          }} className="legacy-h-rail">
            <div style={{ display: "inline-flex", padding: "0 16px", gap: 28, height: 46 }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <div key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                    display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center",
                    cursor: "pointer", position: "relative", flexShrink: 0,
                  }}>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: "14px 0", gap: 6 }}>
                      <span style={{
                        fontFamily: FN, fontWeight: 500, fontSize: 12,
                        lineHeight: isActive ? "20px" : "18px",
                        letterSpacing: "0.1px", color: isActive ? "#36405E" : "#676F88",
                        transition: "color 0.2s",
                      }}>{tab.label}</span>
                      <span style={{
                        display: "inline-flex", justifyContent: "center", alignItems: "center",
                        padding: "0 4px", minWidth: 16, height: 16, borderRadius: 999,
                        background: isActive ? "#36405E" : "#E2E4E9",
                        fontFamily: "Roboto, system-ui, sans-serif", fontWeight: 500,
                        fontSize: isActive ? 11 : 10, lineHeight: "16px",
                        color: isActive ? "#FFFFFF" : "#36405E",
                        letterSpacing: isActive ? "0.5px" : "0",
                      }}>{tab.count}</span>
                    </div>
                    {isActive && (
                      <div style={{ position: "absolute", height: 14, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
                        <div style={{ position: "absolute", height: 3, left: 2, right: 2, bottom: 0, background: "#36405E", borderRadius: "100px 100px 0 0" }}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── LIST (rows 330px wide, 14×12 padding, 18px gap, white border + subtle shadow) ── */}
          <div style={{ padding: "24px 15px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
            {filtered.map((hook: any) => {
              const isFeeOrPoints = hook.cat === "fee" || hook.cat === "points";
              return (
                <div key={hook.id} className="legacy-tap" onClick={() => setOpenHook(hook)} style={{
                  boxSizing: "border-box",
                  background: "#FFFFFF", border: "1px solid #FFFFFF",
                  boxShadow: "0px 0.62px 4.35px rgba(63,66,70,0.11)",
                  borderRadius: 8,
                  padding: "14px 12px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                  cursor: "pointer",
                }}>
                  {/* Avatar 40×40 — category icon (rounded line, 1.5 stroke) */}
                  <div style={{ display: "flex", alignItems: "flex-start", padding: "2px 0", flexShrink: 0 }}>
                    {(() => {
                      const ci = HOOK_CAT_ICON[hook.cat] || { Icon: null, color: "#36405E" };
                      return (
                        <div style={{
                          boxSizing: "border-box",
                          width: 40, height: 40, borderRadius: "50%",
                          background: "#FFFFFF", border: `1.45px solid ${ci.color}1F`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: ci.color,
                        }}>
                          {ci.Icon ? <ci.Icon size={20} strokeWidth={1.5} color={ci.color}/> : <BrandIcon brand={hook.cardBrand}/>}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: isFeeOrPoints ? 12 : 4 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: isFeeOrPoints ? 4 : 2 }}>
                      <div style={{ fontFamily: FN, fontSize: 14, fontWeight: 500, lineHeight: "21px", color: "#36405E" }}>{hook.title}</div>
                      <div style={{ fontFamily: FN, fontSize: 12, fontWeight: 400, lineHeight: "155%", color: "#808387" }}>{hook.sub}</div>
                    </div>

                    {/* Green-tinted badge for fee/points; redeem button for points */}
                    {isFeeOrPoints && (
                      <div style={{ display: "flex", justifyContent: hook.cat === "points" ? "space-between" : "flex-start", alignItems: "flex-start", gap: 8 }}>
                        <DaysLeftPill label={hook.urgencyLabel}/>
                        {hook.cta && (
                          <button onClick={(e) => { e.stopPropagation(); setOpenHook(hook); }} style={{
                            boxSizing: "border-box",
                            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
                            padding: "6px 8px", height: 27, borderRadius: 5.43,
                            border: "1px solid rgba(17,52,172,0.15)", background: "transparent",
                            fontFamily: FN, fontSize: 10, fontWeight: 600, lineHeight: "150%",
                            color: "#222941", cursor: "pointer",
                          }}>
                            {hook.cta}
                            <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke="#222941" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right chevron (only when no inline redeem button) */}
                  {hook.cat !== "points" && (
                    <div style={{ display: "flex", alignItems: "center", padding: "0 6px 0 0", alignSelf: "stretch", flexShrink: 0 }}>
                      <RowChevron/>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#7A8699", fontFamily: FN, fontSize: 14 }}>
                No actions to show in this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The bottom sheet */}
      {openHook && <ConsiderSheet hook={openHook} onClose={() => setOpenHook(null)} onPrimary={() => handlePrimary(openHook)}/>}
    </div>
  );
}
