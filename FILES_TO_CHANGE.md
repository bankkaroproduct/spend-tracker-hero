# Files to Change — File-by-File Action List

Companion to [`HANDOFF.md`](./HANDOFF.md).

Legend:
- 🟢 **NEW** — file does not exist in this repo. Copy from yogesh.
- 🟡 **REPLACE** — file exists; overwrite with yogesh's version.
- 🟠 **MERGE** — file exists; manual merge required (data we want to keep + UI changes).
- ✅ **KEEP** — file is correct in this repo. Do not touch.
- ⬜ **REVIEW** — file diverges; verify yogesh's version isn't missing armaan-specific behavior before swapping.

Source paths are relative to the yogesh repo root:
`Spend Analyser yogesh/spend-analyser-main/`

Destination paths are relative to this repo root:
`Spend Analyser Armaan/`

---

## src/ Top Level

| Status | File | LOC (armaan → yogesh) | Notes |
|---|---|---|---|
| 🟡 | `src/App.tsx` | 48 → 53 | Adds `/portfolio/create` and `/portfolio/results` routes |
| 🟡 | `src/pages/Index.tsx` | 424 → 425 | Adds `portfolio-create` and `portfolio-results` to the screen state machine; imports both new portfolio screens |
| ✅ | `src/main.tsx` | — | Identical |
| ✅ | `src/App.css` | — | Identical |
| ✅ | `src/index.css` | — | Identical |
| ✅ | `src/vite-env.d.ts` | — | Identical |

---

## src/components/

| Status | File | LOC (armaan → yogesh) | Notes |
|---|---|---|---|
| 🟡 | `src/components/shared/NavBar.tsx` | 20 → 4 | Replaced with stub: `export const NavBar = () => null;` |
| 🟡 | `src/components/sheets/BottomSheets.tsx` | 654 → 371 | `GmailNudgeBanner`, `GmailNudgePopup`, `GmailNudgeSheet`, `VoiceFlowOverlay` all stubbed to `() => null`. Other sheets unchanged. |
| ✅ | `src/components/ui/*` | — | shadcn/ui — identical in both repos |

---

## src/data/

| Status | File | LOC (armaan → yogesh) | Notes |
|---|---|---|---|
| ✅ | `src/data/actions.ts` | — | Identical (2,628 B) |
| ✅ | `src/data/actionsConsider.ts` | — | Identical (13,826 B) |
| ✅ | `src/data/bestCards.ts` | — | Identical (3,208 B) |
| 🟡 | `src/data/calculator.ts` | 6 → 187 | Take yogesh wholesale. Real 2024-25 rates, new 7-category schema. **Schema-breaking** — see HANDOFF.md "Schema Migration Cheatsheet". |
| 🟠 | `src/data/cardDetail.ts` | 69 → 13 | Take yogesh's `CD_BRANDS`, `CD_CATS`, `BANK_FEES`, `LATE_FEES`, `CD`. **Re-add armaan's per-card extras**: `BANK_FEES_HSBC_TRAVEL`, `BANK_FEES_AXIS_FK`, `BANK_FEES_HSBC_LIVE`, `LATE_FEES_HSBC_TRAVEL`, `LATE_FEES_AXIS_FK`, `LATE_FEES_HSBC_LIVE`. |
| 🟡 | `src/data/cards.ts` | 8 → 8 | Two `headerAccent` hex tweaks: HSBC Travel One `#1a5276` → `#2C2C2C`; HSBC Live+ `#006d5b` → `#A41C2D`. |
| ✅ | `src/data/optimize.ts` | — | Identical |
| ✅ | `src/data/spend.ts` | — | Identical |
| ✅ | `src/data/transactions.ts` | — | Identical |
| ✅ | `src/data/simulation/` | — | **Armaan-only.** Yogesh removed it. Keep entirely if you want armaan's calc backbone available. Delete if going pure yogesh and `rg "data/simulation" src/` is empty. |

---

## src/features/portfolio/ — NEW FOLDER

| Status | File | LOC | Notes |
|---|---|---|---|
| 🟢 | `src/features/portfolio/PortfolioCreateScreen.tsx` | ~17 KB | Card selection step. Filters owned cards. Bank chips + search + 3 slots. |
| 🟢 | `src/features/portfolio/PortfolioResultsScreen.tsx` | ~60 KB | Results step. 4 tabs, 6-card hero carousel, spends-distribution, sliding-spotlight Cards Usage section. Numbers tally to ₹16L spend / ₹1.33L save. |

Both files are referenced from:
- `src/App.tsx` (route mounts)
- `src/pages/Index.tsx` (state-machine screen mounts)
- `src/features/bestcards/BestCardsScreen.tsx` (entry point — floating widget)

---

## src/features/bestcards/

