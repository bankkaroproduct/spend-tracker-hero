// @ts-nocheck
import { NavBar } from "@/components/shared/NavBar";
import { BottomSheets } from "@/components/sheets/BottomSheets";
import { useAppContext } from "@/store/AppContext";
import { getTransactionScenario } from "@/data/simulation/txnScenario";
import "./legacy.css";
import { ActionBar, TransactionRow, UnaccountedRow, groupByDate } from "./LegacyShared";

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 3l-4 4 4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LegacyTransactionsScreen() {
  const { setScreen, filtered, sortBy, setSortBy, filters, setFilters, setFilterSheet, setTxnSheet, setCatSheet } = useAppContext();
  const sortLabel = sortBy === "Recent" ? "Sort By" : sortBy;
  const mapTxn = (t, idx) => {
    const scenario = t.unaccounted ? null : getTransactionScenario(t);
    return {
      id: idx,
      brand: (t.brand || "").toLowerCase().replace(/\s+/g, ""),
      merchant: t.brand || "Transaction",
      cardLine: `${t.via || "Card"} | ${t.date || ""}`,
      amount: `₹${(t.amt || 0).toLocaleString("en-IN")}`,
      saved: t.saved != null ? `₹${t.saved}` : null,
      scenario,
      raw: t,
    };
  };
  const transactions = (filtered || []).map(mapTxn);
  const groups = groupByDate(transactions);
  const chips = ["Unaccounted", "via Axis Flipkart Card", "via HSBC Live +", "via HSBC Travel One"];
  const activeChip = filters[0] || null;

  return (
    <div style={{ fontFamily: "var(--legacy-sans)", maxWidth: 400, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <div data-scroll="1" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", background: "#f5f9fa", paddingBottom: 100 }}>
      <div style={{ background: "linear-gradient(180deg, #010411 -15.07%, #0B366B 112.18%)", color: "#eaedf7", padding: "12px 20px 22px", position: "relative" }}>
        <img src="/ui/statusbar.webp" alt="" style={{ width: "100%", height: "auto", display: "block", marginBottom: 10 }} />
        <div onClick={() => setScreen("home")} className="legacy-tap" aria-label="Back" style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <BackArrow />
        </div>
        <h1 className="legacy-serif" style={{ fontSize: 34, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: "12px 0 0" }}>
          Transactions
        </h1>
      </div>

      <div style={{ background: "#f5f9fa", paddingTop: 18, paddingBottom: 40, minHeight: 600 }}>
        <ActionBar
          sort={sortLabel}
          onSortClick={() => setSortBy(sortBy === "Recent" ? "Most Spent" : sortBy === "Most Spent" ? "Least Spent" : "Recent")}
          filter="Filter"
          onFilterClick={() => setFilterSheet(true)}
          chips={chips}
          activeChip={activeChip}
          onChipClick={(chip) => {
            if (chip === activeChip) {
              setFilters([]);
              return;
            }
            const key = chip === "via Axis Flipkart Card" ? "Flipkart" : chip === "via HSBC Live +" ? "Live+" : chip === "via HSBC Travel One" ? "Travel One" : chip;
            setFilters([key]);
          }}
        />

        {groups.map((g) => (
          <div key={g.date} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px 10px" }}>
              <span className="legacy-overline" style={{ flexShrink: 0 }}>{g.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 1.55, flex: 1, opacity: 0.4 }}><div style={{ width: 3.09, height: 3.09, background: "#848CA0", transform: "rotate(45deg)", flexShrink: 0 }}/><div style={{ flex: 1, height: 0, borderBottom: "0.62px solid", borderImage: "linear-gradient(90deg,#848CA0,rgba(48,51,58,0)) 1" }}/></div>
            </div>
            <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 18 }}>
              {g.items.map((t) => {
                if (t.raw?.unaccounted) return <UnaccountedRow key={`u-${t.id}`} onClick={() => setCatSheet(t.raw)} />;
                return <TransactionRow key={t.id} {...t} onClick={() => setTxnSheet(t.raw)} />;
              })}
            </div>
          </div>
        ))}

        {groups.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "rgba(74,83,112,0.7)", fontSize: 13 }}>No transactions match this filter.</div>}
      </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "12px 0 5vw", pointerEvents: "none", zIndex: 50 }}>
        <div style={{ pointerEvents: "auto" }}>
          <NavBar />
        </div>
      </div>
      <BottomSheets />
    </div>
  );
}
