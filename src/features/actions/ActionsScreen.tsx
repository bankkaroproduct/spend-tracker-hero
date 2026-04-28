// @ts-nocheck
import { useState } from "react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { NavBar } from "@/components/shared/NavBar";
import { useAppContext } from "@/store/AppContext";
import "@/features/legacy/legacy.css";
import {
  Toast, InfoBS, TxnSheet, ActSheet, GmailNudgeBanner, GmailNudgePopup,
  GmailNudgeSheet, RetroOverlay, VoiceFlowOverlay, CapBS, CatBS, FilterSheet,
} from "@/components/sheets/BottomSheets";
import { ActionsConsiderScreen } from "./ActionsConsiderScreen";
import { ACTIONS_DATA as SIM_ACTIONS_DATA } from "@/data/simulation/legacy";

const USE_NEW_FLOW = true;

const TABS = [
  { key: "All", label: "All Actions" },
  { key: "cap", label: "Credit Limits" },
  { key: "points", label: "Points Expiring" },
  { key: "milestone", label: "Milestones" },
];

const ACTIONS_DATA = SIM_ACTIONS_DATA;

function matchesTab(action, tab) {
  if (tab === "All") return true;
  return action.type === tab;
}

function HsbcLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 4L4 12l8 8 8-8-8-8Z" fill="#DB0011" />
      <path d="M12 7.2L7.2 12 12 16.8 16.8 12 12 7.2Z" fill="#fff" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}

function AxisLogo() {
  return <img src="/legacy-assets/opt/axis-logo-a.png" alt="Axis" style={{ width: 24, height: 24, objectFit: "contain" }} />;
}

export const ActionsScreen = () => {
  if (USE_NEW_FLOW) return <ActionsConsiderScreen/>;

  const {
    hasGmail, actFilter, setActFilter, setScreen, setShowGmailNudgeSheet,
    setActSheet, setCapSheet, setRedeemCard, setRedeemPts, setRedeemResult, setRedeemPref, openCard,
  } = useAppContext();

  const selectedTab = TABS.some((t) => t.key === actFilter) ? actFilter : "All";
  const filtered = ACTIONS_DATA.filter((a) => matchesTab(a, selectedTab));

  const handleAction = (action) => {
    if (action.redeem) {
      setScreen("redeem");
      setRedeemCard(null); setRedeemPts(""); setRedeemResult(null); setRedeemPref(null);
      return;
    }
    if (action.type === "fee") { openCard(2); return; }
    if (action.type === "cap") { setCapSheet(action); return; }
    if (action.type === "milestone") { setScreen("optimize"); }
  };

  return (
    <div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", position: "relative", background: "#f5f9fa", overflow: "hidden" }}>
      <div data-scroll="1" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", background: "#f5f9fa", paddingBottom: 100 }}>
        <div className="slide-in">
          <FL />

          {/* ── HEADER ── */}
          <div style={{ background: "linear-gradient(135deg, #010411 0%, #543020 100%)", color: "#fff", padding: "0 0 18px" }}>
            <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0", fontFamily: "-apple-system, system-ui", fontSize: 15, fontWeight: 700 }}>
              <span>9:41</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#fff"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></g></svg>
                <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#fff"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z" /><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z" /><circle cx="8" cy="10" r="1.2" /></g></svg>
              </div>
            </div>
            <div style={{ height: 24, padding: "0 16px", display: "flex", alignItems: "center" }}>
              <div className="legacy-tap" onClick={() => setScreen("home")} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </div>
            </div>
            <div style={{ padding: "8px 16px 0" }}>
              <span style={{ fontFamily: "var(--legacy-serif), Georgia, serif", fontSize: 22, lineHeight: 1.35, fontWeight: 700, letterSpacing: "0", color: "#EAEDF7" }}>Actions to consider</span>
            </div>
          </div>

          {/* ── TAB BAR ── */}
          <div className="legacy-h-rail" style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", gap: 0, borderBottom: "1px solid #d7e2ef", background: "#fff", padding: "0 16px" }}>
            {TABS.map((tab) => {
              const isActive = selectedTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActFilter(tab.key)} style={{ flexShrink: 0, border: "none", background: "transparent", color: isActive ? "#1f2f5f" : "#7f8a9f", fontWeight: isActive ? 700 : 500, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", padding: "14px 12px 12px", borderBottom: isActive ? "2.5px solid #2f4f9f" : "2.5px solid transparent", transition: "color 0.2s, border-color 0.2s" }}>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── ACTION LIST ── */}
          <div style={{ padding: "14px 14px 28px" }}>
            {!hasGmail && (
              <div style={{ marginBottom: 12 }}>
                <GmailNudgeBanner line="Unlock all your action items" subline="Connect Gmail for milestone tracking, fee waivers and vouchers" onPress={() => setShowGmailNudgeSheet(true)} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((action, idx) => (
                <div key={idx} className="legacy-tap" onClick={() => handleAction(action)} style={{
                  borderRadius: 8,
                  background: "#fff",
                  border: "1px solid #fff",
                  boxShadow: "0 0.62px 4.35px rgba(53,67,70,0.11)",
                  padding: "14px 12px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  cursor: "pointer",
                }}>
                  {/* Brand icon */}
                  <div style={{ width: 42, height: 42, borderRadius: 21, background: "#fff", border: "1px solid #e9eff7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {action.brand === "axis" ? <AxisLogo /> : <HsbcLogo />}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#202f61", fontSize: 15, lineHeight: 1.35, fontWeight: 600, letterSpacing: "-0.01em" }}>{action.title}</div>
                    {action.desc && <div style={{ marginTop: 4, color: "#7f8a9f", fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}>{action.desc}</div>}

                    {/* Badge + Redeem row */}
                    {(action.badge || action.redeem) && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, gap: 8 }}>
                        {action.badge && (
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 4, background: "linear-gradient(180deg, #E8FBDC 0%, #DDF8CC 100%)", color: "#1F8A3A", fontSize: 10, fontWeight: 700, letterSpacing: "0.11em" }}>{action.badge}</span>
                        )}
                        {action.redeem && (
                          <button onClick={(e) => { e.stopPropagation(); setScreen("redeem"); setRedeemCard(null); setRedeemPts(""); setRedeemResult(null); setRedeemPref(null); }} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(17,52,172,0.15)", background: "#fff", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#1f2f5f", cursor: "pointer" }}>
                            Redeem <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke="#1f2f5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  {action.chevron && (
                    <div style={{ marginTop: 10, flexShrink: 0 }}>
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#7f8a9f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <CapBS />
        <InfoBS />
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "12px 0 5vw", pointerEvents: "none", zIndex: 50 }}>
        <div style={{ pointerEvents: "auto" }}><NavBar /></div>
      </div>

      <TxnSheet />
      <ActSheet />
      <CatBS />
      <FilterSheet />
      <GmailNudgePopup />
      <GmailNudgeSheet />
      <RetroOverlay />
      <VoiceFlowOverlay />
      <Toast />
    </div>
  );
};
