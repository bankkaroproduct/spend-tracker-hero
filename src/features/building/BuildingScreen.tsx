// @ts-nocheck
import { useEffect } from "react";
import { useAppContext } from "@/store/AppContext";

/**
 * BuildingScreen is legacy/stale. The /building route now redirects to /home.
 * The real onboarding cinematic lives in src/features/onboard/ (SpendAnalysisScreen,
 * TxnEvalScreen, ToolsIntroScreen, FinalLoadingScreen).
 */
export function BuildingScreen() {
  const ctx: any = useAppContext();
  const { setScreen } = ctx;
  useEffect(() => { setScreen("home"); }, [setScreen]);
  return null;
}
