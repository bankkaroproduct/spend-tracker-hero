# Index.tsx Slicing Plan

Tracks the incremental extraction of `Index.tsx` into focused custom hooks.
Each slice must pass `bun run test` (13/13) and `bun run build` before merging.

---

## Done


### Slice 3 - `useBuildingFlow` (`src/pages/useBuildingFlow.ts`) - done
State: `buildPhase`, `buildSub`, `buildCardReveal`, `carouselIdx`, `touchStartX`, `buildRef`, `savePhase`, `toolStep`, `reminderStep`, `finalLoad`, mapping pause/search state
Effects: save-phase timed handoff, building auto-advance, phase-9 substeps, scroll reset, card reveal stagger
Deps: `screen`, `setScreen`


### Slice 4 - `useNudgeAndVoiceFlow` (`src/pages/useNudgeAndVoiceFlow.ts`) - done
State: Gmail nudge visibility/dismissal state, voice-flow state, `recognitionRef`, Gmail sheet/relinking flags
Functions: `shouldShowNudge`, `markNudgeShown`, `dismissNudge`, `retroEnrichFromGmail`, `beginListening`, `confirmVoiceMatch`
Deps: `hasGmail`, `screen`, `setCardMapping`, `setMappingCompleted`, `startGmailFlow`

### Slice 5 - `useTransactionUiState` (`src/pages/useTransactionUiState.ts`) - done
State: sort/filter state, transaction/category/filter sheets, removed transactions, category overrides
Derived: `activeTxnList`, `filtered`
Functions: `toggleFilter`, `multiToggle`, `goTxns`, `setTxnCatOverride`
Deps: `setScreen`


### Slice 6 - `useBestCardsUiState` (`src/pages/useBestCardsUiState.ts`) - done
State: best-card detail/list filters, portfolio draft state, marketplace view/sort/favorites/eligibility UI state
Effects: none
Deps: none


### Slice 7 - `useCardDetailUiState` (`src/pages/useCardDetailUiState.ts`) - done
State: owned-card selected index, detail tabs, paging, spend/usage controls, sticky tab refs/state
Effects: owned-card detail sticky-tab scroll listener
Deps: `screen`, `setScreen`

### Slice 8 - `useCalculatorRedeemUiState` (`src/pages/useCalculatorRedeemUiState.ts`) - done
State: calculator selections/results/search/filter/chart state and redeem selections/results/tab state
Effects: none
Deps: none

### Slice 9 - `useOverlayUiState` (`src/pages/useOverlayUiState.ts`) - done
State: generic sheets, toast, skip confirmation
Effects: toast auto-dismiss timer
Deps: none

### Slice 10 - `useOptimizeActionsUiState` (`src/pages/useOptimizeActionsUiState.ts`) - done
State: actions filter and optimize tab/sheet/expansion UI state
Effects: none
Deps: none


### Slice 11 - `useScreenScrollReset` (`src/pages/useScreenScrollReset.ts`) - done
State/refs: previous screen ref and scroll reset timer ref
Effects: reset `[data-scroll]` containers on screen change
Deps: `screen`


### Slice 12 - `buildIndexContext` (`src/pages/buildIndexContext.ts`) - done
Responsibility: explicit legacy AppContext key map from extracted hook groups
Effects: none
Deps: hook result groups plus `screen` and `setScreen`

### Slice 13 - Index dead-code cleanup - done
Removed: unused haptics setup, debug-only `setScreen` locals, and old placeholder components/constants
Effects: none
Deps: none


### Slice 14 - `buildIndexContext.test` (`src/pages/buildIndexContext.test.ts`) - done
Coverage: exact legacy context key contract plus representative owner-group mappings
Verification: `bun run test` now covers 15 tests across 5 files
Deps: `buildIndexContext`


### Slice 15 - `routeState.test` (`src/routes/routeState.test.ts`) - done
Coverage: slug normalization, core route parsing, owned vs market card route separation, screen-to-path output, unknown path fallback
Verification: `bun run test` now covers 20 tests across 6 files
Deps: `src/routes/routeState.ts`

### ✅ Slice 1 — `useGmailFlow` (`src/pages/useGmailFlow.ts`)
State: `gmailStep`, `gmailReturnTo`, `gmailOtp`, `gmailFirstName`, `gmailLastName`, `gmailDob`, `hsbcDigits1`, `hsbcDigits2`
Functions: `completeGmailLink`, `startGmailFlow`
Deps: `setScreen`, `setHasGmail`, `setUserFlag`, `setMappingCompleted`, `setCardMapping`, `setBuildPhase`

### ✅ Slice 2 — `useOnboardingFlow` (`src/pages/useOnboardingFlow.ts`)
State: `onStep`, `vpSlide`, `phone`, `otp`, `otpTimer`, `smsStatus`, `welcomeTyped`, `otpRefs` (ref)
Effects: OTP countdown · welcome typing animation · SMS→analysis nav · value-prop carousel rotate
Deps: `screen`, `setScreen`

