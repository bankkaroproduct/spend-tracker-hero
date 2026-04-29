// @ts-nocheck
import { useState } from "react";
import { NavBar } from "@/components/shared/NavBar";
import { BottomSheets } from "@/components/sheets/BottomSheets";
import { CONSIDER_HOOKS } from "@/data/actionsConsider";
import { ConsiderSheet } from "@/features/actions/ActionsConsiderScreen";
import { useAppContext } from "@/store/AppContext";
import { getTransactionScenario } from "@/data/simulation/txnScenario";
import "./legacy.css";
import { CardPromo, HeroSection, ImportantActions, SpendAnalysis, ToolsSection, TransactionAnalysis, TransactionsPreview } from "./LegacyShared";

const URGENCY_RANK: Record<string, number> = { now: 0, soon: 1, later: 2, info: 3 };
const TOP_HOOKS = [...CONSIDER_HOOKS]
  .sort((a, b) => (URGENCY_RANK[a.urgency] ?? 9) - (URGENCY_RANK[b.urgency] ?? 9));

function toLegacyTxn(t, idx) {
  const scenario = t.unaccounted ? null : getTransactionScenario(t);
  return {
    id: idx,
    brand: (t.brand || "").toLowerCase().replace(/\s+/g, ""),
    merchant: t.brand || "Transaction",
    cardLine: `${t.via || "Card"} | ${t.date || ""}`,
    amount: `₹${(t.amt || 0).toLocaleString("en-IN")}`,
    saved: t.saved != null ? `₹${t.saved}` : null,
    scenario,
    cta: t.unaccounted ? { variant: "needsdata", text: "Need more details about this transaction" } : null,
    raw: t,
  };
}

export function LegacyHomeScreen() {
  const ctx = useAppContext();
  const {
    filtered,
    setScreen,
    openCard,
    setInfoSheet,
    setSelBrand,
    setCalcAmt,
    setCalcResult,
    setSearchQ,
    setRedeemCard,
    setRedeemPts,
    setRedeemResult,
    setRedeemPref,
    setActSheet,
    setTxnSheet,
    setCatSheet,
    setFilterSheet,
    toggleFilter,
    filters,
  } = ctx;
  const transactions = (filtered || []).slice(0, 4).map(toLegacyTxn);

  const [consideringHook, setConsideringHook] = useState<any>(null);
  const handleConsiderPrimary = (hook: any) => {
    if (!hook) return;
    if (hook.cat === "points") {
      setRedeemCard(null); setRedeemPts(""); setRedeemResult(null); setRedeemPref(null);
      setConsideringHook(null); setScreen("redeem"); return;
    }
    if (hook.cat === "credit") { setConsideringHook(null); return; }
    if (hook.cat === "fee" || hook.cat === "cap" || hook.cat === "milestone") {
      setConsideringHook(null); setScreen("calculate"); return;
    }
    if (hook.cat === "benefit") {
      setConsideringHook(null);
      openCard(2);
      return;
    }
  };

  const openCalc = () => {
    setScreen("calc");
    setSelBrand(null);
    setCalcAmt("");
    setCalcResult(null);
    setSearchQ("");
  };

  const openRedeem = () => {
    setScreen("redeem");
    setRedeemCard(null);
    setRedeemPts("");
    setRedeemResult(null);
    setRedeemPref(null);
  };

  return (
    <div style={{ fontFamily: "var(--legacy-sans)", maxWidth: 400, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <div data-scroll="1" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", background: "#f5f9fa", paddingBottom: 100 }}>
        <HeroSection
          onOpenOptimize={() => setScreen("optimize")}
          onOpenCards={() => openCard(0)}
          onOpenCard={(i) => openCard(i)}
          onAddCard={() => setInfoSheet({ title: "Add a Card", desc: "Link a new credit card to improve spend recommendations and reward tracking." })}
        />
        <ImportantActions hooks={TOP_HOOKS} onViewAll={() => setScreen("actions")} onAction={(i) => setConsideringHook(TOP_HOOKS[i] || null)} />
        <ToolsSection onOpenCalc={openCalc} onOpenBestCards={() => setScreen("bestcards")} onOpenRedeem={openRedeem} />
        <div style={{ height: 10, background: "rgba(23,73,47,0.06)", marginTop: 20 }} />
        <TransactionAnalysis timeWindow="Last 365 Days" />
        <TransactionsPreview
          transactions={transactions}
          onOpenTransactions={() => setScreen("transactions")}
          onFilterClick={() => setFilterSheet(true)}
          activeChip={filters[0] || null}
          onChipClick={(chip) => {
            const key = chip === "via Axis Flipkart Card" ? "Flipkart" : chip === "via HSBC Live+" ? "Live+" : chip === "via HSBC Travel One" ? "Travel One" : chip;
            toggleFilter(key);
          }}
          onRowClick={(t) => (t.raw?.unaccounted ? setCatSheet(t.raw) : setTxnSheet(t.raw))}
          onUnaccountedClick={() => setCatSheet({
            brand: "Unaccounted",
            amt: 3000,
            date: "27 Jan",
            via: "UPI",
            unaccounted: true,
            sms: "Rs.3,000 debited from your A/c via UPI on 27-Jan. Ref UPI/427100027842. Avbl Bal Rs.42,150.",
          })}
        />
        <div style={{ padding: "20px 20px 4px", display: "flex", justifyContent: "center" }}>
          <button
            className="legacy-tap"
            onClick={() => setScreen("transactions")}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              height: 38, padding: "0 18px",
              background: "#FFFFFF", border: "1px solid rgba(36,45,74,0.12)",
              borderRadius: 999,
              boxShadow: "0 1px 4px rgba(63,66,70,0.06)",
              fontFamily: "var(--legacy-sans)", fontSize: 12, fontWeight: 600, color: "rgb(54,64,94)",
              cursor: "pointer",
            }}
          >
            View All Transactions
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M3.5 2L7 5.5L3.5 9" stroke="rgb(54,64,94)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <CardPromo onClick={() => setScreen("bestcards")} />
        <div style={{ height: 10, background: "rgba(23,73,47,0.06)", marginTop: 28 }} />
        <SpendAnalysis timeWindow="Last 365 Days" initialTab="Categories" />
        <div style={{ height: 40 }} />
      </div>

      <BottomSheets />
      {consideringHook && (
        <ConsiderSheet
          hook={consideringHook}
          onClose={() => setConsideringHook(null)}
          onPrimary={() => handleConsiderPrimary(consideringHook)}
        />
      )}
    </div>
  );
}
