# Spend Analyser — UI Rewiring Handoff

**Generated:** 2026-04-28
**Audience:** Engineer rewiring this repo's UI to match the newer "yogesh" branch
**Scope:** Frontend only. Tooling, deps, configs, build, tests are all unchanged.

---

## TL;DR

This repo (`Spend Analyser Armaan`) is the **data-correct** branch. Its `src/data/` files
(especially `simulation/`, `actions.ts`, `transactions.ts`, `optimize.ts`, `actionsConsider.ts`,
`spend.ts`, `bestCards.ts`) are the source of truth and **must be preserved**.

A parallel branch (`Spend Analyser yogesh / spend-analyser-main`) has a **newer UI** with:

1. A new **Portfolio** flow (Create → Results) — 2 brand-new screens
2. A new **CardDetailV2** screen replacing the legacy `CardDetailScreen`
3. Refactors to `CalcScreen`, `BestCardsScreen`, `LegacyShared`, `LegacyHomeScreen`
4. The bottom **NavBar disabled app-wide** (returns null)
5. **Gmail nudges + voice-flow overlay disabled** (return null) — preserves call sites
6. Real-world 2024-25 reward rates in `calculator.ts` (~70 brands, 7 categories)

Goal: Adopt the yogesh UI in this repo while keeping this repo's data layer.

See [`FILES_TO_CHANGE.md`](./FILES_TO_CHANGE.md) for the full file-by-file action list.

---

## Repo Layout (after merge)

```
src/
├── App.tsx                       (UPDATE — adds 2 portfolio routes)
├── App.css, index.css            (unchanged)
├── main.tsx                      (unchanged)
├── pages/
│   ├── Index.tsx                 (UPDATE — wires portfolio screens into state machine)
│   └── NotFound.tsx              (unchanged)
├── components/
│   ├── shared/NavBar.tsx         (REPLACE — now returns null)
│   └── sheets/BottomSheets.tsx   (REPLACE — Gmail nudges + voice flow return null)
├── features/
│   ├── portfolio/                (NEW FOLDER — 2 files)
│   │   ├── PortfolioCreateScreen.tsx
│   │   └── PortfolioResultsScreen.tsx
│   ├── bestcards/
│   │   ├── BestCardsScreen.tsx   (UPDATE — adds floating widget + portfolio entry)
│   │   └── CardDetailV2.tsx      (NEW — replaces CardDetailScreen)
│   ├── calc/CalcScreen.tsx       (UPDATE — best-place-to-shop, real rates)
│   ├── legacy/                   (UPDATE — LegacyShared, LegacyHome, LegacyOptimise)
│   ├── cardDetail/               (UPDATE — CardDetailScreen + CardAnalysisFigma)
│   ├── onboard/                  (MINOR — content tweaks across 5 screens)
│   ├── actions/                  (MINOR — small label/copy tweaks)
│   ├── building/, profile/, redeem/  (MINOR)
│   └── new/                      (re-exports — no change)
├── data/                         (KEEP — armaan is source of truth, except calculator.ts)
│   ├── actions.ts                ✓ keep
│   ├── actionsConsider.ts        ✓ keep
│   ├── bestCards.ts              ✓ keep
│   ├── calculator.ts             ⚠ REPLACE with yogesh's (real rates) — see schema migration below
│   ├── cardDetail.ts             ⚠ MERGE — keep armaan's per-card BANK_FEES_*/LATE_FEES_* extras, take yogesh's CD_BRANDS/CD_CATS/CD
│   ├── cards.ts                  ⚠ tiny color tweak (2 hex values)
│   ├── optimize.ts               ✓ keep
│   ├── spend.ts                  ✓ keep
│   ├── transactions.ts           ✓ keep
│   └── simulation/               ✓ KEEP ENTIRELY (yogesh removed it; armaan UI used it; new UI doesn't reference it but it's still useful as a calc backbone — see "Simulation folder" note below)
├── store/AppContext.ts           (unchanged)
├── hooks/                        (unchanged)
├── lib/                          (unchanged)
└── test/                         (unchanged)
```

---

## What Yogesh Changed and Why

