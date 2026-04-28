// @ts-nocheck
import { useMemo, useState } from "react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";
import { CARDS } from "@/data/simulation/legacy";
import { CARD_CATALOGUE } from "@/data/bestCards";

const CARD_IMG_MAP: Record<string, string> = {
  "Axis Flipkart": "/legacy-assets/cards/axis-flipkart.webp",
  "HSBC Travel One": "/legacy-assets/cards/hsbc-travel-one.webp",
  "HSBC Live+": "/legacy-assets/cards/hsbc-live.webp",
  "HDFC Infinia": "/legacy-assets/cards/hdfc-infinia.webp",
  "IDFC First Select": "/legacy-assets/cards/idfc select.webp",
  "Amex Travel Platinum": "/legacy-assets/cards/amex-platinum-travel.webp",
  "American Express Travel Platinum": "/legacy-assets/cards/amex-platinum-travel.webp",
  "AU Zenith": "/legacy-assets/cards/AU-Zenith.webp",
  "ICICI Emeralde": "/legacy-assets/cards/icici-emeralde.webp",
  "SBI Miles": "/legacy-assets/cards/sbi-miles.webp",
  "HDFC Swiggy": "/legacy-assets/cards/Hdfc swiggy.webp",
};

// Build a flat market catalogue of cards from CARD_CATALOGUE keyed by issuing bank.
type CatCard = { bank: string; bankShort: string; name: string; fullName: string; benefit: string; color: string };
const buildCatalog = (): CatCard[] => {
  const list: CatCard[] = [];
  Object.entries(CARD_CATALOGUE).forEach(([bank, cards]: any) => {
    const bankShort = bank.replace(" Bank", "").trim();
    cards.forEach((c: any) => {
      list.push({ bank, bankShort, name: c.name, fullName: `${bankShort} ${c.name}`, benefit: c.benefit, color: c.color });
    });
  });
  // Add Amex Travel Platinum at top (not in CARD_CATALOGUE) — it's the entry point shown in design.
  list.unshift(
    { bank: "American Express", bankShort: "Amex", name: "Travel Platinum", fullName: "American Express Travel Platinum", benefit: "5x MR points on travel", color: "#9CA3AF" },
  );
  // De-duplicate by fullName in case CARD_CATALOGUE has overlaps.
  const seen = new Set<string>();
  return list.filter(c => seen.has(c.fullName) ? false : (seen.add(c.fullName), true));
};

const CATALOG: CatCard[] = buildCatalog();
const BANKS = ["All Cards", "HDFC", "SBI", "ICICI", "Axis", "RBL", "Kotak Mahindra", "IndusInd", "Yes Bank", "Amex", "HSBC"];
// Tiny SVG bank-circle icons (color-coded letter avatars; placeholder for actual bank logos).
const BANK_AVATAR: Record<string, { bg: string; fg: string }> = {
  HDFC: { bg: "#FEE2E2", fg: "#B91C1C" },
  SBI: { bg: "#DBEAFE", fg: "#1E3A8A" },
  ICICI: { bg: "#FFEDD5", fg: "#C2410C" },
  Axis: { bg: "#FEE2E2", fg: "#9F1239" },
  RBL: { bg: "#FEF3C7", fg: "#A16207" },
  "Kotak Mahindra": { bg: "#FEE2E2", fg: "#9F1239" },
  IndusInd: { bg: "#FECACA", fg: "#7F1D1D" },
  "Yes Bank": { bg: "#DBEAFE", fg: "#1E3A8A" },
  Amex: { bg: "#E0E7FF", fg: "#3730A3" },
  HSBC: { bg: "#FEE2E2", fg: "#B91C1C" },
};