---

## Remaining

### 3 - `useBuildingFlow` - completed (details kept for reference)

**File**: `src/pages/useBuildingFlow.ts`

**State**
| Name | Line | Notes |
|------|------|-------|
| `buildPhase` / `setBuildPhase` | 98 | exposed — consumed by `useGmailFlow` |
| `buildSub` / `setBuildSub` | 99 | internal sequencer |
| `buildCardReveal` / `setBuildCardReveal` | 102 | card stagger animation |
| `carouselIdx` / `setCarouselIdx` | 103 | carousel position |
| `touchStartX` (ref) | 104 | swipe detection ref |
| `buildRef` (ref) | 123 | scroll container ref |
| `savePhase` / `setSavePhase` | 127 | triggers tools-intro → home sequence |
| `toolStep` / `setToolStep` | 124 | savePhase sub-step |
| `reminderStep` / `setReminderStep` | 125 | savePhase sub-step |
| `finalLoad` / `setFinalLoad` | 126 | savePhase sub-step |
| `showCardMappingUI` / `setShowCardMappingUI` | 106 | pauses building phase timer |
| `mappingStep` / `setMappingStep` | 107 | manual mapping wizard step |
| `mappingSearchQ` / `setMappingSearchQ` | 108 | search field in mapping UI |
| `showResolutionSummary` / `setShowResolutionSummary` | 109 | pauses building phase timer |

**Effects**
| Effect | Line |
|--------|------|
| `savePhase` timed sequence (10 timeouts → `setScreen("home")`) | 186 |
| Building phase auto-advance (timeout map `{0:3000, 1:4000, …}`) | 224–228 |
| `buildPhase===9` sub-step sequencer | 229 |
| `buildPhase>=14` → navigate home | 230 |
| Scroll `buildRef` to top on phase change | 231 |
| Scroll `buildRef` to top on `buildSub` change | 232 |
| `buildPhase===1` card-reveal stagger (4 timeouts) | 233 |

**Deps**: `screen: string`, `setScreen: (s: string) => void`

**Note**: `setBuildPhase` must be in the return object so `useGmailFlow` can receive it as a dep.

---

### 4 - `useNudgeAndVoiceFlow` - completed (details kept for reference)

**File**: `src/pages/useNudgeAndVoiceFlow.ts`

**State**
| Name | Line |
|------|------|
| `showGmailNudge` / `setShowGmailNudge` | 114 |
| `showGmailNudgeSheet` / `setShowGmailNudgeSheet` | 115 |
| `nudgeDismissals` / `setNudgeDismissals` | 112 |
| `nudgePermanentlyDismissed` / `setNudgePermanentlyDismissed` | 113 |
| `nudgeShownThisSession` / `setNudgeShownThisSession` | 116 |
| `showVoiceFlow` / `setShowVoiceFlow` | 117 |
| `voiceCardIndex` / `setVoiceCardIndex` | 118 |
| `isListening` / `setIsListening` | 119 |
| `voiceTranscript` / `setVoiceTranscript` | 120 |
| `voiceMatch` / `setVoiceMatch` | 121 |
| `recognitionRef` (ref) | 122 |
| `relinkingGmail` / `setRelinkingGmail` | 111 |
| `gmailSheet` / `setGmailSheet` | 105 |

**Functions**
| Name | Lines |
|------|-------|
| `shouldShowNudge(screenKey)` | 134–140 |
| `markNudgeShown(k)` | 141 |
| `dismissNudge()` | 142–146 |
| `retroEnrichFromGmail()` | 147–151 |
| `beginListening()` | 152–175 |
| `confirmVoiceMatch()` | 176–183 |

**Deps**: `hasGmail: boolean`, `screen: string`, `setCardMapping`, `setMappingCompleted`, `startGmailFlow`

---

### 5 - `useTransactionUiState` - completed (details kept for reference)

**State**
| Name | Line |
|------|------|
| `sortBy` / `setSortBy` | 58 |
| `filters` / `setFilters` | 59 |
| `removedTxns` / `setRemovedTxns` | 68 |
| `txnCatOverrides` + `setTxnCatOverride` (derived setter) | 100–101 |
| `txnSheet` / `setTxnSheet` | 95 |
| `catSheet` / `setCatSheet` | 62 |
| `filterSheet` / `setFilterSheet` | 64 |
| `filterTab` / `setFilterTab` | 65 |
| `catStep` / `setCatStep` | 66 |
| `selCat` / `setSelCat` | 67 |

**Derived / computed**
- `activeTxnList` = `ALL_TXNS.filter((_,i)=>!removedTxns.has(i))` (line 199)
- `sorted` = `doSort(activeTxnList, sortBy)` (line 199)
- `filtered` = `doFilter(sorted, filters)` (line 199)

