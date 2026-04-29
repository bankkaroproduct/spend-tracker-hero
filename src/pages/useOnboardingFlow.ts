// Onboarding flow state for the production Index orchestrator.
// Owns the value-prop carousel, phone/OTP, SMS permission, and welcome-typing
// timed sequences that drive the pre-home screens.

import { useEffect, useRef, useState } from "react";

export interface OnboardingFlowDeps {
  screen: string;
  setScreen: (screen: string) => void;
}

export function useOnboardingFlow(deps: OnboardingFlowDeps) {
  // 0=value-prop-carousel, 1=phone, 2=otp, 3=sms, 4=loading, 5=done
  const [onStep, setOnStep] = useState(0);
  const [vpSlide, setVpSlide] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(30);
  const [smsStatus, setSmsStatus] = useState("idle"); // idle | dialog | loading | granted
  const [welcomeTyped, setWelcomeTyped] = useState("");
  const otpRefs = useRef<any[]>([]);

  // OTP countdown timer
  useEffect(() => {
    if (onStep !== 2 || otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [onStep, otpTimer]);

  // Welcome typing animation
  useEffect(() => {
    if (onStep !== 3) return;
    const msg = "Hello there!";
    let i = 0;
    setWelcomeTyped("");
    const iv = setInterval(() => {
      i++;
      setWelcomeTyped(msg.slice(0, i));
      if (i >= msg.length) clearInterval(iv);
    }, 60);
    return () => clearInterval(iv);
  }, [onStep]);

  // Auto-navigate to spend-analysis 2s after SMS permission granted
  useEffect(() => {
    if (smsStatus !== "granted") return;
    const t = setTimeout(() => {
      deps.setScreen("analysis");
    }, 2000);
    return () => clearTimeout(t);
  }, [smsStatus]);

  // Value-prop carousel auto-rotate
  useEffect(() => {
    if (deps.screen !== "onboard" || onStep !== 0) return;
    const t = setInterval(() => setVpSlide((s) => (s + 1) % 4), 4000);
    return () => clearInterval(t);
  }, [deps.screen, onStep]);

  return {
    onStep,
    setOnStep,
    vpSlide,
    setVpSlide,
    phone,
    setPhone,
    otp,
    setOtp,
    otpTimer,
    setOtpTimer,
    smsStatus,
    setSmsStatus,
    welcomeTyped,
    otpRefs,
  };
}
