// Gmail linking flow state for the production Index orchestrator.
// Owns the Gmail OAuth/extra-info screen state plus the completion handoff
// that flips identity flags and routes to the next screen (building/home/etc).

import { useState } from "react";

export interface GmailFlowDeps {
  setScreen: (screen: string) => void;
  setHasGmail: (value: boolean) => void;
  setUserFlag: (value: string) => void;
  setMappingCompleted: (value: boolean) => void;
  setCardMapping: (value: any) => void;
  setBuildPhase: (value: number) => void;
}

export function useGmailFlow(deps: GmailFlowDeps) {
  const [gmailStep, setGmailStep] = useState(0);
  const [gmailReturnTo, setGmailReturnTo] = useState("building");
  const [gmailOtp, setGmailOtp] = useState(["", "", "", ""]);
  const [gmailFirstName, setGmailFirstName] = useState("Aarav");
  const [gmailLastName, setGmailLastName] = useState("Sharma");
  const [gmailDob, setGmailDob] = useState("");
  const [hsbcDigits1, setHsbcDigits1] = useState(["", "", "", "", "8", "4"]);
  const [hsbcDigits2, setHsbcDigits2] = useState(["", "", "", "", "2", "1"]);

  const completeGmailLink = () => {
    deps.setHasGmail(true);
    deps.setUserFlag("NORMAL");
    deps.setMappingCompleted(true);
    deps.setCardMapping({ 0: "Travel One", 1: "Flipkart", 2: "Live+" });
    setGmailStep(0);
    setGmailOtp(["", "", "", ""]);
    // Honor the return target set by `startGmailFlow(returnTo)`.
    // Onboarding wants to go through txn-eval/tools-intro; other entry points may return to home/detail.
    if (gmailReturnTo === "building") {
      deps.setBuildPhase(3);
      deps.setScreen("building");
    } else {
      deps.setScreen(gmailReturnTo);
    }
  };

  const startGmailFlow = (returnTo: string) => {
    setGmailReturnTo(returnTo);
    setGmailStep(0);
    setGmailOtp(["", "", "", ""]);
    deps.setScreen("gmail");
  };

  return {
    gmailStep,
    setGmailStep,
    gmailReturnTo,
    gmailOtp,
    setGmailOtp,
    gmailFirstName,
    setGmailFirstName,
    gmailLastName,
    setGmailLastName,
    gmailDob,
    setGmailDob,
    hsbcDigits1,
    setHsbcDigits1,
    hsbcDigits2,
    setHsbcDigits2,
    completeGmailLink,
    startGmailFlow,
  };
}
