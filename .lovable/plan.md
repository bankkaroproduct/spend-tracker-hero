

# Add MVP State Picker on Skip

## Goal

When the user taps **Skip →** on the value-prop carousel, instead of dropping straight into State 1, show a small bottom sheet that lets the tester pick which state to enter. This is purely an MVP / QA convenience so the three documented states (per the uploaded spec tables) can be exercised without going through the full SMS/Gmail flows.

## The three states (from your spec)

| Option | Internal flags | What it shows |
|---|---|---|
| **State 1 — SMS Only** | `hasGmail=false`, `mappingCompleted=false`, `cardMapping={}`, `userFlag="PARTIAL"` | Card strip shows `HSBC ••7891`, PARTIAL chips, no hero gauge, Gmail nudge banner, locked Optimize, etc. |
| **State 2 — Manually Mapped** | `hasGmail=false`, `mappingCompleted=true`, `cardMapping={0:"Travel One",1:"Flipkart",2:"Live+"}`, `userFlag="PARTIAL"` | Real card names, full hero gauge, Optimize unlocked, "See your actual progress" nudges in card detail. |
| **State 3 — Gmail Connected** | `hasGmail=true`, `mappingCompleted=true`, `cardMapping={0:"Travel One",1:"Flipkart",2:"Live+"}`, `userFlag="NORMAL"` | Fully unlocked everything; no Gmail nudges. |

The `isState1`/`isState2`/`isState3` derivations already exist in `Index.tsx` — we just need to seed the right combination of flags.

## What we'll build

### 1. New skip-state picker sheet (in `OnboardScreen.tsx`)

- Add local state `const [skipPickerOpen, setSkipPickerOpen] = useState(false)` via context (or local — see Technical notes).
- Change the **Skip →** click handler from immediate navigation to `setSkipPickerOpen(true)`.
- When `skipPickerOpen` is true, render a bottom sheet over the carousel with three tap rows:
  1. **SMS Only** — "Card names hidden, partial data, Gmail nudges everywhere"
  2. **Manually Mapped** — "Real card names, full data, no card-mapping nudges"
  3. **Gmail Connected** — "Everything unlocked, no nudges"
  - Plus a small **Cancel** action to dismiss.
- Each row, on tap, sets the corresponding flag combination above and calls `setScreen("home")`.

### 2. Wire the new setter through `AppContext`

`Index.tsx` already exposes `setHasGmail`, `setMappingCompleted`, `setCardMapping`, `setScreen`. We additionally need `setUserFlag` in the context value (it currently isn't passed). Add it to the Provider value object so the picker can flip `PARTIAL` ↔ `NORMAL`.

### 3. Visual style

Match the existing `SheetWrap` / `PrimaryBtn` styling already in `OnboardScreen.tsx` (white rounded sheet, subtle shadow, dark CTA buttons). Use a small badge per row (`State 1` / `State 2` / `State 3`) for clarity since this is a QA tool.

## Technical notes

- **Files to edit**
  - `src/pages/Index.tsx` — add `setUserFlag` to the AppContext provider value.
  - `src/features/onboard/OnboardScreen.tsx` — replace skip handler with sheet open; add the picker sheet markup; pull `setUserFlag` from context.
- **No new files, no new dependencies.**
- The picker only appears when the user explicitly taps Skip on step 0 — full SMS/OTP/Gmail flow continues to work unchanged for users who go through it normally.
- All three options end on `setScreen("home")`. The existing `useEffect` that auto-navigates and the URL ⇄ state sync handle the rest.
- Because flags are persisted to `localStorage` (`sa:hasGmail`, `sa:mappingCompleted`, `sa:cardMapping`, `sa:userFlag`), the picked state survives reloads — handy for QA. The existing playwright fixture's `localStorage.clear()` in `beforeEach` keeps tests isolated.

## Out of scope

- No changes to the actual State 1/2/3 rendering logic — those derivations (`isState1`, `isState2`, `isState3`) and per-screen behaviors already exist.
- No "Reset to onboarding" affordance (can be added later if you want a way to flip back without clearing storage).

