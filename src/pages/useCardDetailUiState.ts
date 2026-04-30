// Owned-card detail UI state for the production Index orchestrator.
// Owns selected card index, tabs, paging, analysis controls, and sticky-tab scroll behavior.

import { useEffect, useRef, useState } from "react";

export interface CardDetailUiStateDeps {
  screen: string;
  setScreen: (screen: string) => void;
}

export function useCardDetailUiState({ screen, setScreen }: CardDetailUiStateDeps) {
  const [ci, setCi] = useState(0);
  const [spendTab, setSpendTab] = useState("Categories");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  const [usageMode, setUsageMode] = useState("Savings");
  const [usageCat, setUsageCat] = useState("Categories");
  const [timePeriod, setTimePeriod] = useState("Last 365 Days");
  const [timePeriodOpen, setTimePeriodOpen] = useState(false);
  const [txnExp, setTxnExp] = useState(false);
  const [tabSticky, setTabSticky] = useState(false);
  const [txnPage, setTxnPage] = useState(1);
  const dRef = useRef<any>(null);
  const dRefs = useRef({});
  const sentRef = useRef<any>(null);

  useEffect(() => {
    if (screen !== "detail" || !dRef.current) return;
    const element = dRef.current;
    const onScroll = () => {
      if (sentRef.current) setTabSticky(sentRef.current.getBoundingClientRect().top <= element.getBoundingClientRect().top);
    };
    element.addEventListener("scroll", onScroll);
    return () => element.removeEventListener("scroll", onScroll);
  }, [screen]);

  const openCard = (index: number) => {
    setCi(index);
    setScreen("detail");
    setDetailTab(0);
    setTxnPage(1);
  };

  return {
    ci,
    setCi,
    spendTab,
    setSpendTab,
    showAllBrands,
    setShowAllBrands,
    detailTab,
    setDetailTab,
    usageMode,
    setUsageMode,
    usageCat,
    setUsageCat,
    timePeriod,
    setTimePeriod,
    timePeriodOpen,
    setTimePeriodOpen,
    txnExp,
    setTxnExp,
    tabSticky,
    setTabSticky,
    txnPage,
    setTxnPage,
    dRef,
    dRefs,
    sentRef,
    openCard,
  };
}