| Status | File | LOC | Notes |
|---|---|---|---|
| 🟡 | `src/features/bestcards/BestCardsScreen.tsx` | 430 → 630 | Adds floating "Card Portfolio · CAN ADD X MORE" widget at `bottom: 24`. Adds toggle logic for "Create Portfolio +" vs "Add Portfolio" CTA. `paddingBottom` reduced 100 → 24. |
| 🟢 | `src/features/bestcards/CardDetailV2.tsx` | 836 LOC | Refined card-detail screen using `SECTION_TITLE` and `TINY_LABEL` typography tokens, gradient brand bars. Used by portfolio results CTAs. |

---

## src/features/calc/

| Status | File | LOC | Notes |
|---|---|---|---|
| 🟡 | `src/features/calc/CalcScreen.tsx` | 517 → 819 | Major refactor. `dc()` updated to pick best-brand-rate within category. Added Best-Place-to-Shop panel + popup. Removed alternate-brand list in category mode. Removed limits/milestones for market cards. Removed Yearly-Monthly toggle and Savings Breakdown. Depends on yogesh's `calculator.ts` schema. |

---

## src/features/cardDetail/

| Status | File | LOC | Notes |
|---|---|---|---|
| 🟡 | `src/features/cardDetail/CardDetailScreen.tsx` | 734 → 593 | Streamlined; new file is shorter. Verify nothing armaan-specific is dropped. |
| 🟡 | `src/features/cardDetail/CardAnalysisFigma.tsx` | 490 → 412 | Cleanup. |

---

## src/features/legacy/

| Status | File | LOC | Notes |
|---|---|---|---|
| 🟡 | `src/features/legacy/LegacyHomeScreen.tsx` | 97 → 132 | Composition tweaks. |
| ⬜ | `src/features/legacy/LegacyOptimiseScreen.tsx` | 981 → 735 | Yogesh is **smaller**. Diff and confirm armaan-specific logic isn't lost before swapping. If unsure, keep armaan's. |
| 🟡 | `src/features/legacy/LegacyShared.tsx` | 816 → 1041 | Many shared components added/refined. Includes the "disabled-look" fix (amount `#6B82A8` → `#1C2A33`, label `#A8AEBE` → `#5B6478`, fontWeight `500` → `600`). |

---

## src/features/onboard/

| Status | File | LOC | Notes |
|---|---|---|---|
| 🟡 | `src/features/onboard/CardIdentificationScreen.tsx` | 386 → 385 | Trivial. |
| ✅ | `src/features/onboard/SpendAnalysisScreen.tsx` | 269 → 269 | Same line count — diff likely whitespace. Confirm before skipping. |
| 🟡 | `src/features/onboard/TxnEvalScreen.tsx` | 445 → 419 | Minor copy/spacing changes. |
| ✅ | `src/features/onboard/ToolsIntroScreen.tsx` | 367 → 367 | Same line count — likely trivial. Confirm. |
| 🟡 | `src/features/onboard/GmailExtraInfoScreen.tsx` | 581 → 464 | Smaller; verify before swap. |

---

## src/features/actions/

| Status | File | LOC | Notes |
|---|---|---|---|
| 🟡 | `src/features/actions/ActionsScreen.tsx` | 182 → 191 | Small tweaks. |
| 🟡 | `src/features/actions/ActionsConsiderScreen.tsx` | 667 → 674 | Small tweaks. |

---

## src/features/* — small files

| Status | File | LOC | Notes |
|---|---|---|---|
| 🟡 | `src/features/building/BuildingScreen.tsx` | 350 → 354 | Trivial. |
| 🟡 | `src/features/profile/ProfileScreen.tsx` | 79 → 79 | Same line count; trivial. |
| 🟡 | `src/features/redeem/RedeemScreen.tsx` | 377 → 399 | Small tweaks. |
| ✅ | `src/features/new/*` | — | Re-exports of legacy screens. Identical. |

---

## Outside src/

| Status | Path | Notes |
|---|---|---|
| ✅ | `package.json` | Identical. No new deps needed. |
| ✅ | `tailwind.config.ts` | Identical. |
| ✅ | `vite.config.ts` | Identical. |
| ✅ | `tsconfig*.json` | Identical. |
| ✅ | `playwright.config.ts` | Identical. |
| ✅ | `vitest.config.ts` | Identical. |
| ✅ | `tests/`, `src/test/` | Identical. |
| ✅ | `public/` | Identical. |
| 🟢 | `HANDOFF.md`, `FILES_TO_CHANGE.md` | This pair. New docs for the rewire. |

---

## Quick Stats

- **NEW files (🟢):** 3 (`PortfolioCreateScreen.tsx`, `PortfolioResultsScreen.tsx`, `CardDetailV2.tsx`)
- **REPLACE files (🟡):** ~20
- **MERGE files (🟠):** 1 (`cardDetail.ts`)
- **REVIEW files (⬜):** 1 (`LegacyOptimiseScreen.tsx`)
- **KEEP files (✅):** all of `data/` (except calculator/cardDetail/cards), all configs, all `lib/`/`hooks/`/`store/`, all tests, all `public/`

Total surface area: ~25 files touched out of ~100 in `src/`.
