// Building and save-phase flow state for the production Index orchestrator.
// Owns the animated building sequencer, mapping pause flags, and tools-intro timed handoff.

import { useEffect, useRef, useState } from "react";

export interface BuildingFlowDeps {
  screen: string;
  setScreen: (screen: string) => void;
}

export function useBuildingFlow({ screen, setScreen }: BuildingFlowDeps) {
  const [buildPhase, setBuildPhase] = useState(0);
  const [buildSub, setBuildSub] = useState(0);
  const [buildCardReveal, setBuildCardReveal] = useState(-1);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const touchStartX = useRef(0);
  const buildRef = useRef<any>(null);

  const [showCardMappingUI, setShowCardMappingUI] = useState(false);
  const [mappingStep, setMappingStep] = useState(0);
  const [mappingSearchQ, setMappingSearchQ] = useState("");
  const [showResolutionSummary, setShowResolutionSummary] = useState(false);

  const [toolStep, setToolStep] = useState(0);
  const [reminderStep, setReminderStep] = useState(0);
  const [finalLoad, setFinalLoad] = useState(0);
  const [savePhase, setSavePhase] = useState(false);

  useEffect(() => {
    if (!savePhase) return;
    setToolStep(0);
    setReminderStep(0);
    setFinalLoad(0);
    const timers = [];
    timers.push(setTimeout(() => setToolStep(1), 2000));
    timers.push(setTimeout(() => setToolStep(2), 6000));
    timers.push(setTimeout(() => setToolStep(3), 10000));
    timers.push(setTimeout(() => setReminderStep(1), 13500));
    timers.push(setTimeout(() => setReminderStep(2), 15500));
    timers.push(setTimeout(() => setReminderStep(3), 16500));
    timers.push(setTimeout(() => setReminderStep(4), 17500));
    timers.push(setTimeout(() => setFinalLoad(1), 20000));
    timers.push(setTimeout(() => setFinalLoad(2), 22500));
    timers.push(setTimeout(() => setFinalLoad(3), 25000));
    timers.push(setTimeout(() => {
      setSavePhase(false);
      setScreen("home");
    }, 27500));
    return () => timers.forEach(clearTimeout);
  }, [savePhase]);

  useEffect(() => {
    if (screen !== "building" || showCardMappingUI || showResolutionSummary) return;
    const delays = { 0: 3000, 1: 4000, 3: 2500, 4: 4000, 5: 3000, 6: 6000, 7: 2000, 8: 4000, 10: 4000, 11: 4000, 12: 4000, 13: 3000 };
    const delay = delays[buildPhase];
    if (!delay) return;
    const timer = setTimeout(() => {
      setBuildSub(0);
      setBuildPhase((phase) => phase + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [screen, buildPhase, showCardMappingUI, showResolutionSummary]);

  useEffect(() => {
    if (buildPhase !== 9) return;
    if (buildSub < 7) {
      const timer = setTimeout(() => setBuildSub((sub) => sub + 1), [0, 1200, 1200, 1200, 1200, 2000, 2500, 2500][buildSub + 1] || 1200);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setBuildSub(0);
      setBuildPhase(10);
    }, 3000);
    return () => clearTimeout(timer);
  }, [buildPhase, buildSub]);

  useEffect(() => {
    if (screen === "building" && buildPhase >= 14) setScreen("home");
  }, [buildPhase, screen]);

  useEffect(() => {
    if (screen === "building" && buildRef.current) {
      setTimeout(() => buildRef.current.scrollTo({ top: 0, behavior: "smooth" }), 200);
    }
  }, [screen, buildPhase]);

  useEffect(() => {
    if (screen === "building" && buildRef.current && buildPhase === 9) {
      setTimeout(() => buildRef.current.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  }, [screen, buildPhase, buildSub]);

  useEffect(() => {
    if (buildPhase === 1) {
      setBuildCardReveal(-1);
      setCarouselIdx(0);
      const t0 = setTimeout(() => setBuildCardReveal(0), 400);
      const t1 = setTimeout(() => {
        setBuildCardReveal(1);
        setCarouselIdx(1);
      }, 1400);
      const t2 = setTimeout(() => {
        setBuildCardReveal(2);
        setCarouselIdx(2);
      }, 2400);
      const t3 = setTimeout(() => setCarouselIdx(0), 3200);
      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
    if (buildPhase > 1 && buildCardReveal < 2) setBuildCardReveal(2);
  }, [buildPhase, buildCardReveal]);

  return {
    buildPhase,
    setBuildPhase,
    buildSub,
    setBuildSub,
    buildCardReveal,
    setBuildCardReveal,
    carouselIdx,
    setCarouselIdx,
    touchStartX,
    buildRef,
    showCardMappingUI,
    setShowCardMappingUI,
    mappingStep,
    setMappingStep,
    mappingSearchQ,
    setMappingSearchQ,
    showResolutionSummary,
    setShowResolutionSummary,
    toolStep,
    setToolStep,
    reminderStep,
    setReminderStep,
    finalLoad,
    setFinalLoad,
    savePhase,
    setSavePhase,
  };
}
