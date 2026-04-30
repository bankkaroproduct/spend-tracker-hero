// Transaction list and filtering UI state for the production Index orchestrator.
// Owns transaction sheets, category/filter sheets, removed transactions, and filtered list derivation.

import { useState } from "react";
import { ALL_TXNS } from "@/data/simulation/legacy";
import { doFilter, doSort } from "@/components/shared/SortFilter";

export interface TransactionUiStateDeps {
  setScreen: (screen: string) => void;
}

export function useTransactionUiState({ setScreen }: TransactionUiStateDeps) {
  const [sortBy, setSortBy] = useState("Recent");
  const [filters, setFilters] = useState<any[]>([]);
  const [catSheet, setCatSheet] = useState<any>(null);
  const [txnSheet, setTxnSheet] = useState<any>(null);
  const [filterSheet, setFilterSheet] = useState(false);
  const [filterTab, setFilterTab] = useState("Sort");
  const [catStep, setCatStep] = useState(1);
  const [selCat, setSelCat] = useState<any>(null);
  const [removedTxns, setRemovedTxns] = useState(new Set());
  const [txnCatOverrides, setTxnCatOverridesState] = useState({});

  const setTxnCatOverride = (idx: number, patch: any) => setTxnCatOverridesState((prev) => ({
    ...prev,
    [idx]: { ...(prev[idx] || {}), ...patch },
  }));

  const toggleFilter = (filter: any) => setFilters((prev) => (prev.includes(filter) ? [] : [filter]));
  const multiToggle = (filter: any) => setFilters((prev) => (prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter]));
  const goTxns = (prefilter?: any) => {
    if (prefilter) setFilters([prefilter]);
    setSortBy("Recent");
    setScreen("transactions");
  };

  const activeTxnList = ALL_TXNS.filter((_, index) => !removedTxns.has(index));
  const sorted = doSort(activeTxnList, sortBy);
  const filtered = doFilter(sorted, filters);

  return {
    sortBy,
    setSortBy,
    filters,
    setFilters,
    catSheet,
    setCatSheet,
    txnSheet,
    setTxnSheet,
    filterSheet,
    setFilterSheet,
    filterTab,
    setFilterTab,
    catStep,
    setCatStep,
    selCat,
    setSelCat,
    removedTxns,
    setRemovedTxns,
    txnCatOverrides,
    setTxnCatOverride,
    toggleFilter,
    multiToggle,
    activeTxnList,
    filtered,
    goTxns,
  };
}

