## What's wrong

`src/features/building/BuildingScreen.tsx` is the **stale cinematic** you're seeing on `/building`:

- Card thumbs are **CSS rectangles with initials** ("HTO / AF / HL", "Cards Detected via SMS"), not the real card art used in the new flow.
- Uses old emoji orbs (📦 🛒 🍔 ✈️) instead of the magnifying-glass / 3D icon treatment.
- Driven by a 14-phase `buildPhase` state machine in `Index.tsx` that hasn't been kept in sync.
- It is **not** the screen shown in your reference images. Those come from:
  - `src/features/onboard/SpendAnalysisScreen.tsx` (cards row + spend categories cinematic)
  - `src/features/onboard/TxnEvalScreen.tsx` (the "Now let's evaluate your transactions" magnifying-glass orb in image 21)
  - `src/features/onboard/ToolsIntroScreen.tsx` (3 tool tiles cinematic)
  - `src/features/onboard/FinalLoadingScreen.tsx` (Finalising → Optimizing → Creating dashboard, then home)

These four screens already exist, are wired into `Index.tsx` (screens `analysis`, `txn-eval`, `tools-intro`, `final-loading`), and use real `/legacy-assets/cards/*.png` images.

## Plan

### 1. Delete the stale file
- Remove `src/features/building/BuildingScreen.tsx` entirely.

### 2. Make `/building` enter the new cinematic chain
In `src/pages/Index.tsx`:
- Remove the import `import { BuildingScreen } from "@/features/building/BuildingScreen"`.
- Remove the `if(screen==="building")body=<BuildingScreen/>;` line.
- In the URL→screen map (line 315), change `if(p==="/building")return {screen:"building"}` → `return {screen:"analysis"}` so the `/building` URL boots into `SpendAnalysisScreen`, which then chains: analysis → txn-eval → tools-intro → final-loading → home (this chain is already implemented in those screens).
- In the screen→URL map (line 303), drop the `s==="building"` branch (no screen will produce that URL anymore).
- Strip the now-dead `building`-related effects/refs:
  - `gmailReturnTo` default + the `if(gmailReturnTo==="building")` branch (line 191) → point Gmail return to `"analysis"` instead.
  - The 4 effects keyed on `screen==="building"` (lines 392, 398, 399, 400) — delete them; they drive the old `buildPhase` machine which no longer exists.
  - The `replace=screen==="building"||...` history logic (line 344) — replace `"building"` with `"analysis"` so the cinematic still uses `replaceState` (no back-button trap).

### 3. Keep `/building` working as a URL
`App.tsx` line 23 (`<Route path="/building" element={<Index />} />`) stays — visiting `/building` now lands on `SpendAnalysisScreen` and plays the correct cinematic.

### 4. Leave the rest alone
- `buildPhase` / `buildSub` / `buildCardReveal` / `buildRef` state in `Index.tsx` and `AppContext` is only consumed by the deleted BuildingScreen — safe to leave as unused state for now (removing it touches the giant `ctxValue` object and risks unrelated breakage). Can be cleaned up in a follow-up.
- No other file imports `BuildingScreen`. Verified via grep — only `Index.tsx` references it.

## Result

Visiting `/building` plays the real cinematic you uploaded (real card images, magnifying glass orb, "Now let's evaluate your transactions…", tools intro, "Creating your dashboard", then `/home`). The stale file is gone.
