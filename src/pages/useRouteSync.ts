// Route synchronization hook for the production Index orchestrator.
// Keeps the existing MVP screen-state router while moving URL logic out of Index.

import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getFallbackPath } from "@/lib/storage";
import { nameToSlug, pathToScreen, screenToPath } from "@/routes/routeState";

interface UseRouteSyncArgs {
  screen: string;
  ci: number;
  bestCardDetail: any;
  setScreen: (screen: string) => void;
  setCi: (ci: number) => void;
  setBestCardDetail: (card: any) => void;
  bestCards: any[];
  prevScreenRef: { current: string };
}

export function useRouteSync({
  screen,
  ci,
  bestCardDetail,
  setScreen,
  setCi,
  setBestCardDetail,
  bestCards,
  prevScreenRef,
}: UseRouteSyncArgs): void {
  const navigate = useNavigate();
  const location = useLocation();
  const routeSyncedRef = useRef(false);

  useEffect(() => {
    if (!routeSyncedRef.current) return;
    const target = screenToPath(screen, ci, bestCardDetail);
    if (location.pathname !== target) {
      const replace = screen === "building" || (screen === "home" && prevScreenRef.current === "building");
      console.log("[debug State->URL]", "screen=", screen, "target=", target, "current path=", location.pathname);
      navigate(target, { replace });
    }
  }, [screen, ci, bestCardDetail, location.pathname, navigate, prevScreenRef]);

  useEffect(() => {
    const fallbackPath = getFallbackPath();
    const activePath = fallbackPath || location.pathname;
    const parsed = pathToScreen(activePath.split("?")[0]);
    if (!parsed) {
      routeSyncedRef.current = true;
      return;
    }
    if (parsed.screen !== screen) setScreen(parsed.screen);
    if (parsed.ci != null && parsed.ci !== ci) setCi(parsed.ci);

    if (parsed.bestCardSlug && !bestCardDetail) {
      try {
        const slug = parsed.bestCardSlug;
        const found = bestCards.find((card) => nameToSlug(card.name || "") === slug);
        if (found) setBestCardDetail(found);
      } catch {
        // Best-card detail links should fall back to the list view if data is unavailable.
      }
    }
    if (fallbackPath && typeof window !== "undefined") window.history.replaceState(null, "", fallbackPath);
    routeSyncedRef.current = true;
  }, [location.pathname, screen, ci, bestCardDetail, setScreen, setCi, setBestCardDetail, bestCards]);
}