### 1. New: Portfolio Flow — `src/features/portfolio/`

Two new screens that compose a "Create Card Portfolio" experience:

- **`PortfolioCreateScreen.tsx`** — Step 1. User picks up to 3 cards from `CARD_CATALOGUE` filtered by bank chips + search. Owned cards (from `useAppContext().cards`) are excluded so users can't re-select what they already have. Sticky footer CTA "See portfolio results →".
- **`PortfolioResultsScreen.tsx`** — Step 2. 4 tabs (How to use / Benefits / Fee / Eligibility & T&C), hero carousel with all 6 cards (3 owned + 3 new), spends-distribution chart, "How to spend" timeline, and a Cards-Usage section with a sliding spotlight band. Numbers are tallied to ₹16,00,000 spend / ₹1,33,000 save across 6 cards.

Routes added:
- `/portfolio/create` → screen `portfolio-create`
- `/portfolio/results` → screen `portfolio-results`

Entry point: `BestCardsScreen.tsx` floating "Card Portfolio · CAN ADD X MORE" widget at bottom.

### 2. New: `src/features/bestcards/CardDetailV2.tsx`

Refined card-detail page with sectioned layout, brand-rate gradient bars, and shared
typography tokens (`SECTION_TITLE`, `TINY_LABEL`). The legacy `CardDetailScreen.tsx`
remains in place for back-compat but new portfolio flow links go to V2.

### 3. NavBar disabled app-wide

```tsx
// src/components/shared/NavBar.tsx (yogesh)
// @ts-nocheck
// Bottom navbar (Home / Cards / Profile) disabled app-wide per design direction.
export const NavBar = () => null;
```

All call sites preserved — they just render nothing.

### 4. Gmail nudges + voice flow disabled

In `src/components/sheets/BottomSheets.tsx`, the following exports are stubbed to
`() => null`:
- `GmailNudgeBanner`
- `GmailNudgePopup`
- `GmailNudgeSheet`
- `VoiceFlowOverlay`

All other bottom-sheet components (e.g. `TxnDetailSheet`, `BestUseSheet`) are
unchanged. The file shrinks 654 → 371 LOC.

### 5. Real-world rates in `calculator.ts`

Yogesh's `calculator.ts` is **3.7 KB larger** than armaan's. It moves from synthetic
rates to real 2024-25 brand-level rates and aligns category labels with what the new
`CalcScreen.tsx` UI expects.

**Schema-breaking changes** (must update both file and any dependents):

| Symbol | Armaan | Yogesh | Action |
| --- | --- | --- | --- |
| `CAT_OPTIONS` | `["Shopping","Groceries","Bills","Travel","Insurance","Fuel","Dining","Entertainment"]` | `["Online Shopping","Groceries","Bills","Fuel","Ordering Food","Flights","Hotels"]` | Take yogesh's. Update any consumer that hardcodes the old strings. |
| `CALC_CATS` keys | "Shopping", "Food Delivery", "Bills & Recharges", "Cab Rides", "Dining Out", "Rent", "Fashion" | new 7-key set matching `CAT_OPTIONS` | Take yogesh's. |
| `BRAND_MAP` | category-name keyed | category-name keyed (different keys) | Take yogesh's. |
| `CALC_CARDS[].rates` | flat per-brand object | richer per-brand keys + `default` | Take yogesh's; UI expects detailed brand-level lookups. |

`CalcScreen.tsx` now selects the **best-brand-rate within a category** — picking the
single highest-rate brand inside the chosen category — and displays a "Best Place to
Shop" panel + popup. The category mode no longer shows alternate brands. Limits and
milestones are removed for market cards.

### 6. `cardDetail.ts` schema overlap

Both have `CD_BRANDS`, `CD_CATS`, `BANK_FEES`, `LATE_FEES`, `CD`.

Armaan **also** has per-card variants:
- `BANK_FEES_HSBC_TRAVEL`, `BANK_FEES_AXIS_FK`, `BANK_FEES_HSBC_LIVE`
- `LATE_FEES_HSBC_TRAVEL`, `LATE_FEES_AXIS_FK`, `LATE_FEES_HSBC_LIVE`

