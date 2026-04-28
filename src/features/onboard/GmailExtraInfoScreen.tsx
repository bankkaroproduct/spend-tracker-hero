// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";

/**
 * Gmail Extra Info — post-OAuth flow.
 *
 * Three sub-steps inside one screen:
 *   step 1 — name + DOB form on a floating card, cards row behind blurred
 *   step 2 — HSBC last-6-digits form on a floating card, with back/close
 *   step 3 — final confirmation: cards crisp + "Confirm and Proceed" CTA
 */

const SLOTS = [
  { bank: "Axis", name: "Axis Flipkart",   last4: "7945", img: "/legacy-assets/cards/axis-flipkart.webp", tone: "linear-gradient(270deg, #0D0D0D 40.69%, #00C4FF 100%)" },
  { bank: "HSBC", name: "HSBC Travel One", last4: "8234", img: "/legacy-assets/cards/hsbc-travel-one.webp", tone: "linear-gradient(270deg, #1A1A1A 40.69%, #0E0E0E 100%)" },
  { bank: "HSBC", name: "HSBC Live+",      last4: "9945", img: "/legacy-assets/cards/hsbc-live.webp", tone: "linear-gradient(270deg, #C2233A 40.69%, #4F77B5 100%)" },
];

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

// ─── Cards row (used as background for steps 1 & 2 — blurred) ───────────
function CardsRow({ blurred }: { blurred: boolean }) {
  return (
    <div style={{
      position: "absolute", left: "50%", top: 112, transform: "translateX(-50%)",
      display: "flex", flexDirection: "row", alignItems: "center", gap: 16, zIndex: 1,
      filter: blurred ? "blur(14px)" : "none",
      opacity: blurred ? 0.85 : 1,
      transition: "filter 0.4s ease, opacity 0.4s ease",
    }}>
      {SLOTS.map((slot, i) => (
        <div key={i} style={{ width: 99.49, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 99.49, height: 150.15 }}>
            <SlotCard tone={slot.tone} bank={slot.bank} img={blurred ? undefined : slot.img} />
          </div>
          {!blurred && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: 8, lineHeight: "10px", letterSpacing: "0.1em", color: "#4D4D4D", textTransform: "uppercase" }}>{slot.name}</div>
              <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 10, lineHeight: "10px", color: "#434343" }}>XXXX {slot.last4}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Floating input field with floating label ─────────────────────────────
function FloatField({ label, value, onChange, placeholder, focused, onFocus, onBlur, inputProps }: any) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Floating label — SF Pro Display 500 10.5px, white pill on #FAFDFE */}
      <div style={{
        position: "absolute", left: 11, top: -7, padding: "0 9px",
        background: "#FAFDFE", zIndex: 2,
        fontFamily: "'SF Pro Display','Google Sans',sans-serif",
        fontWeight: 500, fontSize: 10.5, lineHeight: "13px",
        color: "#677E97", transition: "color 0.2s ease",
      }}>{label}</div>
      <input
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        {...(inputProps || {})}
        style={{
          width: "100%", height: 52, boxSizing: "border-box",
          padding: "17px 16px", borderRadius: 8,
          border: focused ? "1px solid #6AA1E8" : "1px solid #D3E4FA",
          background: "#FFFFFF",
          fontFamily: "'SF Pro Display','Google Sans',sans-serif",
          fontWeight: 400, fontSize: 14, lineHeight: "145%", letterSpacing: "0.02em",
          color: "#363636", outline: "none",
          transition: "border-color 0.2s ease",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//                                MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export function GmailExtraInfoScreen() {
  const ctx: any = useAppContext();
  const {
    setScreen,
    setHasGmail, setUserFlag, setMappingCompleted, setCardMapping,
    gmailFirstName, setGmailFirstName,
    gmailLastName, setGmailLastName,
    gmailDob, setGmailDob,
    hsbcDigits1, setHsbcDigits1,
    hsbcDigits2, setHsbcDigits2,
  } = ctx;

  const [step, setStep] = useState(1);
  const [focusField, setFocusField] = useState<string | null>("first");
  const [confirming, setConfirming] = useState(false);
  const hsbcRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pre-fill last 4 digits for HSBC cards (only first 2 cells editable)
  useEffect(() => {
    if (!hsbcDigits1 || hsbcDigits1.slice(2).join("") !== "2422") {
      setHsbcDigits1(["", "", "2", "4", "2", "2"]);
    }
    if (!hsbcDigits2 || hsbcDigits2.slice(2).join("") !== "4122") {
      setHsbcDigits2(["", "", "4", "1", "2", "2"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // step 1 → 2
  const handleStep1Proceed = () => setStep(2);
  // step 2 → 3
  const handleStep2Proceed = () => setStep(3);
  // step 3 → transaction evaluation cinematic
  const handleProceed = () => {
    if (confirming) return;
    setConfirming(true);
    setHasGmail?.(true);
    setUserFlag?.("NORMAL");
    setMappingCompleted?.(true);
    setCardMapping?.((prev: any) => (prev && Object.keys(prev).length ? prev : { 0: "Travel One", 1: "Flipkart", 2: "Live+" }));
    setTimeout(() => { setScreen && setScreen("txn-eval"); }, 2000);
  };

  const handleSkip = () => setStep(3);

  const formatDob = (v: string) => {
    const digits = (v || "").replace(/\D/g, "").slice(0, 8); // DDMMYYYY
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    return [dd, mm, yyyy].filter(Boolean).join("/");
  };

  const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const normalizeDob = (v: string) => {
    const digits = (v || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length < 8) return formatDob(v);

    let dd = parseInt(digits.slice(0, 2), 10);
    let mm = parseInt(digits.slice(2, 4), 10);
    let yyyy = parseInt(digits.slice(4, 8), 10);

    if (Number.isNaN(dd)) dd = 1;
    if (Number.isNaN(mm)) mm = 1;
    if (Number.isNaN(yyyy)) yyyy = 2000;

    dd = clampInt(dd, 1, 31);
    mm = clampInt(mm, 1, 12);
    const currentYear = new Date().getFullYear();
    yyyy = clampInt(yyyy, 1900, currentYear);

    const ddS = String(dd).padStart(2, "0");
    const mmS = String(mm).padStart(2, "0");
    const yyyyS = String(yyyy).padStart(4, "0");

    return `${ddS}/${mmS}/${yyyyS}`;
  };

  // hsbc 6-digit input handling
  const onHsbcChange = (which: 1 | 2, idx: number, v: string) => {
    const setter = which === 1 ? setHsbcDigits1 : setHsbcDigits2;
    const arr = which === 1 ? [...hsbcDigits1] : [...hsbcDigits2];
    const d = (v || "").replace(/\D/g, "");
    arr[idx] = d.slice(-1);
    setter(arr);
  };

  const focusHsbc = (which: 1 | 2, idx: number) => {
    const base = which === 1 ? 0 : 2; // only 2 editable boxes per row
    hsbcRefs.current[base + idx]?.focus?.();
  };

  const onHsbcInput = (which: 1 | 2, idx: number, v: string) => {
    const digits = (v || "").replace(/\D/g, "");
    if (!digits) {
      onHsbcChange(which, idx, "");
      return;
    }

    // Allow paste of multiple digits (e.g. "12" fills both editable cells)
    const chars = digits.split("");
    for (let i = 0; i < chars.length; i++) {
      const targetIdx = idx + i;
      if (targetIdx > 1) break;
      onHsbcChange(which, targetIdx, chars[i]);
    }

    // Advance focus: row1 box2 → row2 box1
    const nextIdx = Math.min(1, idx + chars.length);
    if (idx + chars.length <= 1) {
      focusHsbc(which, nextIdx);
    } else {
      if (which === 1) focusHsbc(2, 0);
    }
  };

  const onHsbcKeyDown = (which: 1 | 2, idx: number, e: any) => {
    if (e.key !== "Backspace") return;
    const arr = which === 1 ? hsbcDigits1 : hsbcDigits2;
    const v = arr[idx] ?? "";
    if (v) return; // normal delete keeps focus here
    if (idx > 0) {
      focusHsbc(which, idx - 1);
    } else if (which === 2) {
      focusHsbc(1, 1);
    }
  };

  return (
    <div style={{
      fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh",
      background: "#FFFFFF", position: "relative", overflow: "hidden", userSelect: "none",
    }}>
      <FL />

      {/* ── Background gradient + iOS status bar ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #5856F6 0%, rgba(99, 146, 248, 0) 59.56%)",
        opacity: 0.45, pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{ position: "absolute", left: 33, top: 16, fontFamily: "'SF Pro',sans-serif", fontWeight: 700, fontSize: 15, lineHeight: "18px", color: "#0D0D0E", zIndex: 10 }}>9:41</div>
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

      {/* ── Cards row in background (blurred for steps 1&2, crisp for step 3) ── */}
      <CardsRow blurred={step !== 3} />

      {/* ── Step 3 eyebrow ── */}
      {step === 3 && (
        <div style={{
          position: "absolute", left: "50%", top: 70, transform: "translateX(-50%)",
          width: 240, textAlign: "center",
          fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 11, lineHeight: "140%",
          letterSpacing: "0.2em", color: "rgba(38, 45, 68, 0.78)", textTransform: "uppercase",
          zIndex: 3,
        }}>3 cards identified</div>
      )}

      {/* ── Skip for now pill (steps 1 & 2) — small & top-right ── */}
      {step !== 3 && (
        <div onClick={handleSkip} style={{
          position: "absolute", right: 16, top: 50,
          padding: "5px 11px", borderRadius: 999,
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)",
          fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 11, color: "#222941",
          cursor: "pointer", zIndex: 11,
          boxShadow: "0px 1px 4px rgba(0,0,0,0.06)",
        }}>Skip for now →</div>
      )}

      {/* ──────────────  STEP 1 — Name & DOB (Figma: 328×430 @ top 274)  ────────────── */}
      {step === 1 && (
        <div style={{
          position: "absolute", left: 16, right: 16, bottom: 60,
          background: "#FAFDFE",
          border: "1px solid rgba(219, 222, 226, 0.7)",
          boxShadow: "0px 7px 29px rgba(100, 100, 111, 0.2)",
          borderRadius: 32,
          padding: "24px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 23,
          zIndex: 5,
          animation: "geSheetIn 0.6s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}>
          {/* Title — Blacklist 700 20px line 120% */}
          <div style={{
            width: "100%",
            fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 700, fontSize: 20,
            lineHeight: "120%", textAlign: "center", color: "#364060",
          }}>We would need some more information about you</div>

          {/* Form column gap 18 */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            {/* Inputs group gap 16 */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
              <FloatField
                label="First Name"
                value={gmailFirstName ?? ""}
                onChange={(e: any) => setGmailFirstName(e.target.value)}
                focused={focusField === "first"}
                onFocus={() => setFocusField("first")}
                onBlur={() => setFocusField(null)}
                placeholder=""
              />
              <FloatField
                label="Last Name"
                value={gmailLastName ?? ""}
                onChange={(e: any) => setGmailLastName(e.target.value)}
                focused={focusField === "last"}
                onFocus={() => setFocusField("last")}
                onBlur={() => setFocusField(null)}
                placeholder="Enter Last name here"
              />
            </div>
            {/* Helper text — left-aligned, with extra space below before the DOB field */}
            <div style={{
              width: "100%", fontFamily: "'Google Sans',sans-serif", fontWeight: 400, fontSize: 10,
              lineHeight: "150%", textAlign: "left", color: "rgba(2, 40, 81, 0.6)",
              paddingLeft: 4, marginBottom: 12,
            }}>Please enter your first and last name as per your bank records</div>
            {/* DOB */}
            <FloatField
              label="Date of Birth"
              value={gmailDob ?? ""}
              onChange={(e: any) => setGmailDob(formatDob(e.target.value))}
              focused={focusField === "dob"}
              onFocus={() => setFocusField("dob")}
              onBlur={() => {
                setFocusField(null);
                setGmailDob(normalizeDob(gmailDob ?? ""));
              }}
              placeholder="DD/MM/YYYY"
              inputProps={{
                inputMode: "numeric",
                pattern: "\\d*",
                maxLength: 10,
                autoComplete: "bday",
              }}
            />
          </div>

          {/* Proceed CTA */}
          <button onClick={handleStep1Proceed} style={{
            width: "100%", maxWidth: 292, height: 50.51, border: "none", cursor: "pointer",
            background: "#222941", borderRadius: 10.17, color: "#FEFEFE",
            fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 13.561,
            boxShadow: "0.29px 0.29px 0.41px -0.49px rgba(0,0,0,0.26), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247), 1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 3.85px 3.85px 5.44px -1.96px rgba(0,0,0,0.192), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)",
          }}>Proceed</button>
        </div>
      )}

      {/* ──────────────────────  STEP 2 — HSBC last 6 digits (per Figma)  ────────────────────── */}
      {step === 2 && (
        <div style={{
          position: "absolute", left: 16, right: 16, bottom: 60,
          background: "#FAFDFE",
          border: "1px solid rgba(219, 222, 226, 0.7)",
          boxShadow: "0px 7px 29px rgba(100, 100, 111, 0.2)",
          borderRadius: 32,
          padding: "24px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
          zIndex: 5,
          animation: "geSheetIn 0.55s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}>
          {/* back / close icons — 24×24, #E8EFF6 background */}
          <div style={{
            position: "absolute", left: 16, right: 16, top: 34,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            zIndex: 4, pointerEvents: "none",
          }}>
            <div onClick={() => setStep(1)} style={{
              width: 24, height: 24, borderRadius: "50%", background: "#E8EFF6",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", pointerEvents: "auto",
            }}><ArrowLeft size={12} strokeWidth={2} color="#9399AC" /></div>
            <div onClick={handleSkip} style={{
              width: 24, height: 24, borderRadius: "50%", background: "#E8EFF6",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", pointerEvents: "auto", opacity: 0.6,
            }}><X size={11} strokeWidth={1.8} color="#555F7F" /></div>
          </div>

          {/* Title — Blacklist 700 20px, 273 wide, color #364060 */}
          <div style={{
            width: 273,
            fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 700, fontSize: 20,
            lineHeight: "120%", textAlign: "center", color: "#364060",
          }}>
            We need additional details about your HSBC cards
          </div>

          <DigitsRow
            label="Last Six digits of HSBC Travel One Card"
            digits={hsbcDigits1}
            onChange={(idx, v) => onHsbcInput(1, idx, v)}
            onKeyDown={(idx, e) => onHsbcKeyDown(1, idx, e)}
            inputRef={(idx, el) => { hsbcRefs.current[idx] = el; }}
          />
          <DigitsRow
            label="Last Six digits of HSBC Live+ Credit Card"
            digits={hsbcDigits2}
            onChange={(idx, v) => onHsbcInput(2, idx, v)}
            onKeyDown={(idx, e) => onHsbcKeyDown(2, idx, e)}
            inputRef={(idx, el) => { hsbcRefs.current[2 + idx] = el; }}
          />

          {/* Proceed CTA */}
          <button onClick={handleStep2Proceed} style={{
            width: "100%", maxWidth: 292, height: 50.51, border: "none", cursor: "pointer",
            padding: "15.26px 20.34px",
            background: "#222941", borderRadius: 10.17, color: "#FEFEFE",
            fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 13.561, lineHeight: "150%",
            boxShadow: "0.29px 0.29px 0.41px -0.49px rgba(0,0,0,0.26), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247), 1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 3.85px 3.85px 5.44px -1.96px rgba(0,0,0,0.192), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)",
          }}>Proceed</button>
        </div>
      )}

      {/* ──────────────────────  Step 1 / Step 2 footer  ────────────────────── */}
      {step !== 3 && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: "10px 16px", background: "#F7F9FF", borderTop: "1px solid #DEE7FF",
          fontFamily: "'Google Sans',sans-serif", fontWeight: 400, fontSize: 10,
          lineHeight: "150%", textAlign: "center", color: "rgba(2, 40, 81, 0.6)",
          zIndex: 6,
        }}>
          {step === 1
            ? <>Providing us these details will help us read your statements and identify best ways to save. Your info will be safe and encrypted with us. <span style={{ color: "#222941", fontWeight: 600, textDecoration: "underline" }}>know more</span></>
            : "HSBC Regulations do not allow us to assess your statements without knowing the last six digits of your card"}
        </div>
      )}

      {/* ──────────────────────  STEP 3 — Confirmation  ────────────────────── */}
      {step === 3 && (
        <div style={{
          position: "absolute", left: 18, right: 18, bottom: 30,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
          zIndex: 5,
        }}>
          <button onClick={handleProceed} disabled={confirming} style={{
            width: "100%", height: 50.51, border: "none", cursor: confirming ? "default" : "pointer",
            background: "#222941", borderRadius: 10.17, color: "#FEFEFE",
            fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 13.561,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            opacity: confirming ? 0.92 : 1,
            boxShadow: "0.29px 0.29px 0.41px -0.49px rgba(0,0,0,0.26), 0.79px 0.79px 1.12px -0.98px rgba(0,0,0,0.247), 1.73px 1.73px 2.45px -1.47px rgba(0,0,0,0.23), 3.85px 3.85px 5.44px -1.96px rgba(0,0,0,0.192), 9.13px 9.13px 13.84px -2.45px rgba(0,0,0,0.2), inset 0.65px 0.65px 0.65px rgba(255,255,255,0.7), inset -0.65px -0.65px 0.65px rgba(0,0,0,0.23)",
          }}>
            {confirming && <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "gxSpin 0.9s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none" /><path d="M12 2a10 10 0 019.8 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>}
            <span>{confirming ? "Confirming…" : "Confirm and Proceed"}</span>
          </button>
          <div onClick={() => setStep(1)} style={{
            cursor: "pointer", fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 13,
            color: "#222941", textAlign: "center",
          }}>Make changes</div>
        </div>
      )}

      <style>{`
        @keyframes geSheetIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gxSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── 6-digit input row (per Figma spec) ───
// Editable cells: 41.57×49.7, #FCFEFF bg, #69D3FA border 0.83px, bottom underline
// Filled cells:   42×49, rgba(240,243,255,0.6) bg, #BED3EF border 0.92px, value 16/600 SF Pro Display #61698F
function DigitsRow(
  { label, digits, onChange, onKeyDown, inputRef }:
  {
    label: string;
    digits: string[];
    onChange: (idx: number, v: string) => void;
    onKeyDown?: (idx: number, e: any) => void;
    inputRef?: (idx: number, el: HTMLInputElement | null) => void;
  }
) {
  return (
    <div style={{ width: 289.72, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Centered label pill — 10.5/500 SF Pro Display #677E97 */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "0 6px", height: 13 }}>
        <span style={{
          fontFamily: "'SF Pro Display','Google Sans',sans-serif", fontWeight: 500, fontSize: 10.5,
          lineHeight: "13px", textAlign: "center", color: "#677E97",
        }}>{label}</span>
      </div>
      {/* OTP boxes row — 7.72px gap */}
      <div style={{ display: "flex", alignItems: "center", gap: 7.72 }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const v = digits[i] ?? "";
          const editable = i < 2;
          if (editable) {
            return (
              <div key={i} style={{
                position: "relative",
                boxSizing: "border-box",
                width: 41.57, height: 49.7,
                background: "#FCFEFF",
                border: "0.83px solid #69D3FA", borderRadius: 8,
              }}>
                <input
                  value={v}
                  onChange={(e) => onChange(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown?.(i, e)}
                  maxLength={1}
                  ref={(el) => inputRef?.(i, el)}
                  style={{
                    width: "100%", height: "100%", boxSizing: "border-box",
                    background: "transparent", border: "none", outline: "none",
                    textAlign: "center", paddingBottom: 8,
                    fontFamily: "'SF Pro Display','Google Sans',sans-serif", fontWeight: 600, fontSize: 16, color: "#61698F",
                  }}
                />
                {/* Bottom underline 18.98 wide × 0.9px, centered */}
                <div style={{
                  position: "absolute", left: "50%", bottom: 11, transform: "translateX(-50%)",
                  width: 18.98, height: 0, borderTop: "0.9px solid #69D3FA",
                }}/>
              </div>
            );
          }
          return (
            <div key={i} style={{
              boxSizing: "border-box",
              width: 42, height: 49,
              background: "rgba(240, 243, 255, 0.6)",
              border: "0.92px solid #BED3EF", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'SF Pro Display','Google Sans',sans-serif", fontWeight: 600, fontSize: 16, color: "#61698F",
            }}>{v}</div>
          );
        })}
      </div>
    </div>
  );
}