**Functions**
- `toggleFilter(fl)` — single-select toggle (line 195)
- `multiToggle(fl)` — multi-select toggle (line 196)
- `goTxns(pf)` — set filter + navigate to transactions (line 198)

**Deps**: `setScreen`

**Imports needed**: `ALL_TXNS` from simulation/legacy, `doSort`/`doFilter` from SortFilter

---

### 6 - `useBestCardsUiState` - completed (details kept for reference)

### 6 - `useBestCardsUiState` - completed (details kept for reference)

**State** (all lines 36–50)
`bestCardDetail`, `portfolioNew`, `portfolioEntryCard`, `bcFilter`, `bcSearch`, `bcSearchOpen`, `bcDetTab`, `bcViewMode`, `bcSection`, `bcFavs`, `bcSort`, `bcListView`, `bcShowSort`, `bcEligSheet`, `bcFromScreen`

No effects, no external deps — pure UI state bucket.

---

### 7 — `useCardDetailUiState`

**File**: `src/pages/useCardDetailUiState.ts`

**State**
| Name | Line |
|------|------|
| `ci` / `setCi` | 55 |
| `detailTab` / `setDetailTab` | 74 |
| `txnPage` / `setTxnPage` | 97 |
| `usageCat` / `setUsageCat` | 76 |
| `usageMode` / `setUsageMode` | 75 |
| `timePeriod` / `setTimePeriod` | 77 |
| `timePeriodOpen` / `setTimePeriodOpen` | 78 |
| `spendTab` / `setSpendTab` | 56 |
| `showAllBrands` / `setShowAllBrands` | 57 |
| `tabSticky` / `setTabSticky` | 80 |
| `txnExp` / `setTxnExp` | 79 |
| `dRef` (ref) | 81 |
| `dRefs` (ref) | 81 |
| `sentRef` (ref) | 81 |

**Effects**
| Effect | Line |
|--------|------|
| Tab sticky — attach/detach scroll listener on `dRef` | 190 |

**Functions**: `openCard(i)` — setCi + setScreen("detail") + reset detailTab/txnPage (line 197)

**Deps**: `screen: string`, `setScreen`

---

### 8 — `useCalculatorRedeemState`

**File**: `src/pages/useCalculatorRedeemState.ts`

**State**
| Name | Line |
|------|------|
| `selBrand` / `setSelBrand` | 82 |
| `calcAmt` / `setCalcAmt` | 83 |
| `calcPopup` / `setCalcPopup` | 83 |
| `calcResult` / `setCalcResult` | 84 |
| `searchQ` / `setSearchQ` | 84 |
| `calcTab` / `setCalcTab` | 85 |
| `chartPage` / `setChartPage` | 86 |
| `calcFilter` / `setCalcFilter` | 87 |
| `howExpanded` / `setHowExpanded` | 88 |
| `redeemCard` / `setRedeemCard` | 89 |
| `redeemPts` / `setRedeemPts` | 90 |
| `redeemPref` / `setRedeemPref` | 91 |
| `redeemResult` / `setRedeemResult` | 92 |
| `redeemTab` / `setRedeemTab` | 93 |

No effects, no external deps — pure UI state bucket.

---

### 9 — `buildIndexContext` (refactor, not a hook)

**Scope**: Restructure the 200-key `ctxValue` blob (line 235) into named groups so it's readable and type-checkable.

**Approach**
1. Define a `IndexContext` TypeScript interface at the top (or in a `src/pages/contextTypes.ts` file).
2. Split `ctxValue` assembly into logical sections with comments matching the hook names above.
3. Optionally use `useMemo` on the context value to avoid unnecessary provider re-renders (low priority).

**Does not change any exported keys** — all consumer screens still read the same names from `useAppContext()`.

---

## Remaining state not yet assigned to a hook

These small items sit in Index.tsx outside the slices above. Fold them into the nearest logical slice or leave in Index.tsx if no good home:

| State | Line | Probable home |
|-------|------|---------------|
| `toast` / `setToast` + auto-clear effect | 63, 185 | Global UI — leave in Index or add `useToastState` |
| `infoSheet` / `setInfoSheet` | 94 | Could go in `useTransactionUiState` or leave |
| `actSheet` / `setActSheet` | 96 | Leave in Index (used by actions screen) |
| `actFilter` / `setActFilter` | 60 | Leave in Index |
| `capSheet` / `setCapSheet` | 61 | Leave in Index |
| `optTab`/`optSheet`/`optSheetFrom`/`optExpanded` | 70–73 | Could become `useOptimizeUiState` (optional slice 10) |
| `showSkipConfirm` / `setShowSkipConfirm` | 110 | Fold into `useBuildingFlow` or leave |

---

## Verification protocol (each slice)

```bash
bun run test          # must show 13/13 passed
bun run build         # must exit 0 (no TS errors)
```

Also grep that `ctxValue` still contains the same keys before and after each slice (no accidental renames).