These per-card arrays are richer (include real T&C URLs and per-card rules from
Great Cards screenshots).

**Recommended merge:** Take yogesh's file as the base, then re-add armaan's per-card
`BANK_FEES_*` / `LATE_FEES_*` constants. The yogesh UI doesn't import them today but
removing them loses real data. Keep them.

### 7. `cards.ts` — 2 hex tweaks

```diff
- {name:"HSBC Travel One",last4:"7891",color:"#0c2340",accent:"#1a5276",headerAccent:"#1a5276",...}
+ {name:"HSBC Travel One",last4:"7891",color:"#0c2340",accent:"#1a5276",headerAccent:"#2C2C2C",...}

- {name:"HSBC Live+",last4:"3364",color:"#006d5b",accent:"#00a086",headerAccent:"#006d5b",...}
+ {name:"HSBC Live+",last4:"3364",color:"#006d5b",accent:"#00a086",headerAccent:"#A41C2D",...}
```

Just the `headerAccent`. Take yogesh's hex values.

### 8. `LegacyShared.tsx` — disabled-look fix

The "Total Accounted Spends" amount and label on `LegacyHomeScreen` looked faded.
Yogesh changed:
- amount color `#6B82A8` → `#1C2A33`
- label color `#A8AEBE` → `#5B6478`, `fontWeight 500` → `600`

Plus other shared-component refinements; file grows 816 → 1041 LOC.

### 9. Other minor diffs

| File | Change | Take from |
| --- | --- | --- |
| `App.tsx` | + 2 portfolio routes | yogesh |
| `pages/Index.tsx` | adds `portfolio-create` and `portfolio-results` to state machine | yogesh |
| `features/calc/CalcScreen.tsx` | best-place-to-shop logic, removed limits/milestones, removed Yearly-Monthly toggle | yogesh |
| `features/bestcards/BestCardsScreen.tsx` | floating widget, sticky portfolio CTA | yogesh |
| `features/cardDetail/CardDetailScreen.tsx` | minor cleanups (734 → 593 LOC) | yogesh |
| `features/cardDetail/CardAnalysisFigma.tsx` | minor (490 → 412) | yogesh |
| `features/legacy/LegacyOptimiseScreen.tsx` | refactor; armaan is 981, yogesh 735 — confirm yogesh isn't missing features before swapping | review then take yogesh |
| `features/onboard/*` | mostly copy/spacing nits | yogesh |
| `features/actions/*` | small label tweaks | yogesh |
| `features/redeem/RedeemScreen.tsx` | small | yogesh |
| `features/building/BuildingScreen.tsx` | small | yogesh |
| `features/profile/ProfileScreen.tsx` | small | yogesh |

---

## Simulation folder

`src/data/simulation/` (5 files: `compute.ts`, `inputs.ts`, `legacy.ts`, `mockApi.ts`,
`recommendData.ts`) **only exists in armaan**. The yogesh UI doesn't import it.

Why keep it: it's the calculation backbone behind armaan's existing screens. If you
plan to keep any armaan-specific logic, leave the folder in place. If you go pure
yogesh, you can delete it — but be sure no armaan code paths still reference it.

A clean ripgrep:

```bash
rg "data/simulation" src/        # check usage before deleting
```

If you adopt yogesh wholesale, this should return zero hits.

---

## Recommended Merge Procedure

```bash
# from the parent of both folders
SRC="Spend Analyser yogesh/spend-analyser-main/src"
DST="Spend Analyser Armaan/src"

# 1. snapshot armaan src
cp -R "$DST" "$DST.before"

# 2. preserve armaan's authoritative data (everything except calculator/cardDetail/cards)
mkdir -p /tmp/armaan-data-keep
for f in actions actionsConsider bestCards optimize spend transactions; do
  cp "$DST/data/$f.ts" "/tmp/armaan-data-keep/$f.ts"
done
cp -R "$DST/data/simulation" /tmp/armaan-data-keep/simulation

# 3. wholesale UI swap
rm -rf "$DST"
cp -R "$SRC" "$DST"

# 4. restore armaan's data files
for f in actions actionsConsider bestCards optimize spend transactions; do
  cp "/tmp/armaan-data-keep/$f.ts" "$DST/data/$f.ts"
done
cp -R "/tmp/armaan-data-keep/simulation" "$DST/data/simulation"

# 5. merge cardDetail.ts manually — keep armaan's BANK_FEES_*/LATE_FEES_* per-card extras
# (open both files in your editor; the only adds are 6 named constants)

# 6. install + run
bun install
bun run dev
```

