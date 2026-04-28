// @ts-nocheck
import { NavBar } from "@/components/shared/NavBar";
import { BottomSheets } from "@/components/sheets/BottomSheets";
import { ACTIONS } from "@/data/simulation/legacy";
import { useAppContext } from "@/store/AppContext";
import "./legacy.css";
import { CardPromo, HeroSection, ImportantActions, SpendAnalysis, ToolsSection, TransactionAnalysis, TransactionsPreview } from "./LegacyShared";

function toLegacyTxn(t, idx) {
  return {
    id: idx,
    brand: (t.brand || "").toLowerCase().replace(/\s+/g, ""),
    merchant: t.brand || "Transaction",
    cardLine: `${t.via || "Card"} | ${t.date || ""}`,
    amount: `₹${(t.amt || 0).toLocaleString("en-IN")}`,
    saved: t.saved ? `₹${t.saved}` : null,
    savedColor: t.saved ? "#078146" : "#eb8807",
    cta: { variant: t.unaccounted ? "needsdata" : t.saved ? "best" : "switch", text: t.unaccounted ? "Need more details about this transaction" : (t.tag || "Used best card for this") },
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
        <ImportantActions onViewAll={() => setScreen("actions")} onAction={(i) => setActSheet(ACTIONS[i % ACTIONS.length])} />
        <ToolsSection onOpenCalc={openCalc} onOpenBestCards={() => setScreen("bestcards")} onOpenRedeem={openRedeem} />
        <div style={{ height: 10, background: "rgba(23,73,47,0.06)", marginTop: 20 }} />
        <TransactionAnalysis timeWindow="Last 365 Days" />
        <TransactionsPreview
          transactions={transactions}
          onOpenTransactions={() => setScreen("transactions")}
          onFilterClick={() => setFilterSheet(true)}
          activeChip={filters[0] || null}
          onChipClick={(chip) => {
            const key = chip === "via Axis Flipkart Card" ? "Flipkart" : chip === "via HSBC Live +" ? "Live+" : chip === "via HSBC Travel One" ? "Travel One" : chip;
            toggleFilter(key);
          }}
          onRowClick={(t) => (t.raw?.unaccounted ? setCatSheet(t.raw) : setTxnSheet(t.raw))}
          onUnaccountedClick={() => setScreen("transactions")}
        />
        <CardPromo onClick={() => setScreen("bestcards")} />
        <div style={{ height: 10, background: "rgba(23,73,47,0.06)", marginTop: 28 }} />
        <SpendAnalysis timeWindow="Last 365 Days" initialTab="Categories" />
        <div style={{ height: 40 }} />
      </div>

      <BottomSheets />
    </div>
  );
}
