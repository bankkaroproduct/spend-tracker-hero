// @ts-nocheck
import { CreditCard, ArrowLeft, X, Search, Check, ChevronRight, Lock, Mic, Clock, Wallet, Gift } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { f } from "@/lib/format";
import { FL } from "@/components/shared/FontLoader";
import { Tag } from "@/components/shared/Tag";
import { SemiGauge, DotDiv } from "@/components/shared/Primitives";
import { ActionCard } from "@/components/shared/ActionCard";
import { Circles } from "@/components/shared/Circles";
import { ACTIONS } from "@/data/actions";
import { SPEND_CATS, TOTAL_ACC } from "@/data/spend";
import { CARD_CATALOGUE } from "@/data/bestCards";
import { SEMI_CARDS } from "@/data/cards";
import { VoiceFlowOverlay, SkipConfirmSheet } from "@/components/sheets/BottomSheets";
import { useAppContext } from "@/store/AppContext";

export function BuildingScreen() {
  const ctx: any = useAppContext();
  const {
    buildPhase, setBuildPhase, buildSub, buildCardReveal,
    hasGmail, setHasGmail, cardMapping, setCardMapping,
    showCardMappingUI, setShowCardMappingUI,
    mappingStep, setMappingStep, mappingSearchQ, setMappingSearchQ,
    showResolutionSummary, setShowResolutionSummary,
    setShowSkipConfirm, setVoiceCardIndex, setShowVoiceFlow,
    setVoiceTranscript, setVoiceMatch,
    savePhase, setSavePhase, toolStep, reminderStep, finalLoad,
    buildRef, setScreen, setMappingCompleted, setUserFlag,
    startGmailFlow, getFilteredActions, setToast,
  } = ctx;

  const Orb = ({ icon, text, sub }: any) => (
    <div key={"orb-" + buildPhase} className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "40px 32px" }}>
      <div style={{ width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle,#60a5fa,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(37,99,235,0.3),0 0 120px rgba(37,99,235,0.1)", border: "4px solid rgba(255,255,255,0.4)", marginBottom: 24, animation: "pulse 2s ease-in-out infinite" }}>
        <span style={{ fontSize: 40, color: "#fff" }}>{icon}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, textAlign: "center", lineHeight: 1.5 }}>{text}</div>
      {sub && <div style={{ fontSize: 13, color: C.sub, textAlign: "center", marginTop: 8 }}>{sub}</div>}
    </div>
  );

  const semiCards = [{ bank: "HSBC Bank", last4: "7891", color: "#0c2340" }, { bank: "Axis Bank", last4: "4521", color: "#5b2c8e" }, { bank: "HSBC Bank", last4: "3364", color: "#006d5b" }];
  const fullCards = [{ name: "HSBC Travel One", bank: "HSBC", last4: "7891", color: "#0c2340", accent: "#1a5276" }, { name: "Axis Flipkart", bank: "Axis", last4: "4521", color: "#5b2c8e", accent: "#8b5cf6" }, { name: "HSBC Live+", bank: "HSBC", last4: "3364", color: "#006d5b", accent: "#00a086" }];
  const bCardName = (idx: number) => { const c = semiCards[idx]; if (!c) return "Card"; const mapped = cardMapping[idx] && cardMapping[idx] !== "Other"; return mapped ? c.bank.replace(" Bank", "") + " " + cardMapping[idx] : c.bank + " ••" + c.last4; };
  const bCard1 = bCardName(1);
  const bTxns = [
    { brand: "Amazon", icon: "📦", amt: 3500, date: "28 Jan", via: bCardName(0), saved: 80, missed: null, tag: "Best card for this brand", tagColor: C.dkGreen, tagBg: "#EAF3DE" },
    { brand: "Flipkart", icon: "🛒", amt: 2800, date: "26 Jan", via: bCardName(1), saved: 140, missed: null, tag: "Best card for this brand", tagColor: C.dkGreen, tagBg: "#EAF3DE" },
    { brand: "Swiggy", icon: "🍔", amt: 900, date: "25 Jan", via: bCardName(0), saved: 5, missed: 30, tag: "Use " + bCard1 + " — saves ₹30", tagColor: C.orange, tagBg: "#FAEEDA" },
    { brand: "Uber", icon: "🚗", amt: 1200, date: "24 Jan", via: bCardName(2), saved: 18, missed: 30, tag: "Use " + bCard1 + " — saves ₹30", tagColor: C.orange, tagBg: "#FAEEDA" },
    { brand: "MakeMyTrip", icon: "✈️", amt: 5000, date: "22 Jan", via: bCardName(0), saved: 150, missed: null, tag: "Best card for this brand", tagColor: C.dkGreen, tagBg: "#EAF3DE" },
  ];

  /* Card Mapping UI (manual) */
  if (showCardMappingUI) {
    const curBank = SEMI_CARDS[mappingStep]?.bank;
    const alreadyMapped = Object.entries(cardMapping).filter(([k, v]: any) => v && v !== "Other" && parseInt(k) !== mappingStep).map(([, v]: any) => v);
    const catalogueList = (CARD_CATALOGUE[curBank] || []).filter((c: any) => !mappingSearchQ || c.name.toLowerCase().includes(mappingSearchQ.toLowerCase()));
    return (<div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}><FL />
      <div style={{ background: C.white, padding: "44px 16px 0", borderBottom: "1px solid " + C.brd }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div onClick={() => { setShowCardMappingUI(false); setScreen("detail"); }} style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ArrowLeft size={16} strokeWidth={1.5} color={C.text} /></div>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Identify your cards</span>
          </div>
          <div onClick={() => setShowSkipConfirm(true)} style={{ padding: "6px 14px", borderRadius: 16, background: C.bg, border: "1px solid rgba(0,0,0,0.05)", fontSize: 12, fontWeight: 600, color: C.sub, cursor: "pointer" }}>Skip →</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, paddingBottom: 16 }}>
          {semiCards.map((c, i) => { const done = cardMapping[i] && cardMapping[i] !== "Other"; const current = i === mappingStep; return (
            <div key={i} onClick={() => setMappingStep(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", opacity: current ? 1 : 0.5, transition: "all 0.3s ease", position: "relative" }}>
              <div style={{ width: current ? 100 : 80, height: current ? 145 : 115, borderRadius: 12, background: `linear-gradient(155deg,${c.color} 0%,${c.color}dd 50%,${c.color}99 100%)`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 10px", boxShadow: current ? "0 8px 24px rgba(0,0,0,0.25)" : "0 4px 12px rgba(0,0,0,0.12)", position: "relative", overflow: "hidden", border: current ? "2px solid " + C.blue : "2px solid transparent", transition: "all 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 17, borderRadius: 3, background: "linear-gradient(135deg,#d4a017,#f0c040)" }} />
                  {done && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={10} strokeWidth={2.5} color="#fff" /></div>}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}>{c.last4}</div>
                </div>
                <div style={{ position: "absolute", right: -20, top: -20, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                {current && <div onClick={e => { e.stopPropagation(); setVoiceCardIndex(i); setShowVoiceFlow(true); setVoiceTranscript(""); setVoiceMatch(null); }} style={{ position: "absolute", bottom: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid rgba(255,255,255,0.3)" }}><Mic size={13} strokeWidth={1.5} color="#fff" /></div>}
              </div>
              <div style={{ textAlign: "center", marginTop: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: current ? C.text : C.dim }}>{done ? c.bank.replace(" Bank", "") + " " + cardMapping[i] : c.bank.replace(" Bank", "")}</div>
                <div style={{ fontSize: 10, color: C.dim }}>XXXX {c.last4}</div>
              </div>
            </div>
          ); })}
        </div>
        <div style={{ display: "flex", gap: 6, paddingBottom: 14 }}>
          {SEMI_CARDS.map((_: any, idx: number) => { const done = cardMapping[idx] && cardMapping[idx] !== "Other"; const current = idx === mappingStep; return (<div key={idx} style={{ flex: current ? 2 : 1, height: 4, borderRadius: 2, background: done ? C.green : current ? C.blue : C.brd, transition: "all 0.3s ease" }} />); })}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: C.white, borderRadius: 16, border: `1.5px solid ${mappingSearchQ ? C.blue : C.brd}`, marginBottom: 22 }}>
          <Search size={16} strokeWidth={1.5} color={C.dim} />
          <input placeholder={`Search ${curBank.replace(" Bank", "")} cards`} value={mappingSearchQ} onChange={e => setMappingSearchQ(e.target.value)} style={{ border: "none", background: "none", outline: "none", fontSize: 13, color: C.text, fontFamily: FN, width: "100%", fontWeight: 600 }} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>{curBank.replace(" Bank", "")} Cards</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {catalogueList.map((card: any) => { const isUsed = alreadyMapped.includes(card.name); const isSelected = cardMapping[mappingStep] === card.name; return (<div key={card.name} onClick={() => {
            if (isUsed) { setToast("⚠️ You've already added " + curBank.replace(" Bank", "") + " " + card.name + " to another card"); return; }
            if (isSelected) { const newMapping = { ...cardMapping }; delete newMapping[mappingStep]; setCardMapping(newMapping); return; }
            const newMapping = { ...cardMapping, [mappingStep]: card.name };
            setCardMapping(newMapping);
            setMappingSearchQ("");
          }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", background: isSelected ? C.greenBg : isUsed ? "#f9fafb" : C.white, borderRadius: 16, border: isSelected ? `1.5px solid ${C.greenBrd}` : `1px solid ${C.brd}`, cursor: "pointer", opacity: isUsed ? 0.45 : 1 }}>
            <div style={{ width: 48, height: 32, borderRadius: 6, background: card.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}><CreditCard size={14} strokeWidth={1.5} color="rgba(255,255,255,0.5)" /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: isUsed ? C.dim : C.text }}>{curBank.replace(" Bank", "")} {card.name}</div>{isUsed && <div style={{ fontSize: 10, color: C.orange, fontWeight: 600, marginTop: 2 }}>Already added</div>}</div>
            {isSelected && <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={13} strokeWidth={2.5} color="#fff" /></div>}
            {!isSelected && !isUsed && <ChevronRight size={18} strokeWidth={1.5} color={C.dim} />}
            {isUsed && <Lock size={14} strokeWidth={1.5} color={C.dim} />}
          </div>); })}
        </div>
        {cardMapping[mappingStep] && cardMapping[mappingStep] !== "Other" && (() => {
          const allMapped = SEMI_CARDS.every((_: any, idx: number) => cardMapping[idx] && cardMapping[idx] !== "Other");
          const unmappedCount = SEMI_CARDS.filter((_: any, idx: number) => !cardMapping[idx] || cardMapping[idx] === "Other").length;
          const hasNext = SEMI_CARDS.some((_: any, idx: number) => idx !== mappingStep && (!cardMapping[idx] || cardMapping[idx] === "Other"));
          const nextUnmapped = SEMI_CARDS.findIndex((_: any, idx: number) => idx !== mappingStep && (!cardMapping[idx] || cardMapping[idx] === "Other"));
          return (<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "linear-gradient(0deg,#f5f6f8 80%,transparent)", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {!allMapped && <div style={{ fontSize: 12, fontWeight: 600, color: C.orange, textAlign: "center" }}>Please identify {unmappedCount} more card{unmappedCount > 1 ? "s" : ""} to continue</div>}
            <div onClick={() => {
              setMappingSearchQ("");
              if (allMapped) { setShowCardMappingUI(false); setShowResolutionSummary(true); }
              else if (hasNext && nextUnmapped >= 0) setMappingStep(nextUnmapped);
            }} style={{ maxWidth: 400, width: "100%", padding: "16px", borderRadius: 16, background: "#111827", color: "#fff", textAlign: "center", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{allMapped ? "Done ✓" : hasNext ? "Next card →" : "Done ✓"}</div>
          </div>);
        })()}
        <div onClick={() => {
          const newMapping = { ...cardMapping, [mappingStep]: "Other" };
          setCardMapping(newMapping);
          setMappingSearchQ("");
          if (mappingStep < SEMI_CARDS.length - 1) setMappingStep(mappingStep + 1);
          else { setShowCardMappingUI(false); setShowResolutionSummary(true); }
        }} style={{ marginTop: 18, padding: "14px", textAlign: "center", fontSize: 13, fontWeight: 600, color: C.sub, cursor: "pointer" }}>Can't find your card? Skip →</div>
      </div>
      <VoiceFlowOverlay />
      <SkipConfirmSheet />
    </div>);
  }

  /* Resolution Summary */
  if (showResolutionSummary) {
    const mappedCount = SEMI_CARDS.filter((_: any, i: number) => cardMapping[i] && cardMapping[i] !== "Other").length;
    return (<div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}><FL />
      <div style={{ flex: 1, overflowY: "auto", padding: "60px 24px 40px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "radial-gradient(circle,#4ade80,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(74,222,128,0.35)", border: "4px solid rgba(255,255,255,0.4)" }}><Check size={32} strokeWidth={2} color="#fff" /></div>
        </div>
        <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 12 }}>{mappedCount} of {SEMI_CARDS.length} cards identified</div>
        <div style={{ textAlign: "center", fontSize: 13, color: C.sub, lineHeight: 1.5, marginBottom: 28 }}>Let's proceed to evaluating your spends</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {SEMI_CARDS.map((c: any, i: number) => { const mapped = cardMapping[i] && cardMapping[i] !== "Other"; return (<div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", background: C.white, borderRadius: 16, border: `1px solid ${C.brd}` }}>
            <div style={{ width: 48, height: 32, borderRadius: 6, background: c.color, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 6, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>••••</span></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{mapped ? `${c.bank.replace(" Bank", "")} ${cardMapping[i]}` : c.bank}</div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>XXXX {c.last4}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: mapped ? C.green : C.orange, background: mapped ? C.greenBg : C.orangeBg, padding: "3px 8px", borderRadius: 4 }}>{mapped ? "MAPPED" : "PARTIAL"}</span>
          </div>); })}
        </div>
        <div onClick={() => { setMappingCompleted(true); setShowResolutionSummary(false); setBuildPhase(5); }} style={{ padding: "18px", borderRadius: 16, background: "#1a2233", color: "#fff", textAlign: "center", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Continue →</div>
        <div onClick={() => { setShowResolutionSummary(false); setShowCardMappingUI(true); setMappingStep(0); setMappingSearchQ(""); }} style={{ padding: "14px", textAlign: "center", fontSize: 13, fontWeight: 600, color: C.blue, cursor: "pointer", marginTop: 4 }}>← Go back and edit</div>
      </div>
    </div>);
  }

  return (<div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", background: "linear-gradient(180deg,#eef5ff 0%,#f8fbff 15%,#fff 30%)", minHeight: "100vh", position: "relative" }}><FL />
    <div onClick={() => { setScreen("home"); }} style={{ position: "absolute", top: 16, right: 16, zIndex: 100, padding: "10px 20px", borderRadius: 12, background: C.white, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>Skip →</div>
    <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:0.9}}@keyframes slideDown{from{transform:translateY(0)}to{transform:translateY(0)}}@keyframes cardSlideIn{0%{transform:translateX(120%) scale(0.85);opacity:0}40%{opacity:1}100%{transform:translateX(0) scale(1);opacity:1}}@keyframes cardGlow{0%{box-shadow:0 8px 32px rgba(0,0,0,0.18)}50%{box-shadow:0 8px 48px rgba(29,78,216,0.35)}100%{box-shadow:0 8px 32px rgba(0,0,0,0.18)}}.card-slide-in{animation:cardSlideIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards}.card-glow{animation:cardGlow 1.2s ease-in-out}`}</style>
    <div ref={buildRef} style={{ overflowY: "auto", height: "100vh", overflowX: "hidden" }}>

      {buildPhase >= 4 && hasGmail && <div className={buildPhase === 4 ? "fade-up" : ""} style={{ padding: "16px 16px 20px", position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg,#eef5ff 0%,#fff 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}><span style={{ fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: 1.5, textTransform: "uppercase" }}>Your Cards</span><span style={{ fontSize: 11, fontWeight: 600, color: C.blue }}>View All &gt;</span></div>
        <div style={{ display: "flex", gap: 16 }}>{fullCards.map((c, i) => (<div key={i} className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animationDelay: `${i * 0.35}s` }}>
          <div style={{ width: 76, height: 50, borderRadius: 10, background: `linear-gradient(135deg,${c.color},${c.accent})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.25)", position: "relative" }}><span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{c.name.split(" ").map(w => w[0]).join("")}</span></div>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{c.name.split(" ").pop()}</span>
        </div>))}</div>
      </div>}

      {buildPhase >= 1 && buildPhase <= 4 && !hasGmail && <div style={{ padding: "20px 0 12px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Cards Detected via SMS</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "0 24px" }}>
          {semiCards.map((c, i) => { const revealed = i <= buildCardReveal; return (
            <div key={i} className={revealed && buildPhase === 1 ? "card-slide-in" : ""} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: revealed ? 1 : 0, transform: revealed ? "translateX(0)" : "translateX(60px)", transition: buildPhase > 1 ? "all 0.4s ease" : "none" }}>
              <div style={{ width: 110, height: 160, borderRadius: 16, background: `linear-gradient(155deg,${c.color} 0%,${c.color}dd 50%,${c.color}99 100%)`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "14px 12px", boxShadow: "0 6px 20px rgba(0,0,0,0.18)", position: "relative", overflow: "hidden" }}>
                <div style={{ width: 28, height: 22, borderRadius: 4, background: "linear-gradient(135deg,#d4a017,#f0c040)", border: "1px solid rgba(255,255,255,0.25)" }} />
                <div style={{ position: "absolute", top: 14, right: 10 }}><CreditCard size={14} strokeWidth={1.5} color="rgba(255,255,255,0.3)" /></div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>{[0, 1, 2].map(g => (<div key={g} style={{ display: "flex", gap: 2 }}>{[0, 1, 2, 3].map(d => (<div key={d} style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />))}</div>))}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 }}>{c.last4}</div>
                </div>
                <div style={{ position: "absolute", right: -30, top: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              </div>
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{c.bank.replace(" Bank", "")}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>XXXX {c.last4}</div>
              </div>
            </div>
          ); })}
        </div>
      </div>}

      {buildPhase >= 5 && !hasGmail && <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg,#eef5ff 0%,#f8fbff 80%,transparent)", padding: "14px 20px 10px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Your Cards</div>
        <div style={{ display: "flex", gap: 16 }}>
          {semiCards.map((c, i) => { const mapped = cardMapping[i] && cardMapping[i] !== "Other"; return (<div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ width: 72, height: 46, borderRadius: 8, background: `linear-gradient(135deg,${c.color},${c.color}cc)`, border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}><CreditCard size={18} strokeWidth={1.5} color="rgba(255,255,255,0.6)" /></div>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{mapped ? cardMapping[i] : c.bank.replace(" Bank", "")}</span>
            <span style={{ fontSize: 10, color: C.dim }}>••{c.last4}</span>
          </div>); })}
        </div>
      </div>}

      {buildPhase === 13 && !savePhase && <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", padding: "40px 0" }}><div style={{ width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle,#4ade80,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(74,222,128,0.4)", border: "4px solid rgba(255,255,255,0.4)" }}><span style={{ fontSize: 32, color: "#fff" }}>✓</span></div><div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 16 }}>Your dashboard is ready!</div><div onClick={() => setSavePhase(true)} style={{ marginTop: 24, padding: "14px 32px", borderRadius: 14, background: "#1a2233", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>See what we found →</div></div>}

      {buildPhase >= 12 && buildPhase < 13 && <Orb icon="📈" text="Now let's summarise everything" />}
      {buildPhase >= 12 && <div className={buildPhase === 12 ? "fade-up" : ""} style={{ padding: "0 24px 28px" }}>
        <div style={{ background: "linear-gradient(180deg,#1a3fc7 0%,#2563eb 40%,#3b82f6 100%)", borderRadius: 20, padding: "24px 20px", color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>You are saving<br />70% less than what you could save</div>
          <div style={{ display: "flex", justifyContent: "center", position: "relative", margin: "12px 0 0" }}><SemiGauge pct={30} /><div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 700 }}>30%</div><div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>Saving efficiency</div></div></div>
          <div style={{ display: "flex", padding: "14px 4px", borderRadius: 14, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", marginTop: 16 }}><div style={{ flex: 1, textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.12)" }}><div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>You saved</div><div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>₹50,000</div></div><div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>You could save</div><div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>₹1,50,000</div></div></div>
        </div>
      </div>}

      {buildPhase === 11 && <Orb icon="⚡" text="Here are some important actions you should consider" />}
      {buildPhase >= 11 && <div className={buildPhase === 11 ? "fade-up" : ""} style={{ padding: "0 24px 28px" }}>
        <DotDiv label="Actions to consider" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{getFilteredActions(ACTIONS).map((a: any, i: number) => (<div key={i} className="fade-up" style={{ animationDelay: `${i * 0.25}s` }}><ActionCard a={a} onCta={() => { }} /></div>))}</div>
      </div>}

      {buildPhase === 10 && <Orb icon="🛠️" text="Here's how we can help you fix that" />}
      {buildPhase >= 10 && <div className={buildPhase === 10 ? "fade-up" : ""} style={{ padding: "0 24px 28px" }}>
        <DotDiv label="Tools to explore" />
        <div style={{ display: "flex", gap: 14 }}>{[
          { hue: "linear-gradient(145deg,#4f46e5,#818cf8)", stroke: "rgba(99,102,241,0.35)", shadow: "rgba(79,70,229,0.25)", label: "Redemption\nFinder", icon: (<div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 0 16px rgba(251,191,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 14, color: "#fff" }}>₹</span></div></div>) },
          { hue: "linear-gradient(145deg,#1d4ed8,#60a5fa)", stroke: "rgba(29,78,216,0.35)", shadow: "rgba(29,78,216,0.25)", label: "Savings\nCalculator", icon: (<div style={{ width: 44, height: 52, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", flexDirection: "column", padding: "8px 7px", gap: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}><div style={{ height: 12, borderRadius: 4, background: "rgba(255,255,255,0.4)" }} /><div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>{[0, 1, 2, 3, 4, 5].map(d => (<div key={d} style={{ borderRadius: 3, background: d === 5 ? "#4ade80" : "rgba(255,255,255,0.2)" }} />))}</div></div>) },
          { hue: "linear-gradient(145deg,#0369a1,#38bdf8)", stroke: "rgba(3,105,161,0.35)", shadow: "rgba(3,105,161,0.25)", label: "Best Cards\nfor you", icon: (<div style={{ position: "relative", width: 52, height: 48 }}><div style={{ position: "absolute", top: 0, left: 4, width: 44, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.15)", transform: "rotate(-3deg)" }} /><div style={{ position: "absolute", bottom: 0, left: 4, width: 44, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", padding: "0 8px" }}><div style={{ width: 14, height: 10, borderRadius: 3, background: "#fbbf24" }} /></div></div>) }
        ].map((t, i) => (<div key={i} className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", animationDelay: `${i * 0.25}s` }}><div style={{ width: "100%", aspectRatio: "1", borderRadius: 20, background: t.hue, border: `1.5px solid ${t.stroke}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${t.shadow}` }}>{t.icon}</div><div style={{ fontSize: 12, fontWeight: 600, color: C.text, textAlign: "center", lineHeight: 1.4, whiteSpace: "pre-line", marginTop: 10 }}>{t.label}</div></div>))}</div>
      </div>}

      {buildPhase === 8 && <Orb icon="🔍" text="Now let's evaluate your transactions and see where you saved and where you missed..." />}
      {buildPhase >= 9 && <div className={buildPhase === 9 && buildSub === 0 ? "fade-up" : ""} style={{ padding: "0 24px 28px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Transaction Analysis</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 8, marginBottom: 28 }}>Showing report from Last 30 days</div>
        {buildSub >= 6 && buildPhase >= 9 && <div className="fade-up" style={{ marginBottom: 12 }}><Circles /></div>}
        {bTxns.map((t, i) => { if (buildPhase === 9 && buildSub < i) return null; const isNew = buildPhase === 9 && buildSub === i; const isPast = buildPhase === 9 && buildSub > i; const showEval = buildPhase > 9 || isPast || isNew; return (<div key={i}><div className={isNew ? "fade-up" : ""} style={{ padding: "14px 0", borderBottom: `1px solid ${C.brd}` }}><div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{t.icon}</div><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t.brand} · ₹{f(t.amt)}</span></div><div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{t.date} | {t.via}</div></div>{showEval && <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>{t.saved !== null && <div className={isNew ? "fade-up" : ""} style={{ textAlign: "right", animationDelay: isNew ? "0.4s" : "0s", opacity: isNew ? 0 : 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>₹{f(t.saved)}</div><div style={{ fontSize: 10, color: C.dim }}>Saved</div></div>}{t.missed > 0 && <div className={isNew ? "fade-up" : ""} style={{ textAlign: "right", animationDelay: isNew ? "0.7s" : "0s", opacity: isNew ? 0 : 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>₹{f(t.missed)}</div><div style={{ fontSize: 10, color: C.orange }}>Missed</div></div>}</div>}</div>{showEval && <div className={isNew ? "fade-up" : ""} style={{ animationDelay: isNew ? "1s" : "0s", opacity: isNew ? 0 : 1 }}><Tag text={t.tag} color={t.tagColor} bg={t.tagBg} /></div>}</div></div></div>
          {i === 0 && buildPhase === 9 && buildSub === 0 && <div className="fade-up" style={{ margin: "12px 0", padding: "18px 22px", borderRadius: 12, background: C.blueBg, border: "1px solid " + C.blueBrd, animationDelay: "1.4s", opacity: 0 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                  <div><span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Saved</span><span style={{ fontSize: 11, color: C.text }}> = what your card earned you on this purchase</span></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange, flexShrink: 0 }} />
                  <div><span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>Missed</span><span style={{ fontSize: 11, color: C.text }}> = extra you could've earned with a different card</span></div>
                </div>
              </div>
            </div>
          </div>}
        </div>); })}
      </div>}

      {buildPhase === 5 && <Orb icon="📊" text="Now, let's fetch your spends and categorise them" />}
      {buildPhase >= 6 && buildPhase <= 7 && <div className={buildPhase === 6 ? "fade-up" : ""} style={{ padding: "0 24px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Spend Analysis</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 8, marginBottom: 28 }}>Based on your spends of Last 365 days</div>
        <div style={{ display: "flex", borderRadius: 10, background: C.white, border: `1px solid ${C.brd}`, padding: 3, marginBottom: 22 }}>{["Categories", "Brands"].map(t => (<div key={t} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8, background: t === "Categories" ? C.blue : "transparent", color: t === "Categories" ? "#fff" : C.sub, fontSize: 13, fontWeight: 700 }}>{t}</div>))}</div>
        <div style={{ padding: 20, borderRadius: 16, background: C.blueBg, border: `1px solid ${C.blueBrd}`, textAlign: "center", marginBottom: 28 }}><div style={{ fontSize: 28, fontWeight: 700, color: C.blue }}>₹{f(TOTAL_ACC)}</div><div style={{ fontSize: 12, color: C.sub, marginTop: 6 }}>Total Accounted Spends</div></div>
        {SPEND_CATS.map((item: any, i: number) => { const mx = Math.max(...SPEND_CATS.map((d: any) => d.amt)); return (<div key={i} className="fade-up" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, marginBottom: 6, background: i % 2 === 0 ? C.white : "transparent", animationDelay: `${i * 0.3}s`, opacity: 0 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.Ic ? <item.Ic size={18} strokeWidth={1.5} color={item.color || C.sub} /> : item.icon}</div><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.name}<span style={{ fontSize: 10, fontWeight: 400, color: C.dim, marginLeft: 16 }}>{item.txns} txns</span></span><span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>₹{f(item.amt)}</span></div><div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}><div style={{ height: "100%", width: `${(item.amt / mx) * 100}%`, borderRadius: 3, background: item.color, transition: "width 1.2s ease" }} /></div></div></div>); })}
      </div>}

      {buildPhase === 3 && <Orb icon="🔎" text="Let's accurately identify your credit cards" />}

      {buildPhase === 2 && <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 200, padding: "0 16px 16px" }}>
        <div style={{ background: C.white, borderRadius: 24, padding: "32px 24px 36px", maxWidth: 400, width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
          <div onClick={() => setBuildPhase(3)} style={{ position: "absolute", right: 16, top: 16, width: 32, height: 32, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.dim, fontSize: 14 }}><X size={16} strokeWidth={1.5} color="currentColor" /></div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: -60, marginBottom: 28 }}><div style={{ width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle,#60a5fa,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(29,78,216,0.3)", border: "4px solid rgba(255,255,255,0.4)" }}><span style={{ fontSize: 28, color: "#fff" }}>✉️</span></div></div>
          <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1.4, marginBottom: 12 }}>Allow us to access your Gmail to identify your cards accurately</div>
          <div style={{ textAlign: "center", fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 28 }}>To identify exact card names and benefits</div>
          <div onClick={() => startGmailFlow("building")} style={{ padding: "18px", borderRadius: 16, background: "#1a2233", color: "#fff", textAlign: "center", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>📧 Allow Gmail Permissions</div>
          <div onClick={() => { if (!hasGmail) setHasGmail(false); setUserFlag("PARTIAL"); setShowCardMappingUI(true); setMappingStep(0); setMappingSearchQ(""); }} style={{ textAlign: "center", padding: "16px 0 0", fontSize: 14, fontWeight: 600, color: C.sub, cursor: "pointer" }}>I'll add cards manually</div>
        </div>
      </div>}

      {buildPhase === 0 && <Orb icon="💳" text="Let's start with fetching your credit cards" />}

      {savePhase && <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 200, background: "rgba(248,249,251,0.97)", backdropFilter: "blur(8px)" }}>
        <style>{`@keyframes orbGrow{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:1}}@keyframes orbPulseHome{0%,100%{box-shadow:0 0 50px rgba(37,99,235,0.3)}50%{box-shadow:0 0 80px rgba(37,99,235,0.5)}}@keyframes ringExpandHome{0%{transform:scale(1);opacity:0.4}100%{transform:scale(2.2);opacity:0}}@keyframes textFadeUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes fadeSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes slideFromRight{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
        {toolStep === 0 && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div style={{ position: "relative", width: 120, height: 120, marginBottom: 28, animation: "orbGrow 0.8s cubic-bezier(0.16,1,0.3,1) both" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ position: "absolute", inset: -16 - i * 20, borderRadius: "50%", border: `1px solid rgba(59,130,246,${0.08 - i * 0.02})` }} />)}
            {[0, 1].map(i => <div key={"r" + i} style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1.5px solid rgba(59,130,246,0.1)", animation: `ringExpandHome 2.5s ease-out ${i * 1.2}s infinite` }} />)}
            <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,#60a5fa 0%,#2563eb 50%,#1d4ed8 100%)", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid rgba(255,255,255,0.5)", animation: "orbPulseHome 2.5s ease-in-out infinite", boxShadow: "0 0 50px rgba(37,99,235,0.3)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#fff" strokeWidth="1.6" /><path d="M2 10H22" stroke="#fff" strokeWidth="1.6" /><rect x="5" y="13" width="5" height="2.5" rx="0.8" fill="rgba(255,255,255,0.7)" /></svg>
            </div>
          </div>
          <div style={{ fontFamily: FN, fontSize: 18, fontWeight: 700, color: "#1a2a4a", lineHeight: 1.4, textAlign: "center", padding: "0 36px", animation: "textFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both" }}>We've got some amazing tools that can help you save more</div>
        </div>}
        {toolStep >= 1 && finalLoad < 1 && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "60px 24px 0", flex: 1, overflowY: "auto" }}>
          <div style={{ flex: 1 }} />
          {reminderStep >= 1 && <div style={{ textAlign: "center", marginBottom: 20, width: "100%", animation: "textFadeUp 0.6s ease both" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2a4a", lineHeight: 1.45 }}>We also send you reminders for important actions on your credit card</div>
          </div>}
          {reminderStep >= 2 && <div style={{ width: "100%", marginBottom: 24 }}>
            {[{ title: "4,820 points expiring soon", sub: "Claim on HSBC Travel One", tag: "IN 6 DAYS", tagColor: C.orange, btn: "Redeem >" }, { title: "30% Credit Limit Left", sub: "on your Axis Flipkart card", tag: "₹86,500 / ₹1,20,000 SPENT", tagColor: C.orange, btn: "Details >" }, { title: "Reward Cap on Dining Spends", sub: "on your HSBC Live+", tag: "SWITCH TO HSBC TRAVEL ONE", tagColor: C.blue, btn: "Details >" }].map((a, i) => i < reminderStep - 1 && (
              <div key={i} style={{ padding: "16px", marginBottom: 10, borderRadius: 16, border: `1px solid ${C.brd}`, background: C.white, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", animation: "fadeSlideUp 0.5s ease both" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${C.brd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Clock size={14} strokeWidth={1.5} color={C.sub} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.title}</div><div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{a.sub}</div></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: a.tagColor, letterSpacing: 0.5, textTransform: "uppercase" }}>{a.tag}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.text, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.brd}` }}>{a.btn}</span>
                </div>
              </div>
            ))}
          </div>}
          {reminderStep >= 1 ? <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, width: "100%" }}>
            <div style={{ flex: 1, height: 1, background: C.brd }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: 2 }}>TOOLS TO EXPLORE</span>
            <div style={{ flex: 1, height: 1, background: C.brd }} />
          </div> : <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2a4a", lineHeight: 1.45 }}>{toolStep === 1 ? "Finds your best card for every spend. So you never miss out." : toolStep === 2 ? "Want the card that saves you most? We've got you" : "Find the best ways to redeem your points."}</div>
          </div>}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "center" }}>
            <div style={{ width: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 20, background: "linear-gradient(145deg,#4f46e5,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(79,70,229,0.25)" }}><Wallet size={36} strokeWidth={1.5} color="#fff" /></div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text, textAlign: "center", lineHeight: 1.4 }}>Savings{"\n"}Finder</div>
            </div>
            {toolStep >= 2 && <div style={{ width: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "slideFromRight 0.6s ease both" }}>
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 20, background: "linear-gradient(145deg,#1d4ed8,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(29,78,216,0.25)" }}><CreditCard size={36} strokeWidth={1.5} color="#fff" /></div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text, textAlign: "center", lineHeight: 1.4 }}>Best Cards{"\n"}for you</div>
            </div>}
            {toolStep >= 3 && <div style={{ width: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "slideFromRight 0.6s ease both" }}>
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 20, background: "linear-gradient(145deg,#0369a1,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(3,105,161,0.25)" }}><Gift size={36} strokeWidth={1.5} color="#fff" /></div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text, textAlign: "center", lineHeight: 1.4 }}>Redeem{"\n"}Points</div>
            </div>}
          </div>
          <div style={{ flex: 1 }} />
        </div>}
        {finalLoad >= 1 && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div style={{ position: "relative", width: 120, height: 120, marginBottom: 28, animation: "orbGrow 0.8s ease both" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ position: "absolute", inset: -16 - i * 20, borderRadius: "50%", border: `1px solid rgba(59,130,246,${0.08 - i * 0.02})` }} />)}
            {[0, 1].map(i => <div key={"r" + i} style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1.5px solid rgba(59,130,246,0.1)", animation: `ringExpandHome 2.5s ease-out ${i * 1.2}s infinite` }} />)}
            <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,#60a5fa 0%,#2563eb 50%,#1d4ed8 100%)", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid rgba(255,255,255,0.5)", animation: "orbPulseHome 2.5s ease-in-out infinite" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#fff" strokeWidth="1.6" /><path d="M2 10H22" stroke="#fff" strokeWidth="1.6" /><rect x="5" y="13" width="5" height="2.5" rx="0.8" fill="rgba(255,255,255,0.7)" /></svg>
            </div>
          </div>
          <div key={finalLoad} style={{ fontSize: 18, fontWeight: 700, color: "#1a2a4a", textAlign: "center", padding: "0 36px", animation: "textFadeUp 0.5s ease both" }}>{finalLoad === 1 ? "Summarising your card portfolio..." : finalLoad === 2 ? "Optimising your savings plan..." : "Finalising your dashboard..."}</div>
        </div>}
      </div>}
    </div></div>);
}
