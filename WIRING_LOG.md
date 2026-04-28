# Wiring Plan Execution Log

## Status: COMPLETE — Build passes

## Batch 0: Invite-Only Filtering (Step 0) ✅
- [x] mockApi.ts — added getEligibleMarketCards(), getFirstEligibleMarketCard()
- [x] mockApi.ts — getBestMarketCardForBucket() uses eligible cards only
- [x] compute.ts — computeCombinedSavings() uses getEligibleMarketCards()
- [x] compute.ts — computeSpendDistribution() uses eligible market card name
- [x] legacy.ts — marketTop uses getFirstEligibleMarketCard()

## Batch 1: Rewire Imports (Step 1) — 9 files ✅
- [x] src/pages/Index.tsx — CARDS, SEMI_CARDS, ACTIONS, ALL_TXNS → simulation/legacy
- [x] src/components/sheets/BottomSheets.tsx — SEMI_CARDS, ALL_TXNS, CAT_OPTIONS, BRAND_MAP + SIM_* maps
- [x] src/features/bestcards/BestCardsScreen.tsx — TOTAL_ACC + SIM_BEST_CARDS, getBestCardDetail
- [x] src/features/cardDetail/CardDetailScreen.tsx — CARDS, SEMI_CARDS, CD, CALC_CARDS, ALL_TXNS, br, ic, tg, BEST_FOR_BRAND, computeTxnMissed
- [x] src/features/calc/CalcScreen.tsx — CALC_BRANDS, CALC_CATS, CALC_CARDS, SPEND_BRANDS
- [x] src/features/building/BuildingScreen.tsx — ACTIONS, SPEND_CATS, TOTAL_ACC, SEMI_CARDS, CARDS, ALL_TXNS
- [x] src/features/profile/ProfileScreen.tsx — CARDS
- [x] src/features/legacy/LegacyHomeScreen.tsx — ACTIONS
- [x] src/features/redeem/RedeemScreen.tsx — CARDS, REDEEM_DATA, MARKET_REDEEM_CARDS

## Batch 2: Replace Inline Hardcoded Data (Step 2) — 8 files ✅
- [x] BestCardsScreen.tsx — BEST_CARDS → SIM_BEST_CARDS, bcFilterOpts, combSavings, CARD_DET → getBestCardDetail, filterTags→tags, comparisonBars
- [x] ActionsScreen.tsx — ACTIONS_DATA imported from simulation
- [x] CardDetailScreen.tsx — BEST_FOR_BRAND imported, 0.03→computeTxnMissed
- [x] LegacyShared.tsx — bars→SAVINGS_BARS, hero→SAVINGS_BARS, categoryData→SPEND_CATS, brandData→SPEND_BRANDS, total→TOTAL_ACC, promo→CARD_PROMO
- [x] LegacyOptimiseScreen.tsx — bars→SAVINGS_BARS, card promo→CARD_PROMO, distribution→SPEND_DIST_*, saveExtra→ultimate_uplift
- [x] BottomSheets.tsx — CARD_RATE→fmtRate(SIM_CARD_RATE), CARD_BASE_RATE→fmtBaseRate(SIM_CARD_BASE_RATE), BEST_FOR→SIM_BEST_FOR, MARKET_BEST→SIM_MARKET_BEST, 0.05→computeTxnMissed, 0.1→computeTxnMarketDelta
- [x] RedeemScreen.tsx — REDEEM_DATA imported, MARKET_CARDS→MARKET_REDEEM_CARDS
- [x] BuildingScreen.tsx — semiCards→SEMI_CARDS, fullCards→CARDS.map, bTxns→ALL_TXNS.slice(0,5)

## Batch 3: Build Verification ✅
- [x] `npx vite build` passes (3625 modules, 14.78s)

## Batch 4: Verification Scans ✅
- [x] Old imports: Only in src/features/redundant/ (archived, correct)
- [x] Hardcoded % fallbacks (0.03, 0.05, 0.1, 0.02): Zero hits
- [x] Old CARD_RATE/CARD_BASE_RATE/BEST_FOR/MARKET_BEST: Replaced with SIM_* versions
- [x] Hardcoded savings (combSavings=100000, savings:150000): Zero hits outside redundant/

## Files Modified (17 total)

**Simulation layer (3 edits):**
- src/data/simulation/mockApi.ts
- src/data/simulation/compute.ts
- src/data/simulation/legacy.ts

**Screen files (14 edits):**
- src/pages/Index.tsx
- src/components/sheets/BottomSheets.tsx
- src/features/bestcards/BestCardsScreen.tsx
- src/features/cardDetail/CardDetailScreen.tsx
- src/features/calc/CalcScreen.tsx
- src/features/building/BuildingScreen.tsx
- src/features/profile/ProfileScreen.tsx
- src/features/legacy/LegacyHomeScreen.tsx
- src/features/legacy/LegacyShared.tsx
- src/features/legacy/LegacyOptimiseScreen.tsx
- src/features/redeem/RedeemScreen.tsx
- src/features/actions/ActionsScreen.tsx

**NOT touched (correct):**
- src/features/redundant/* (archived)
- src/features/legacy/LegacyTransactionsScreen.tsx (gets data via AppContext)
