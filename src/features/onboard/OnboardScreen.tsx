// @ts-nocheck
import { useState } from "react";
import { X, Lock, Check, MessageCircle, Smartphone, ShoppingBag, Plane, Fuel, UtensilsCrossed, Package, TrendingUp, Car, Gift, HandCoins, Star, Award, CreditCard } from "lucide-react";
import { C, FN } from "@/lib/theme";
import { FL } from "@/components/shared/FontLoader";
import { useAppContext } from "@/store/AppContext";

export function OnboardScreen() {
  const ctx: any = useAppContext();
  const {
    onStep, setOnStep, vpSlide, setVpSlide,
    phone, setPhone, otp, setOtp, otpTimer, setOtpTimer,
    smsStatus, setSmsStatus, welcomeTyped,
    setHasGmail, setMappingCompleted, setCardMapping, setScreen, setUserFlag,
    touchStartX,
  } = ctx;
  const [skipPickerOpen, setSkipPickerOpen] = useState(false);
  const pickState = (state: 1 | 2 | 3) => {
    if (state === 1) {
      setHasGmail(false);
      setMappingCompleted(false);
      setCardMapping({});
      setUserFlag && setUserFlag("PARTIAL");
    } else if (state === 2) {
      setHasGmail(false);
      setMappingCompleted(true);
      setCardMapping({ 0: "Travel One", 1: "Flipkart", 2: "Live+" });
      setUserFlag && setUserFlag("PARTIAL");
    } else {
      setHasGmail(true);
      setMappingCompleted(true);
      setCardMapping({ 0: "Travel One", 1: "Flipkart", 2: "Live+" });
      setUserFlag && setUserFlag("NORMAL");
    }
    setSkipPickerOpen(false);
    setScreen("home");
  };

  const bgGrad = "linear-gradient(180deg,#1a6df7 0%,#2979f5 30%,#4a9ee5 65%,#c8dff0 100%)";
  const activeSteps = [onStep >= 1, onStep >= 2, onStep >= 3];
  const ProgressBar = () => (<div style={{ display: "flex", gap: 10, padding: "20px 48px 0" }}>{[0, 1, 2].map(i => (<div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: activeSteps[i] ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)" }} />))}</div>);
  const SheetWrap = ({ children, back }: any) => (<div style={{ position: "relative", background: C.white, borderRadius: 24, padding: "32px 24px 36px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", margin: "0 16px 16px" }}>{back && <div onClick={back} style={{ position: "absolute", left: 16, top: 16, width: 32, height: 32, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.dim, fontSize: 14 }}>←</div>}<div onClick={() => setOnStep(0)} style={{ position: "absolute", right: 16, top: 16, width: 32, height: 32, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.dim, fontSize: 14 }}><X size={16} strokeWidth={1.5} color="currentColor" /></div>{children}</div>);
  const PrimaryBtn = ({ text, onClick, disabled, green }: any) => (<div onClick={disabled ? null : onClick} style={{ padding: "18px", borderRadius: 16, background: green ? "#16a34a" : disabled ? "#ccc" : "#1a2233", color: "#fff", textAlign: "center", fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", boxShadow: green ? "0 4px 16px rgba(22,163,74,0.3)" : "0 4px 20px rgba(0,0,0,0.25)" }}>{text}</div>);

  const G = { bg: "rgba(255,255,255,0.12)", brd: "rgba(255,255,255,0.2)", bg2: "rgba(255,255,255,0.07)", ic: "rgba(255,255,255,0.7)" };
  const vpSlides = [
    { img: "/onboard/1.webp", title: "Everything you need to get the most of your cards", scale: 1 },
    { img: "/onboard/2.webp", title: "Know which cards actually work for your spends", scale: 1.25 },
    { img: "/onboard/3.webp", title: "Track every transaction & never miss out on savings", scale: 1 },
    { img: "/onboard/4.webp", title: "Maximise your rewards & use every benefit in a smart way", scale: 1 },
  ];

  const onbBg = "linear-gradient(180deg, #6F01FD 0%, rgba(99, 134, 248, 0) 59.56%), linear-gradient(270deg, rgba(126, 255, 114, 0) 27%, rgba(114, 203, 255, 0.6) 100%), linear-gradient(330.61deg, #6882FF 2.42%, rgba(104, 185, 255, 0) 75.74%), linear-gradient(90deg, rgba(255, 47, 134, 0) 0%, #FF2F86 100%), #5A0EFF";

  if (onStep === 0) return (<div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", minHeight: "100vh", background: onbBg, backgroundBlendMode: "normal, normal, normal, saturation, normal", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}><FL />
    {/* Ellipse glow behind illustration (#7F66FA, 312x312, blur 50) */}
    <div style={{ position: "absolute", width: 312, height: 312, left: "50%", top: 200, transform: "translateX(-50%)", borderRadius: "50%", background: "#7F66FA", filter: "blur(50px)", pointerEvents: "none", zIndex: 1 }} />
    {/* White blur layer behind CTA (Rectangle 1: 495x360, #FAFEFF, blur 50) — pushed lower so it sits behind the CTA only */}
    <div style={{ position: "absolute", width: 495, height: 360, left: "50%", transform: "translateX(-50%)", bottom: -240, background: "#FAFEFF", filter: "blur(50px)", pointerEvents: "none", zIndex: 1 }} />

    {/* Top skip control */}
    <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "52px 24px 0" }}>
      <div onClick={() => setSkipPickerOpen(true)} style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>Skip →</div>
    </div>

    {/* Top spacer to vertically center illustration */}
    <div style={{ flex: 1 }} />

    {/* Image slider */}
    <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 0 }}>
      <div style={{ overflow: "hidden", width: "100%" }}
        onTouchStart={e => touchStartX.current = e.touches[0].clientX}
        onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 40) { if (dx < 0 && vpSlide < 3) setVpSlide((s: number) => s + 1); if (dx > 0 && vpSlide > 0) setVpSlide((s: number) => s - 1); } }}
      >
        <div style={{ display: "flex", transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)", transform: `translateX(-${vpSlide * 100}%)` }}>
          {vpSlides.map((slide, i) => (
            <div key={i} style={{ minWidth: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={slide.img} alt="" style={{ width: "100vw", maxWidth: 400, height: "auto", objectFit: "contain", transform: `scale(${slide.scale || 1})`, transformOrigin: "center", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.18))" }} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom spacer (matches the top one) so the illustration sits in the vertical center */}
    <div style={{ flex: 1 }} />

    {/* Pagination dots */}
    <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", gap: 6, marginTop: 4, marginBottom: 18 }}>
      {vpSlides.map((_, i) => (
        <div key={i} onClick={() => setVpSlide(i)} style={{ width: 12.5, height: 4, borderRadius: 12, background: i === vpSlide ? "#FFFFFF" : "rgba(255,255,255,0.45)", cursor: "pointer", transition: "background 0.3s ease" }} />
      ))}
    </div>

    {/* Title */}
    <div style={{ position: "relative", zIndex: 2, padding: "0 28px 22px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Blacklist','Google Sans',serif", fontWeight: 700, fontSize: 24, lineHeight: 1.35, color: "#FFFFFF", maxWidth: 340, margin: "0 auto", minHeight: 64 }}>
        {vpSlides[vpSlide].title}
      </div>
    </div>

    {/* CTA */}
    <div style={{ position: "relative", zIndex: 2, padding: "0 32px 36px" }}>
      <div onClick={() => setOnStep(1)} style={{
        display: "flex", justifyContent: "center", alignItems: "center", padding: "15.25px 20.34px", gap: 8.48,
        background: "#222941", borderRadius: 10.17,
        boxShadow: "0.290071px 0.290071px 0.410222px -0.489341px rgba(0,0,0,0.26), 0.789939px 0.789939px 1.11714px -0.978681px rgba(0,0,0,0.247), 1.73442px 1.73442px 2.45284px -1.46802px rgba(0,0,0,0.23), 3.85002px 3.85002px 5.44475px -1.95736px rgba(0,0,0,0.192), 9.13436px 9.13436px 13.8406px -2.4467px rgba(0,0,0,0.2), -0.326227px -0.326227px 0px rgba(0,0,0,0.686), inset 0.652454px 0.652454px 0.652454px rgba(255,255,255,0.7), inset -0.652454px -0.652454px 0.652454px rgba(0,0,0,0.23)",
        cursor: "pointer"
      }}>
        <span style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: 13.561, lineHeight: 1.5, color: "#FEFEFE", textAlign: "center" }}>Let's get started</span>
      </div>
    </div>

    {/* Footer agreement strip */}
    <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center", padding: "12px", gap: 12, background: "#F7F9FF", borderTop: "1px solid #DEE7FF" }}>
      <div style={{ fontFamily: "'SF Pro Display','Google Sans',sans-serif", fontWeight: 400, fontSize: 11, lineHeight: 1.5, letterSpacing: "0.02em", color: "rgba(2,40,81,0.6)", textAlign: "center" }}>
        By continuing, you agree to our <span style={{ color: "rgba(2,40,81,0.85)", fontWeight: 600 }}>Terms of Use</span> & <span style={{ color: "rgba(2,40,81,0.85)", fontWeight: 600 }}>Privacy Policy</span>
      </div>
    </div>
    {skipPickerOpen && (
      <div onClick={() => setSkipPickerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: C.white, borderRadius: "24px 24px 0 0", padding: "20px 20px 28px", boxShadow: "0 -10px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e5e7eb", margin: "0 auto 18px" }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Skip onboarding (MVP)</div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 18 }}>Pick which app state to enter — for testing the documented flows.</div>
          {[
            { n: 1, title: "SMS Only", desc: "Card names hidden, partial data, Gmail nudges everywhere." },
            { n: 2, title: "Manually Mapped", desc: "Real card names, full data, no card-mapping nudges." },
            { n: 3, title: "Gmail Connected", desc: "Everything unlocked, no nudges." },
          ].map(opt => (
            <div key={opt.n} onClick={() => pickState(opt.n as 1 | 2 | 3)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", borderRadius: 14, border: `1px solid ${C.brd}`, marginBottom: 10, cursor: "pointer", background: C.white }}>
              <div style={{ flexShrink: 0, width: 56, height: 26, borderRadius: 999, background: "#1a2233", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>State {opt.n}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{opt.title}</div>
                <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
              <div style={{ color: C.dim, fontSize: 18, fontWeight: 600 }}>›</div>
            </div>
          ))}
          <div onClick={() => setSkipPickerOpen(false)} style={{ marginTop: 10, padding: "14px", textAlign: "center", fontSize: 13, fontWeight: 600, color: C.dim, cursor: "pointer" }}>Cancel</div>
        </div>
      </div>
    )}
  </div>);

  /* ──────────────────────────────────────────────────────────────────
     Bottom-sheet flow (steps 1=Phone, 2=OTP, 3=SMS) — apr_14 design
     ──────────────────────────────────────────────────────────────── */
  if (onStep >= 1 && onStep <= 3) {
    const SheetBtn = ({ text, onClick, green }: any) => (
      <div onClick={onClick} style={{ padding: "18px 0", borderRadius: 16, background: green ? "linear-gradient(135deg, #16a34a, #22c55e)" : "linear-gradient(180deg, #2a3040, #1a2030)", textAlign: "center", cursor: "pointer", boxShadow: green ? "0 6px 20px rgba(22,163,74,0.25)" : "0 6px 24px rgba(0,0,0,0.18)", marginTop: 20 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{text}</span>
      </div>
    );
    const NavRow = ({ title, sub, showBack, onBack, onClose }: any) => {
      if (!showBack) return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Blacklist','Google Sans',serif", fontSize: 24, fontWeight: 800, color: "#1a1f36" }}>{title}</div>
          <div onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>
      );
      return (
        <div style={{ display: "flex", alignItems: "center", padding: "24px 24px 0", marginBottom: 8 }}>
          <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#1a1f36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "'Blacklist','Google Sans',serif", fontSize: 24, fontWeight: 800, color: "#1a1f36" }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{sub}</div>}
          </div>
          <div onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>
      );
    };
    const maskedPhone = "+91 " + phone.slice(0, 5) + "•••" + phone.slice(8);
    const totalSteps = 3;

    return (
      <div style={{ fontFamily: FN, maxWidth: 400, margin: "0 auto", height: "100vh", background: onbBg, backgroundBlendMode: "normal, normal, normal, saturation, normal", position: "relative", overflow: "hidden" }}>
        <FL />
        <style>{`
          @keyframes onbSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .onb-sheet-up { animation: onbSheetUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
          @keyframes onbFadeIn { from { opacity: 0; } to { opacity: 1; } }
          .onb-fade-in { animation: onbFadeIn 0.3s ease forwards; }
          @keyframes onbOrbGlow { 0%,100% { transform: scale(1); box-shadow: 0 0 40px rgba(59,130,246,0.3); } 50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(59,130,246,0.5); } }
          .onb-orb-glow { animation: onbOrbGlow 2.5s ease-in-out infinite; }
          @keyframes onbOrbGlowGreen { 0%,100% { transform: scale(1); box-shadow: 0 0 40px rgba(34,197,94,0.3); } 50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(34,197,94,0.5); } }
          .onb-orb-glow-green { animation: onbOrbGlowGreen 2.5s ease-in-out infinite; }
          @keyframes onbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>

        {/* Top progress pills (3 steps) */}
        <div style={{ position: "absolute", top: 52, left: 0, right: 0, display: "flex", gap: 7, justifyContent: "center", zIndex: 5 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ width: i === onStep - 1 ? 26 : 20, height: 5, borderRadius: 3, background: i <= onStep - 1 ? "#fff" : "rgba(255,255,255,0.4)" }} />
          ))}
        </div>

        {/* Blur overlay */}
        <div className="onb-fade-in" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 10 }} />

        {/* Bottom sheet */}
        <div className="onb-sheet-up" style={{ position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 20, background: "#fff", borderRadius: 28, boxShadow: "0 8px 60px rgba(0,0,0,0.15)", overflow: onStep === 3 ? "visible" : "hidden" }}>

          {/* Step 1: Phone */}
          {onStep === 1 && <div>
            <NavRow title="Enter Mobile Number" onClose={() => setOnStep(0)} />
            <div style={{ padding: "12px 24px 28px" }}>
              <div style={{ display: "flex", border: "1.5px solid rgba(29,78,216,0.12)", borderRadius: 14, overflow: "hidden", background: "rgba(239,246,255,0.6)" }}>
                <div style={{ padding: "16px 14px", borderRight: "1.5px solid rgba(29,78,216,0.1)", fontSize: 15, fontWeight: 600, color: "#1a1f36", display: "flex", alignItems: "center" }}>+91</div>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Mobile number" type="tel" autoFocus style={{ flex: 1, padding: "16px 14px", border: "none", outline: "none", fontSize: 15, fontFamily: FN, background: "transparent", color: "#1a1f36" }} />
              </div>
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>You will be signed up using</div>
                <div style={{ fontSize: 12, color: "#1a1f36", fontWeight: 600, marginTop: 4 }}>
                  <span style={{ color: "#ea580c", fontWeight: 800 }}>CASH</span>
                  <span style={{ color: "#1d4ed8", fontWeight: 800 }}>KARO</span>
                  <span style={{ fontWeight: 400, color: "#9ca3af" }}> - India's largest cashback platform</span>
                </div>
              </div>
              <SheetBtn text="Next" onClick={() => { if (phone.length === 10) { const rand = Array.from({ length: 6 }, () => String(Math.floor(Math.random() * 10))); setOtp(rand); setOnStep(2); setOtpTimer(30); } }} />
            </div>
          </div>}

          {/* Step 2: OTP */}
          {onStep === 2 && <div>
            <NavRow title="Confirmation Code" sub={"Sent to " + maskedPhone} showBack onBack={() => setOnStep(1)} onClose={() => setOnStep(0)} />
            <div style={{ padding: "12px 24px 28px" }}>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", position: "relative" }}>
                <input type="tel" maxLength={6} value={otp.join("")} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); const arr = v.split(""); while (arr.length < 6) arr.push(""); setOtp(arr); }} autoFocus style={{ position: "absolute", inset: 0, opacity: 0, fontSize: 20, zIndex: 2, cursor: "pointer" }} />
                {otp.map((d: string, i: number) => (
                  <div key={i} style={{ width: 46, height: 56, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, fontFamily: FN, border: `1.5px solid ${d ? "#0062f5" : "rgba(29,78,216,0.12)"}`, borderRadius: 14, background: d ? "rgba(239,246,255,0.8)" : "rgba(239,246,255,0.5)", color: "#1a1f36", transition: "border 0.2s, background 0.2s" }}>{d || ""}</div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Didn't get the OTP?</span>
                <span onClick={() => { if (otpTimer <= 0) setOtpTimer(30); }} style={{ fontSize: 12, fontWeight: 600, color: otpTimer > 0 ? "#9ca3af" : "#0062f5", cursor: otpTimer > 0 ? "default" : "pointer" }}>
                  {otpTimer > 0 ? `Resend OTP in 00:${String(otpTimer).padStart(2, "0")}` : "Resend OTP"}
                </span>
              </div>
              <SheetBtn text="Next" onClick={() => { if (otp.every((d: string) => d)) { setSmsStatus("idle"); setOnStep(3); } }} />
            </div>
          </div>}

          {/* Step 3: SMS Permission — orb above sheet (Figma: 96×96, top -32 from sheet) */}
          {onStep === 3 && <div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: -32 }}>
              <div style={{
                boxSizing: "border-box",
                width: 96, height: 96, borderRadius: 100,
                background: smsStatus === "granted"
                  ? "linear-gradient(180deg, #16a34a 0%, #22c55e 100%)"
                  : "linear-gradient(180deg, #0073FF 0%, #0DA2FF 100%)",
                boxShadow: smsStatus === "granted"
                  ? "0px 24.7206px 32.2574px rgba(87,255,140,0.1867), 0px 10.2677px 13.3981px rgba(87,255,140,0.22), 0px 3.71362px 4.84582px rgba(87,255,140,0.153301), 0px 0px 0px 4px #E0F2E5, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #D2FFD8, inset 0px 1px 4px 2px #D2FFD8"
                  : "0px 24.7206px 32.2574px rgba(87,177,255,0.1867), 0px 10.2677px 13.3981px rgba(87,177,255,0.22), 0px 3.71362px 4.84582px rgba(87,177,255,0.153301), 0px 0px 0px 4px #E0E9F2, 0px 0px 0px 5px #FFFFFF, inset 0px 1px 18px 2px #D2EAFF, inset 0px 1px 4px 2px #D2EAFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", zIndex: 30, flexShrink: 0,
                transition: "all 0.5s ease",
              }}>
                {smsStatus === "granted"
                  ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_491_9840)"><path d="M16 0C7.17733 0 0 7.17733 0 16C0 24.8227 7.17733 32 16 32H32V16C32 7.17733 24.8227 0 16 0ZM29.3333 29.3333H16C8.648 29.3333 2.66667 23.352 2.66667 16C2.66667 8.648 8.648 2.66667 16 2.66667C23.352 2.66667 29.3333 8.648 29.3333 16V29.3333ZM18 16C18 17.104 17.104 18 16 18C14.896 18 14 17.104 14 16C14 14.896 14.896 14 16 14C17.104 14 18 14.896 18 16ZM24.6667 16C24.6667 17.104 23.7707 18 22.6667 18C21.5627 18 20.6667 17.104 20.6667 16C20.6667 14.896 21.5627 14 22.6667 14C23.7707 14 24.6667 14.896 24.6667 16ZM11.3333 16C11.3333 17.104 10.4373 18 9.33333 18C8.22933 18 7.33333 17.104 7.33333 16C7.33333 14.896 8.22933 14 9.33333 14C10.4373 14 11.3333 14.896 11.3333 16Z" fill="white"/></g><defs><clipPath id="clip0_491_9840"><rect width="32" height="32" fill="white"/></clipPath></defs></svg>}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 24px", marginTop: -18 }}>
              <div onClick={() => setOnStep(2)} style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#1a1f36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div onClick={() => setOnStep(0)} style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
            </div>
            <div style={{ padding: "20px 24px 28px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Blacklist','Google Sans',serif", fontSize: 22, fontWeight: 800, color: "#1a1f36", marginBottom: 10 }}>Allow us to read your SMS</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>so that we can detect your spends automatically and help you optimize them</div>
              {(smsStatus === "idle" || smsStatus === "denied" || smsStatus === "dialog") && <SheetBtn text="Allow SMS Permissions" onClick={() => setSmsStatus("dialog")} />}
              {smsStatus === "denied" && <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500, color: "#dc2626", lineHeight: 1.5 }}>SMS permission required to analyse your spends</div>}
              {smsStatus === "loading" && <div style={{ marginTop: 20, padding: "18px 0", borderRadius: 16, background: "linear-gradient(180deg, #2a3040, #1a2030)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" style={{ animation: "onbSpin 1s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" /><path d="M12 2a10 10 0 019.8 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>
              </div>}
              {smsStatus === "granted" && <SheetBtn text="Permission Granted" onClick={() => { }} green />}
            </div>
          </div>}
        </div>

        {/* Privacy text outside sheet */}
        {onStep === 3 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 24px", textAlign: "center", zIndex: 5 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>We don't use personal chats, OTPs & non-bank messages for analysis.</span>
        </div>}

        {/* Android-style permission dialog */}
        {smsStatus === "dialog" && <>
          <div className="onb-fade-in" onClick={() => setSmsStatus("idle")} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100 }} />
          <div className="onb-fade-in" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 280, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", zIndex: 101, overflow: "hidden" }}>
            <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", border: "1px solid rgba(29,78,216,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#0062f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 14, color: "#1a1f36", lineHeight: 1.5 }}>Allow <b>App</b> to access SMS messages on your device?</div>
            </div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <div onClick={() => { setSmsStatus("loading"); setTimeout(() => setSmsStatus("granted"), 1500); }} style={{ padding: "16px", textAlign: "center", cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#0062f5" }}>Allow</span>
              </div>
              <div onClick={() => setSmsStatus("denied")} style={{ padding: "16px", textAlign: "center", cursor: "pointer" }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#0062f5" }}>Deny</span>
              </div>
            </div>
          </div>
        </>}
      </div>
    );
  }

  return null;
}
