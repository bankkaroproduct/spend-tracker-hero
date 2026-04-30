// Shared overlay UI state for the production Index orchestrator.
// Owns generic sheets, toast timing, and skip confirmation visibility only.

import { useEffect, useState } from "react";

export function useOverlayUiState() {
  const [capSheet, setCapSheet] = useState(null);
  const [toast, setToast] = useState(null);
  const [infoSheet, setInfoSheet] = useState(null);
  const [actSheet, setActSheet] = useState(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return {
    capSheet,
    setCapSheet,
    toast,
    setToast,
    infoSheet,
    setInfoSheet,
    actSheet,
    setActSheet,
    showSkipConfirm,
    setShowSkipConfirm,
  };
}
