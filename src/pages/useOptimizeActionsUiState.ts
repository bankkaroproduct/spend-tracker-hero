// Optimize and actions UI state for the production Index orchestrator.
// Owns filters, selected tab/sheet, and expansion state; business values come from data selectors.

import { useState } from "react";

export function useOptimizeActionsUiState() {
  const [actFilter, setActFilter] = useState("All");
  const [optTab, setOptTab] = useState("Brands");
  const [optSheet, setOptSheet] = useState(null);
  const [optSheetFrom, setOptSheetFrom] = useState("optimize");
  const [optExpanded, setOptExpanded] = useState(0);

  return {
    actFilter,
    setActFilter,
    optTab,
    setOptTab,
    optSheet,
    setOptSheet,
    optSheetFrom,
    setOptSheetFrom,
    optExpanded,
    setOptExpanded,
  };
}
