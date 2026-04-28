// @ts-nocheck
import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";

/**
 * Manual card identification — pixel-accurate to Figma spec.
 * Frame 360×782, gradient bg, eyebrow @ top 70, card row @ top 112,
 * indicator @ top 314 (3px tall, 73 wide, rounded top), divider @ top 317,
 * search @ top 340 (328×41), card list @ top 398 (gap 13, item h 61.29).
 */

const SLOTS = [
  { bank: "Axis", bankLabel: "Axis Bank", last4: "7945" },
  { bank: "HSBC", bankLabel: "HSBC Bank", last4: "8234" },
  { bank: "HSBC", bankLabel: "HSBC Bank", last4: "9945" },
];

type CardOption = { id: string; name: string; tone: string; img?: string };

const CARD_LIBRARY: Record<string, CardOption[]> = {
  Axis: [
    { id: "axis-ace",     name: "Axis Ace",     tone: "linear-gradient(270deg, #6F4DA0 40.69%, #2A1740 100%)" },
    { id: "axis-airtel",  name: "Axis Airtel",  tone: "linear-gradient(270deg, #B41E2B 40.69%, #2C0808 100%)" },
    { id: "axis-flipkart", name: "Axis Flipkart", tone: "linear-gradient(270deg, #0D0D0D 40.69%, #00C4FF 100%)", img: "/legacy-assets/cards/axis-flipkart.png" },
    { id: "axis-iocl",    name: "Axis IOCL",    tone: "linear-gradient(270deg, #C2403F 40.69%, #2A0A0A 100%)" },
    { id: "axis-magnus",  name: "Axis Magnus",  tone: "linear-gradient(270deg, #1A1A1A 40.69%, #6E2A38 100%)" },
    { id: "axis-neo",     name: "Axis Neo",     tone: "linear-gradient(270deg, #1A1A2E 40.69%, #0F0F1F 100%)" },
    { id: "axis-reserve", name: "Axis Reserve", tone: "linear-gradient(270deg, #2A1810 40.69%, #0E0805 100%)" },
  ],
  HSBC: [
    { id: "hsbc-liveplus", name: "HSBC Live+",       tone: "linear-gradient(270deg, #C2233A 40.69%, #4F77B5 100%)", img: "/legacy-assets/cards/hsbc-live.png" },
    { id: "hsbc-travel",   name: "HSBC Travel One",  tone: "linear-gradient(270deg, #1A1A1A 40.69%, #0E0E0E 100%)", img: "/legacy-assets/cards/hsbc-travel-one.png" },
    { id: "hsbc-cashback", name: "HSBC Cashback",    tone: "linear-gradient(270deg, #4A4A4A 40.69%, #1F1F1F 100%)" },
    { id: "hsbc-premiere", name: "HSBC Premiere",    tone: "linear-gradient(270deg, #6E5A8C 40.69%, #3B2D54 100%)" },
    { id: "hsbc-platinum", name: "HSBC Platinum",    tone: "linear-gradient(270deg, #C7CCD3 40.69%, #7B838D 100%)" },
    { id: "hsbc-visa",     name: "HSBC Visa",        tone: "linear-gradient(270deg, #2C3E66 40.69%, #15203B 100%)" },
  ],
};