const CardThumb = ({ card, size = "md" }: { card: any; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "lg" ? { w: 86, h: 58 } : size === "sm" ? { w: 62, h: 41 } : { w: 62, h: 41 };
  const img = CARD_IMG_MAP[card?.fullName] || CARD_IMG_MAP[card?.name];
  return (
    <div style={{ width: dim.w, height: dim.h, borderRadius: 4.4, overflow: "hidden", flexShrink: 0, position: "relative", boxShadow: "0px 6px 20px rgba(23,59,3,0.18)", border: "0.4px solid rgba(255,255,255,0.2)" }}>
      {img ? (
        <img src={img} alt={card?.fullName || card?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: card?.color || "linear-gradient(135deg,#2d3748,#1a202c)" }} />
      )}
    </div>
  );
};

export const PortfolioCreateScreen = () => {
  const { setScreen, portfolioNew, setPortfolioNew, portfolioEntryCard, setPortfolioEntryCard } = useAppContext();
  const [search, setSearch] = useState("");
  const [bankFilter, setBankFilter] = useState("All Cards");

  const selected: string[] = portfolioNew || [];
  // If there's an entry card from BestCards, ensure it's pre-selected
  const initialSelected = useMemo(() => {
    if (portfolioEntryCard && !selected.includes(portfolioEntryCard)) {
      const next = [portfolioEntryCard, ...selected];
      return next;
    }
    return selected;
  }, [portfolioEntryCard]);
  // sync once
  useState(() => { if (initialSelected !== selected) setPortfolioNew(initialSelected); });

  const sel = portfolioNew || [];

  const toggleCard = (cardFullName: string) => {
    if (sel.includes(cardFullName)) {
      setPortfolioNew(sel.filter((s: string) => s !== cardFullName));
    } else if (sel.length < 3) {
      setPortfolioNew([...sel, cardFullName]);
    }
  };

  // Cards the user already owns — never propagate them in the "add new" list.
  const ownedCardNames = useMemo(() => {
    const owned = new Set<string>();
    CARDS.forEach((c: any) => {
      owned.add(c.name);
      // Add common alias variants seen in the catalogue (e.g., "HSBC Travel One" vs "HSBC Bank Travel One").
      if (c.name === "HSBC Travel One") owned.add("HSBC Travel One");
      if (c.name === "HSBC Live+") owned.add("HSBC Live+");
      if (c.name === "Axis Flipkart") owned.add("Axis Flipkart");
    });
    return owned;
  }, []);

  // Filter cards by bank chip & search query, and exclude cards user already owns.
  const filtered = useMemo(() => {
    return CATALOG.filter(c => {
      if (ownedCardNames.has(c.fullName)) return false;
      if (bankFilter !== "All Cards") {
        if (bankFilter === "Amex" && c.bank !== "American Express") return false;
        if (bankFilter !== "Amex" && !c.bank.toLowerCase().includes(bankFilter.toLowerCase())) return false;
      }
      if (search.trim()) return c.fullName.toLowerCase().includes(search.toLowerCase());
      return true;
    });
  }, [bankFilter, search, ownedCardNames]);

  const proceed = () => {
    if (sel.length === 0) return;
    setScreen("portfolio-results");
  };

  return (
    <div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", background: "#F4F9FA", height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <FL />
      <div data-scroll="1" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
        {/* Dark gradient header */}
        <div style={{ background: "linear-gradient(180deg, #010904 -15%, #00356A 112%)", padding: "0 0 76px", color: "#fff", position: "relative" }}>
          {/* Status bar */}
          <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0", fontFamily: "-apple-system, system-ui", fontSize: 15, fontWeight: 700 }}>
            <span>9:41</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <svg width="17" height="11" viewBox="0 0 17 11"><g fill="#fff"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></g></svg>
              <svg width="16" height="11" viewBox="0 0 16 11"><g fill="#fff"><path d="M8 2a10 10 0 017.5 3.2l-1.3 1.3A8.2 8.2 0 008 3.7a8.2 8.2 0 00-6.2 2.8L.5 5.2A10 10 0 018 2z" /><path d="M8 5.5c1.7 0 3.3.7 4.5 1.9l-1.3 1.3A4.5 4.5 0 008 7.2c-1.2 0-2.4.5-3.2 1.4L3.5 7.4C4.7 6.2 6.3 5.5 8 5.5z" /><circle cx="8" cy="10" r="1.2" /></g></svg>
              <svg width="18" height="11" viewBox="0 0 18 11" fill="none"><rect x="0.5" y="0.5" width="15" height="10" rx="2" stroke="#fff" /><rect x="2.4" y="2.4" width="9.8" height="6.2" rx="1.2" fill="#fff" /><rect x="16" y="3.5" width="1.7" height="4" rx="0.8" fill="#fff" /></svg>
            </div>
          </div>

          {/* Back */}
          <div style={{ padding: "12px 16px 0" }}>
            <div onClick={() => { setPortfolioEntryCard?.(null); setScreen("bestcards"); }} className="legacy-tap" style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 18 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </div>
          </div>

          {/* Title */}
          <div className="legacy-serif" style={{ padding: "0 16px", fontSize: 20, lineHeight: 1.34, fontWeight: 700, color: "#EAEDF7", marginBottom: 26 }}>
            Select the cards you want to add to your portfolio
          </div>

          {/* YOUR CARDS */}
          <div style={{ padding: "0 17px", marginBottom: 14 }}>
            <div style={{ fontSize: 9.3, fontWeight: 700, color: "#D8D8D8", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Your Cards</div>
            <div style={{ display: "flex", gap: 14.6, alignItems: "center" }}>
              {CARDS.map((c: any) => <CardThumb key={c.name} card={c} size="lg" />)}
            </div>
          </div>
        </div>

        {/* White panel — overlapping the header (top:-26) for the rounded transition */}
        <div style={{ background: "#F4F9FA", borderRadius: "24px 24px 0 0", marginTop: -26, paddingTop: 22, paddingBottom: 24, position: "relative", zIndex: 2 }}>
          {/* NEW CARDS TO ADD */}
          <div style={{ padding: "0 17px" }}>
            <div style={{ fontSize: 9.3, fontWeight: 700, color: "#2F374B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>New Cards to Add (Upto 3)</div>
            <div style={{ display: "flex", gap: 14.6, alignItems: "center" }}>
              {[0, 1, 2].map(i => {
                const c = sel[i] ? CATALOG.find(x => x.fullName === sel[i]) || { fullName: sel[i], name: sel[i], color: "#1a202c" } : null;
                if (c) {
                  return (
                    <div key={i} style={{ position: "relative" }}>
                      <CardThumb card={c} size="lg" />
                      <button onClick={() => toggleCard(c.fullName)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: 9, border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, lineHeight: 1, fontFamily: FN }}>×</button>
                    </div>
                  );
                }
                return (
                  <div key={i} style={{ width: 86, height: 58, borderRadius: 4.4, background: "rgba(225,228,228,0.6)", border: "1.1px dashed rgba(120,120,120,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 22, color: "rgba(54,54,54,0.45)", fontWeight: 300, lineHeight: 1 }}>+</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "20px 16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 41, borderRadius: 8, border: "1px solid #D3E4FA", background: "#FFFFFF", padding: "0 12px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="rgba(28,42,52,0.5)" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="rgba(28,42,52,0.5)" strokeWidth="2" strokeLinecap="round" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Card Name" style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, fontFamily: FN, color: "#1C2A33", width: "100%", letterSpacing: "0.02em" }} />
            </div>
          </div>

          {/* Bank filter chips (horizontal scroll) */}
          <div style={{ marginTop: 18 }}>
            <div data-scroll="1" style={{ display: "flex", gap: 8, padding: "0 16px", overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
              {BANKS.map(b => {
                const active = bankFilter === b;
                const av = BANK_AVATAR[b];
                return (
                  <button key={b} onClick={() => setBankFilter(b)} style={{ flexShrink: 0, height: 34, padding: "6px 8px", display: "inline-flex", alignItems: "center", gap: 6, background: active ? "#1F2741" : "linear-gradient(90deg, #FFFFFF 0%, #F5FAFF 100%)", border: "1px solid rgba(23,51,144,0.06)", borderRadius: 6, boxShadow: "0px 1px 2px rgba(0,0,0,0.06)", cursor: "pointer", fontFamily: FN, fontSize: 12, fontWeight: 600, color: active ? "#FFFFFF" : "#1C2A33" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", border: active ? "1px solid rgba(0,100,224,0.08)" : "1px solid rgba(35,99,225,0.08)", background: b === "All Cards" ? (active ? "#FFFFFF" : "#F8FAFD") : (av?.bg || "#EEF2F7"), display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {b === "All Cards" ? (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><rect x="0.5" y="0.5" width="11" height="6.5" rx="1" stroke={active ? "#121E43" : "#121E43"} strokeWidth="1" /><rect x="2.5" y="2.5" width="3" height="0.7" fill={active ? "#121E43" : "#121E43"} /></svg>
                      ) : (
                        <span style={{ fontSize: 9, fontWeight: 700, color: av?.fg || "#1C2A33" }}>{b.replace(/[^A-Z]/g, "").substring(0, 2) || b.substring(0, 2).toUpperCase()}</span>
                      )}
                    </span>
                    <span>{b}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 13, padding: "16px 16px 0" }}>
            {filtered.map(c => {
              const isSelected = sel.includes(c.fullName);
              const img = CARD_IMG_MAP[c.fullName] || CARD_IMG_MAP[c.name];
              return (
                <button key={c.fullName} onClick={() => toggleCard(c.fullName)} disabled={!isSelected && sel.length >= 3} style={{ all: "unset", boxSizing: "border-box", width: "100%", height: 61, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12, background: isSelected ? "linear-gradient(180deg,#F7FAF7 0%, #ECF9F0 26.22%)" : "#FFFFFF", boxShadow: isSelected ? "0px 1px 8px rgba(22,126,6,0.1)" : "0px 2px 8px rgba(0,0,0,0.08)", borderRadius: isSelected ? 6 : 10, cursor: !isSelected && sel.length >= 3 ? "not-allowed" : "pointer", opacity: !isSelected && sel.length >= 3 ? 0.5 : 1 }}>
                  <div style={{ width: 62, height: 41, borderRadius: 3.1, overflow: "hidden", flexShrink: 0, boxShadow: "0px 5px 20px rgba(23,59,3,0.1)", border: "0.26px solid rgba(255,255,255,0.2)", background: c.color }}>
                    {img && <img src={img} alt={c.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 500, color: isSelected ? "#365E36" : "#36405E", lineHeight: "18px", textAlign: "left" }}>{c.fullName}</div>
                  {isSelected ? (
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(151deg, #0ED28D 7.75%, #14875F 91.86%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 2px #50F7BC" }}>
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  ) : (
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ flexShrink: 0 }}><path d="M1 1l4 4-4 4" stroke="rgba(34,41,65,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 24, fontSize: 12, color: "#7B8197" }}>No cards match your search</div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky footer CTA — Frame 1991635095 */}
      <div style={{ flexShrink: 0, height: 76, background: "#FFFFFF", borderTop: "1px solid rgba(5,34,73,0.15)", boxShadow: "0px -2px 10px rgba(50,43,72,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
        <button onClick={proceed} disabled={sel.length === 0} style={{ width: 328, maxWidth: "100%", height: 48.51, borderRadius: 10.17, border: "none", background: sel.length === 0 ? "linear-gradient(90deg, #6B7280 0%, #4B5563 100%)" : "linear-gradient(90deg, #222941 0%, #101C43 100%)", padding: "15.26px 20.34px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8.48, boxShadow: "0.29px 0.29px 0.41px -0.49px rgba(0,0,0,0.26), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247), 1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 3.85px 3.85px 5.44px -1.96px rgba(0,0,0,0.192), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2), -0.33px -0.33px 0px rgba(0,0,0,0.69), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)", cursor: sel.length === 0 ? "not-allowed" : "pointer", fontFamily: FN, opacity: sel.length === 0 ? 0.6 : 1 }}>
          <span style={{ width: 130, fontSize: 12, fontWeight: 600, color: "#E8E8E8", lineHeight: "150%", textAlign: "center" }}>See portfolio results →</span>
        </button>
      </div>
    </div>
  );
};
