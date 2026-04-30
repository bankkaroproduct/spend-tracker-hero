// Screen-change scroll reset for the production Index orchestrator.
// Keeps route sync aware of the previous screen while resetting scrollable page containers.

import { useEffect, useRef } from "react";

export function useScreenScrollReset(screen: string) {
  const prevScreenRef = useRef(screen);
  const scrollTimerRef = useRef<any>(null);

  useEffect(() => {
    if (prevScreenRef.current !== screen) {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        document.querySelectorAll("[data-scroll]").forEach((element: any) => {
          element.scrollTop = 0;
        });
        scrollTimerRef.current = null;
      }, 50);
      prevScreenRef.current = screen;
    }

    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
    };
  }, [screen]);

  return prevScreenRef;
}
