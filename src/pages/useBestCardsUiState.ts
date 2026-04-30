// Best-cards and portfolio UI state for the production Index orchestrator.
// Pure state bucket: no side effects, route changes, or data calculations.

import { useState } from "react";

export function useBestCardsUiState() {
  const [bestCardDetail, setBestCardDetail] = useState<any>(null);
  const [portfolioNew, setPortfolioNew] = useState<string[]>([]);
  const [portfolioEntryCard, setPortfolioEntryCard] = useState<string | null>(null);
  const [bcFilter, setBcFilter] = useState<any[]>([]);
  const [bcSearch, setBcSearch] = useState("");
  const [bcSearchOpen, setBcSearchOpen] = useState(false);
  const [bcDetTab, setBcDetTab] = useState(100);
  const [bcViewMode, setBcViewMode] = useState("On Brands");
  const [bcSection, setBcSection] = useState("overview");
  const [bcFavs, setBcFavs] = useState<any[]>([]);
  const [bcSort, setBcSort] = useState("Best Match");
  const [bcListView, setBcListView] = useState("list");
  const [bcShowSort, setBcShowSort] = useState(false);
  const [bcEligSheet, setBcEligSheet] = useState<any>(null);
  const [bcFromScreen, setBcFromScreen] = useState("home");

  return {
    bestCardDetail,
    setBestCardDetail,
    portfolioNew,
    setPortfolioNew,
    portfolioEntryCard,
    setPortfolioEntryCard,
    bcFilter,
    setBcFilter,
    bcSearch,
    setBcSearch,
    bcSearchOpen,
    setBcSearchOpen,
    bcDetTab,
    setBcDetTab,
    bcViewMode,
    setBcViewMode,
    bcSection,
    setBcSection,
    bcFavs,
    setBcFavs,
    bcSort,
    setBcSort,
    bcListView,
    setBcListView,
    bcShowSort,
    setBcShowSort,
    bcEligSheet,
    setBcEligSheet,
    bcFromScreen,
    setBcFromScreen,
  };
}

