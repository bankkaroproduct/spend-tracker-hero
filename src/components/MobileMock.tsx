// @ts-nocheck
import { useEffect, useState, ReactNode } from "react";

/**
 * MobileMock — non-intrusive iPhone chrome.
 *
 * Key insight: every cinematic / onboarding screen uses `height: 100vh` to
 * pin its footer. If we wrap the app in a phone-shaped container that is
 * shorter than the viewport, those footers get clipped.
 *
 * Solution: the app keeps the *full* window viewport (so 100vh works exactly
 * as the screens expect). The "phone look" is added as fixed overlays:
 *   - dark bezels filling the empty horizontal space on either side of the
 *     400-wide app column
 *   - a subtle Dynamic-Island notch at the very top (overlays the 9:41 strip)
 *   - a thin home indicator at the very bottom (overlays only the bottom
 *     4 px of the screen — never the footer text)
 *
 * On viewports < 700 px the mock collapses entirely so the app is full-screen
 * on real phones. All overlays are `pointer-events: none` so the app remains
 * fully interactive.
 *
 * Sizing uses rem-friendly multiples + vw fallbacks so the chrome scales
 * cleanly across desktop window sizes.
 */
export function MobileMock({ children }: { children: ReactNode }) {
  const [showMock, setShowMock] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 700 : true
  );

  useEffect(() => {
    const handler = () => setShowMock(window.innerWidth >= 700);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!showMock) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Set a dark page background so the bezels read as the phone shell. */}
      <style>{`
        body { background: #0a0a0d !important; }
        html, body, #root { min-height: 100vh; }
      `}</style>

      {/* App renders at its natural full-viewport size — footers in 100vh
          layouts now sit exactly at the bottom of the device "screen". */}
      {children}

      {/* ── Left bezel — fills the empty space to the left of the 400-wide app column. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: "calc((100vw - 400px) / 2)",
          background: "linear-gradient(90deg, #050507 0%, #0a0a0d 60%, #15151b 100%)",
          zIndex: 9990,
          pointerEvents: "none",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04)",
        }}
      />

      {/* ── Right bezel — mirror of left. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          right: 0,
          width: "calc((100vw - 400px) / 2)",
          background: "linear-gradient(270deg, #050507 0%, #0a0a0d 60%, #15151b 100%)",
          zIndex: 9990,
          pointerEvents: "none",
          boxShadow: "inset 1px 0 0 rgba(255,255,255,0.04)",
        }}
      />

      {/* ── Dynamic Island — overlays the very top of the screen, above the 9:41 strip. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "0.875rem",       // 14 px @ 16 px root
          left: "50%",
          transform: "translateX(-50%)",
          width: "7.75rem",      // 124 px
          height: "1.875rem",    // 30 px
          background: "#000",
          borderRadius: "1.25rem",
          boxShadow:
            "inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.5)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />

      {/* ── Home indicator — pinned to the absolute bottom edge so it never
          overlaps footer text (which sits with its own bottom padding). */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "0.25rem",      // 4 px
          left: "50%",
          transform: "translateX(-50%)",
          width: "8.375rem",     // 134 px
          height: "0.3125rem",   // 5 px
          background: "rgba(20, 20, 24, 0.55)",
          borderRadius: "0.1875rem",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
