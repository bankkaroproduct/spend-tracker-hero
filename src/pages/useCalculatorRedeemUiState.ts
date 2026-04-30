// Calculator and redeem UI state for the production Index orchestrator.
// Owns screen-local selections/results only; reward math stays in metrics/data layers.

import { useState } from "react";

export function useCalculatorRedeemUiState() {
  const [selBrand, setSelBrand] = useState(null);
  const [calcAmt, setCalcAmt] = useState("");
  const [calcPopup, setCalcPopup] = useState(false);
  const [calcResult, setCalcResult] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [calcTab, setCalcTab] = useState("Brands");
  const [chartPage, setChartPage] = useState(0);
  const [calcFilter, setCalcFilter] = useState("All");
  const [howExpanded, setHowExpanded] = useState(null);
  const [redeemCard, setRedeemCard] = useState(null);
  const [redeemPts, setRedeemPts] = useState("");
  const [redeemPref, setRedeemPref] = useState(null);
  const [redeemResult, setRedeemResult] = useState(null);
  const [redeemTab, setRedeemTab] = useState("All");

  return {
    selBrand,
    setSelBrand,
    calcAmt,
    setCalcAmt,
    calcPopup,
    setCalcPopup,
    calcResult,
    setCalcResult,
    searchQ,
    setSearchQ,
    calcTab,
    setCalcTab,
    chartPage,
    setChartPage,
    calcFilter,
    setCalcFilter,
    howExpanded,
    setHowExpanded,
    redeemCard,
    setRedeemCard,
    redeemPts,
    setRedeemPts,
    redeemPref,
    setRedeemPref,
    redeemResult,
    setRedeemResult,
    redeemTab,
    setRedeemTab,
  };
}