After step 6, smoke-test the routes documented in [Test Plan](#test-plan).

---

## Schema Migration Cheatsheet

If you go a different route and **don't** swap calculator.ts wholesale, here's the
minimum change set so yogesh's `CalcScreen` works against an armaan calculator:

```diff
// src/data/calculator.ts
- export const CAT_OPTIONS=["Shopping","Groceries","Bills","Travel","Insurance","Fuel","Dining","Entertainment"];
+ export const CAT_OPTIONS=["Online Shopping","Groceries","Bills","Fuel","Ordering Food","Flights","Hotels"];
```

…plus aligned `CALC_CATS` keys and `BRAND_MAP` keys. Easier to just adopt yogesh's
file in full.

---

## Test Plan

After merging, walk through these flows:

| Flow | Route | Expected |
| --- | --- | --- |
| Home | `/home` | "₹15,40,250 / TOTAL ACCOUNTED SPENDS" renders in dark text (not faded) |
| Best cards | `/cards` | Floating "Card Portfolio · CAN ADD X MORE" widget visible at bottom |
| Card detail (V2) | `/cards/:id` (V2) | Sectioned layout, gradient bars, no NavBar at bottom |
| Calculator | `/calc` | 7-category list (Online Shopping … Hotels), "Best Place to Shop" panel + popup |
| Portfolio create | `/portfolio/create` | Bank chips + search + 3 slots, owned cards excluded from list, dedupe by `fullName` |
| Portfolio results | `/portfolio/results` | 4 tabs, hero carousel shows 6 cards (3 owned + 3 new), 6 dots in carousel pagination, spends-distribution chart tallies ₹16,00,000 |
| Bottom navbar | any | Should NOT render anywhere |
| Gmail nudge | onboarding | Should NOT pop up; voice-flow overlay should NOT mount |

---

## Things to Watch Out For

1. **TDZ in CalcScreen** — yogesh's CalcScreen used to throw a `ReferenceError` for
   `brandImgMap` until the declaration was moved above the `if (calcResult)` block.
   This is fixed in yogesh; don't reorder back.
2. **Duplicate keys in PortfolioCreateScreen** — `CARD_CATALOGUE` has duplicate
   `fullName`s (e.g. two "Axis Magnus" rows). The screen dedupes via
   `seen.has(c.fullName) ? false : (seen.add(c.fullName), true)`. Keep the dedupe.
3. **Floating widget positioning** — uses `position: sticky` with `bottom: 24` and
   `marginTop: -55.24` to overlap the last list item. A parent `transform` was
   breaking this earlier. Don't wrap it in a transformed container.
4. **Whitespace in the widget label** — `"CAN ADD 2 MORE"` will wrap to 2 lines if
   `letter-spacing` is too wide. Keep at `0.12em` with `whiteSpace: "nowrap"`.
5. **`@ts-nocheck`** is used at the top of most files. Don't remove it; the project
   relies on inline-styles + loose typing throughout.

---

## Tech Stack (unchanged after merge)

- React 18, TypeScript, Vite 5
- React Router v6
- React Context (`useAppContext`)
- Tailwind CSS (config unchanged)
- shadcn/ui components in `src/components/ui/`
- Inline styles for feature screens (no CSS modules)
- Mobile-first 400px maxWidth wrappers
- Google Sans + Blacklist serif fonts
- Playwright + Vitest test setup (unchanged)

---

## Contact / Provenance

Originally built in `Spend Analyser yogesh/spend-analyser-main` during a multi-day
design iteration. This handoff was generated by comparing both repos head-to-head.
For the source of any specific UI snippet, check yogesh's file at the matching path.