// ─── Slot card thumbnail (portrait) ───────────────────────────────────────
function SlotCard({ tone, bank, img }: { tone: string; bank: string; img?: string }) {
  if (img) {
    return (
      <div style={{
        width: "100%", height: "100%", borderRadius: 7.32,
        backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center",
        boxShadow: "0px 0.27px 0.38px -0.46px rgba(0,0,0,0.26), 0px 0.74px 1.05px -0.92px rgba(0,0,0,0.247), 0px 1.62px 2.29px -1.37px rgba(0,0,0,0.23), 0px 3.6px 5.09px -1.83px rgba(0,0,0,0.192), 0px 8.54px 12.95px -2.29px rgba(0,0,0,0.2)",
      }} />
    );
  }
  return (
    <div style={{
      width: "100%", height: "100%", borderRadius: 7.32,
      background: tone, position: "relative", overflow: "hidden",
      boxShadow: "0px 0.27px 0.38px -0.46px rgba(0,0,0,0.26), 0px 0.74px 1.05px -0.92px rgba(0,0,0,0.247), 0px 1.62px 2.29px -1.37px rgba(0,0,0,0.23), 0px 3.6px 5.09px -1.83px rgba(0,0,0,0.192), 0px 8.54px 12.95px -2.29px rgba(0,0,0,0.2), inset 0.61px 0.61px 0.61px rgba(255,255,255,0.3), inset -0.61px -0.61px 0.61px rgba(0,0,0,0.23)",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)", backgroundSize: "5px 5px", opacity: 0.55 }} />
      <div style={{ position: "absolute", left: "20%", top: -10, width: "70%", height: 38, background: "#B95D9D", opacity: 0.4, filter: "blur(40px)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", left: 8, top: 8, display: "flex", alignItems: "center", gap: 4 }}>
        {bank === "HSBC" ? (
          <>
            <svg width="9" height="9" viewBox="0 0 12 12">
              <polygon points="6,0 12,4 12,8 6,12 0,8 0,4" fill="#DB0011" />
              <polygon points="6,2 10,4.4 10,7.6 6,10 2,7.6 2,4.4" fill="#FFFFFF" />
              <polygon points="6,3.5 9,5.4 9,6.6 6,8.5 3,6.6 3,5.4" fill="#DB0011" />
            </svg>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 6, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>HSBC</span>
          </>
        ) : (
          <>
            <svg width="6" height="6" viewBox="0 0 9 9">
              <path d="M0 9 L4.5 0 L9 9 Z" fill="#FFFFFF" />
            </svg>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 6, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AXIS BANK</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── List item thumb (landscape 61.93×41.29) ───────────────────────────────
function ListCardThumb({ tone, bank, img }: { tone: string; bank: string; img?: string }) {
  const baseStyle: any = {
    width: 61.93, height: 41.29, borderRadius: 3.14,
    border: "0.26px solid rgba(255,255,255,0.2)",
    boxShadow: "0px 5.78px 23.95px rgba(23,59,3,0.1)",
    flexShrink: 0,
  };
  if (img) {
    return <div style={{ ...baseStyle, backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }} />;
  }
  return (
    <div style={{ ...baseStyle, background: tone, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.16) 0.6px, transparent 0.6px)", backgroundSize: "3px 3px", opacity: 0.55 }} />
      <div style={{ position: "absolute", left: 5, top: 5, display: "flex", alignItems: "center", gap: 2 }}>
        {bank === "HSBC" ? (
          <>
            <svg width="6" height="6" viewBox="0 0 12 12">
              <polygon points="6,0 12,4 12,8 6,12 0,8 0,4" fill="#DB0011" />
              <polygon points="6,2.5 10,4.5 10,7.5 6,9.5 2,7.5 2,4.5" fill="#FFFFFF" />
            </svg>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 4, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>HSBC</span>
          </>
        ) : (
          <>
            <svg width="4" height="4" viewBox="0 0 9 9">
              <path d="M0 9 L4.5 0 L9 9 Z" fill="#FFFFFF" />
            </svg>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 4, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AXIS</span>
          </>
        )}
      </div>
    </div>
  );
}

export function ManualEntryScreen() {
  const ctx: any = useAppContext();
  const { setScreen, setBuildPhase } = ctx;

  const [activeSlot, setActiveSlot] = useState(0);
  const [mappings, setMappings] = useState<Record<number, string>>({});
  const [searchQ, setSearchQ] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const allMapped = SLOTS.every((_, i) => mappings[i]);
  const activeBank = SLOTS[activeSlot].bank;
  const listForSlot = useMemo(() => {
    const all = CARD_LIBRARY[activeBank] ?? [];
    return all.filter(c => c.name.toLowerCase().includes(searchQ.toLowerCase()));
  }, [activeBank, searchQ]);

  const cardById = (id?: string) => id ? Object.values(CARD_LIBRARY).flat().find(c => c.id === id) as CardOption : undefined;

  const pickCard = (cardId: string) => {
    const usedSlot = Object.entries(mappings).find(([, v]) => v === cardId)?.[0];
    if (usedSlot != null && Number(usedSlot) !== activeSlot) return;
    const nextMappings = { ...mappings, [activeSlot]: cardId };
    setMappings(nextMappings);
    // Determine next un-mapped slot
    const next = SLOTS.findIndex((_, i) => i !== activeSlot && !nextMappings[i]);
    if (next >= 0) {
      setActiveSlot(next);
    } else {
      // All 3 slots are mapped — auto-advance to confirmation after a small beat
      setTimeout(() => setConfirmed(true), 450);
    }
  };

  const onConfirm = () => setConfirmed(true);
  const onProceed = () => { setScreen && setScreen("txn-eval"); };

  // ════════════════════════ confirmation view ════════════════════════
  if (confirmed && allMapped) {
    return (
      <div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh", background: "#FFFFFF", position: "relative", overflow: "hidden", userSelect: "none" }}>
        <FL />
        <ScreenBg />
        <StatusBar />
        <Eyebrow text="3 cards identified" />

        <div style={{ position: "absolute", left: "50%", top: 112, transform: "translateX(-50%)", display: "flex", flexDirection: "row", alignItems: "center", gap: 16 }}>
          {SLOTS.map((slot, i) => {
            const card = cardById(mappings[i]);
            return (
              <div key={i} style={{ width: 99.49, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ width: 99.49, height: 150.15 }}>
                  <SlotCard tone={card?.tone ?? ""} bank={slot.bank} img={card?.img} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 8, lineHeight: "10px", letterSpacing: "0.1em", color: "#4D4D4D", textTransform: "uppercase" }}>{card?.name ?? slot.bankLabel}</div>
                  <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 10, lineHeight: "10px", color: "#434343" }}>XXXX {slot.last4}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: "absolute", left: 18, right: 18, bottom: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <button onClick={onProceed} style={{
            width: "100%", height: 50.51, border: "none", cursor: "pointer", padding: "15.2561px 20.3415px",
            background: "#222941",
            boxShadow: "0.290071px 0.290071px 0.410222px -0.489341px rgba(0, 0, 0, 0.26), 0.789939px 0.789939px 1.11714px -0.978681px rgba(0, 0, 0, 0.247), 1.73442px 1.73442px 2.45284px -1.46802px rgba(0, 0, 0, 0.23), 3.85002px 3.85002px 5.44475px -1.95736px rgba(0, 0, 0, 0.192), 9.13436px 9.13436px 13.8406px -2.4467px rgba(0, 0, 0, 0.2), -0.326227px -0.326227px 0px rgba(0, 0, 0, 0.686), inset 0.652454px 0.652454px 0.652454px rgba(255, 255, 255, 0.7), inset -0.652454px -0.652454px 0.652454px rgba(0, 0, 0, 0.23)",
            borderRadius: 10.1707, color: "#FEFEFE",
            fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 13.561,
          }}>Confirm and Proceed</button>
          <div onClick={() => setConfirmed(false)} style={{ cursor: "pointer", textAlign: "center", fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 12, color: "#222941" }}>
            Go back and edit
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════ selection view ════════════════════════
  return (
    <div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", minHeight: "100vh", background: "#FFFFFF", position: "relative", userSelect: "none", overflow: "hidden" }}>
      <FL />
      <ScreenBg />
      <StatusBar />
      <Eyebrow text="Identify your cards" />

      {/* Card slot row — gap 16, centred at top 112 */}
      <div style={{
        position: "absolute", left: "50%", top: 112, transform: "translateX(-50%)",
        display: "flex", flexDirection: "row", alignItems: "center", gap: 16, zIndex: 2,
      }}>
        {SLOTS.map((slot, i) => {
          const card = cardById(mappings[i]);
          const active = i === activeSlot;
          const cardW = active ? 99.49 : 90;
          const cardH = active ? 150.15 : 135.83;
          const tone = card?.tone ?? (slot.bank === "Axis"
            ? "linear-gradient(270deg, #222222 40.69%, #761A46 100%)"
            : "linear-gradient(270deg, #310001 40.69%, #A3070A 100%)");
          return (
            <div
              key={i}
              onClick={() => setActiveSlot(i)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                cursor: "pointer", opacity: active ? 1 : 0.6,
                transition: "opacity 0.3s ease",
              }}
            >
              <div style={{ width: cardW, height: cardH, transition: "width 0.3s ease, height 0.3s ease" }}>
                <SlotCard tone={tone} bank={slot.bank} img={card?.img} />
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 8, lineHeight: "10px", letterSpacing: "0.1em", color: "#4D4D4D", textTransform: "uppercase" }}>
                  {card?.name ?? slot.bankLabel}
                </div>
                <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 10, lineHeight: "10px", color: "#434343" }}>
                  XXXX {slot.last4}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active indicator pill — 3px tall, 73 wide, rounded top, sits on the divider */}
      <div style={{
        position: "absolute", top: 314, height: 3, width: 73,
        background: "#36405E", borderRadius: "100px 100px 0 0",
        left: `calc(50% - 73px/2 + ${(activeSlot - 1) * (99.49 + 16)}px)`,
        transition: "left 0.35s cubic-bezier(0.16,1,0.3,1)",
        zIndex: 3,
      }} />

      {/* Divider — 1px solid rgba(0,0,0,0.1) at top 317 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 317, height: 1, background: "rgba(0,0,0,0.1)", zIndex: 1 }} />

      {/* Search input — 328×41 at top 340, border #D3E4FA radius 8 */}
      <div style={{
        position: "absolute", left: "50%", top: 340, transform: "translateX(-50%)",
        boxSizing: "border-box", width: 328, height: 41,
        display: "flex", flexDirection: "row", alignItems: "center", padding: "12px", gap: 6,
        background: "#FFFFFF", border: "1px solid #D3E4FA", borderRadius: 8,
        zIndex: 2,
      }}>
        <Search size={16} strokeWidth={2} color="rgba(28, 42, 52, 0.8)" />
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Search Card Name"
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontFamily: "'SF Pro Display','Google Sans',sans-serif",
            fontWeight: 400, fontSize: 12, lineHeight: "145%", letterSpacing: "0.02em",
            color: "rgba(54, 54, 54, 1)",
          }}
        />
      </div>

      {/* Card list — 328 wide, gap 13, items 61.29 tall */}
      <div data-scroll="1" style={{
        position: "absolute", left: "50%", top: 398, transform: "translateX(-50%)",
        width: 328, bottom: 24,
        display: "flex", flexDirection: "column", gap: 13,
        overflowY: "auto", zIndex: 2,
      }}>
        {listForSlot.map((card) => {
          const isAlreadySelected = Object.values(mappings).includes(card.id);
          const isCurrentSelection = mappings[activeSlot] === card.id;
          const dim = isAlreadySelected && !isCurrentSelection;
          return (
            <div key={card.id} onClick={() => !dim && pickCard(card.id)} style={{
              boxSizing: "border-box",
              display: "flex", flexDirection: "row", alignItems: "center",
              padding: "10px 12px", gap: 10,
              width: 328, height: 61.29, flexShrink: 0,
              background: isCurrentSelection ? "#E9F8EE" : "#FFFFFF",
              border: isCurrentSelection ? "1px solid #B7E2C5" : "none",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
              borderRadius: 10,
              cursor: dim ? "default" : "pointer",
              opacity: dim ? 0.55 : 1,
              transition: "background 0.2s ease",
            }}>
              <ListCardThumb tone={card.tone} bank={SLOTS[activeSlot].bank} img={card.img} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{
                  fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 12, lineHeight: "18px",
                  color: isCurrentSelection ? "#0E7A35" : "#36405E",
                }}>
                  {card.name}
                </div>
                {dim && (
                  <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.16em", color: "#9BA3B5", textTransform: "uppercase" }}>
                    Already selected
                  </div>
                )}
              </div>
              {isCurrentSelection && (
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#19A24F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={13} strokeWidth={3} color="#FFFFFF" />
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}

// ─── Shared bits ───────────────────────────────────────────────────────────
function ScreenBg() {
  return (
    <>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #5856F6 0%, rgba(99, 146, 248, 0) 59.56%)",
        opacity: 0.55, pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", left: "50%", top: 30, transform: "translateX(-50%)",
        width: "200%", height: 1384, background: "#F8F9FB", filter: "blur(50px)",
        opacity: 0.45, pointerEvents: "none", zIndex: 0,
      }} />
    </>
  );
}

function Eyebrow({ text }: { text: string }) {
  return (
    <div style={{
      position: "absolute", left: "50%", top: 70, transform: "translateX(-50%)",
      width: 240, textAlign: "center",
      fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 11, lineHeight: "140%",
      letterSpacing: "0.2em", color: "rgba(38, 45, 68, 0.78)", textTransform: "uppercase",
      zIndex: 3,
    }}>{text}</div>
  );
}

function StatusBar() {
  return (
    <>
      <div style={{ position: "absolute", left: 33, top: 16, fontFamily: "'SF Pro',sans-serif", fontWeight: 700, fontSize: 15, lineHeight: "18px", letterSpacing: "-0.02em", color: "#0D0D0E", zIndex: 10 }}>9:41</div>
      <div style={{ position: "absolute", right: 24, top: 16, display: "flex", alignItems: "center", gap: 6, zIndex: 10 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#0D0D0E"/>
          <rect x="5" y="6" width="3" height="6" rx="0.5" fill="#0D0D0E"/>
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill="#0D0D0E"/>
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="#0D0D0E"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 10.5 L9.7 8.8 a2.4 2.4 0 0 0-3.4 0 Z" fill="#0D0D0E"/>
          <path d="M8 7 L11.3 3.7 a4.65 4.65 0 0 0-6.6 0 Z" stroke="#0D0D0E" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.85"/>
          <path d="M8 3.5 L13.5 -2 a8 8 0 0 0-11 0 Z" stroke="#0D0D0E" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6"/>
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="#0D0D0E" strokeOpacity="0.4"/>
          <rect x="2" y="2" width="19" height="8" rx="1.3" fill="#0D0D0E"/>
          <rect x="23.5" y="4" width="1.5" height="4" rx="0.5" fill="#0D0D0E" fillOpacity="0.4"/>
        </svg>
      </div>
    </>
  );
}
