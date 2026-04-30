// Gmail nudge and voice-card-identification flow for the production Index orchestrator.
// Owns nudge visibility/dismissal state plus browser SpeechRecognition matching.

import { useRef, useState } from "react";
import { CARD_CATALOGUE } from "@/data/bestCards";

export interface NudgeAndVoiceFlowDeps {
  hasGmail: boolean;
  screen: string;
  setCardMapping: (updater: any) => void;
  setMappingCompleted: (value: boolean) => void;
  startGmailFlow: (returnTo: string) => void;
}

export function useNudgeAndVoiceFlow({
  hasGmail,
  screen,
  setCardMapping,
  setMappingCompleted,
  startGmailFlow,
}: NudgeAndVoiceFlowDeps) {
  const [gmailSheet, setGmailSheet] = useState(false);
  const [relinkingGmail, setRelinkingGmail] = useState(false);
  const [nudgeDismissals, setNudgeDismissals] = useState(0);
  const [nudgePermanentlyDismissed, setNudgePermanentlyDismissed] = useState(false);
  const [showGmailNudge, setShowGmailNudge] = useState(false);
  const [showGmailNudgeSheet, setShowGmailNudgeSheet] = useState(false);
  const [nudgeShownThisSession, setNudgeShownThisSession] = useState<Record<string, boolean>>({ home: false, detail: false, redeem: false, optimize: false });
  const [showVoiceFlow, setShowVoiceFlow] = useState(false);
  const [voiceCardIndex, setVoiceCardIndex] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceMatch, setVoiceMatch] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  const shouldShowNudge = (screenKey: string) => {
    if (hasGmail) return false;
    if (nudgePermanentlyDismissed) return false;
    if (nudgeDismissals >= 3) return false;
    if (nudgeShownThisSession[screenKey]) return false;
    return true;
  };

  const markNudgeShown = (key: string) => setNudgeShownThisSession((prev) => ({ ...prev, [key]: true }));

  const dismissNudge = () => {
    setNudgeDismissals((prev) => prev + 1);
    setShowGmailNudge(false);
    setShowGmailNudgeSheet(false);
  };

  const retroEnrichFromGmail = () => {
    setShowGmailNudge(false);
    setShowGmailNudgeSheet(false);
    startGmailFlow("home");
  };

  const beginListening = () => {
    const w = window as any;
    const SR = typeof window !== "undefined" && (w.SpeechRecognition || w.webkitSpeechRecognition);
    if (!SR) {
      setVoiceTranscript("Voice not supported on this browser");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      const allCards = Object.entries(CARD_CATALOGUE).flatMap(([bank, cards]: any) => cards.map((card) => ({ ...card, bank })));
      const lowerTranscript = transcript.toLowerCase();
      const match = allCards.find((card: any) => {
        const full = (card.bank.replace(" Bank", "") + " " + card.name).toLowerCase();
        return full.includes(lowerTranscript)
          || lowerTranscript.includes(card.name.toLowerCase())
          || card.name.toLowerCase().split(" ").some((word) => word.length > 3 && lowerTranscript.includes(word));
      });
      setVoiceMatch(match || null);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    try {
      recognition.start();
    } catch {
      // Browser may reject duplicate starts; keep current UI state unchanged.
    }
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const confirmVoiceMatch = () => {
    if (voiceMatch === null || voiceCardIndex === null) return;
    setCardMapping((prev) => ({ ...prev, [voiceCardIndex]: voiceMatch.name }));
    setShowVoiceFlow(false);
    setVoiceTranscript("");
    setVoiceMatch(null);
    if (screen === "detail") setMappingCompleted(true);
  };

  return {
    gmailSheet,
    setGmailSheet,
    relinkingGmail,
    setRelinkingGmail,
    nudgeDismissals,
    setNudgeDismissals,
    nudgePermanentlyDismissed,
    setNudgePermanentlyDismissed,
    showGmailNudge,
    setShowGmailNudge,
    showGmailNudgeSheet,
    setShowGmailNudgeSheet,
    nudgeShownThisSession,
    setNudgeShownThisSession,
    showVoiceFlow,
    setShowVoiceFlow,
    voiceCardIndex,
    setVoiceCardIndex,
    isListening,
    setIsListening,
    voiceTranscript,
    setVoiceTranscript,
    voiceMatch,
    setVoiceMatch,
    recognitionRef,
    shouldShowNudge,
    markNudgeShown,
    dismissNudge,
    retroEnrichFromGmail,
    beginListening,
    confirmVoiceMatch,
  };
}
