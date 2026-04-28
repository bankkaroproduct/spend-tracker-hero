# Canonical Metrics Rewire

## Goal

Make all displayed business numbers in the app come from one canonical computation layer and one canonical set of selectors, so totals reconcile across Home, Transactions, Optimize, Owned Card Detail, Best Cards, Portfolio, Calculator, Actions, and Redeem.

## What Changed

### 1. Canonical Metrics Layer

Added `src/data/simulation/metrics.ts`.

This file now centralizes:

- App summary totals
- Home metrics
- Transaction row/detail metrics
- Optimize bars, spend distribution, brand/category breakdowns
- Owned card detail metrics
- Best Cards list and detail metrics
- Portfolio metrics
- Calculator reward outputs
- Actions amounts
- Redeem values
- Monthly/yearly conversion helpers
- Deterministic reconciliation helpers
- Dev-only reconciliation warnings

Key selectors added include:

- `selectSummaryMetrics`
- `selectHomeMetrics`
- `selectTransactionMetrics`
- `selectOptimizeMetrics`
- `selectOwnedCardDetailMetrics`
- `selectBestCardsListMetrics`
- `selectBestCardDetailMetrics`
- `selectBestCardBreakdownMetrics`
- `selectPortfolioMetrics`
- `selectCalculatorMetrics`
- `calculateRewardsForInput`
- `selectActionsMetrics`
- `selectRedeemMetrics`

### 2. Legacy Adapter Rewired

Updated `src/data/simulation/legacy.ts` so existing screen imports now resolve to canonical selector outputs.

Canonicalized exports include:

- `CARDS`
- `ALL_TXNS`
- `SPEND_CATS`
- `SPEND_BRANDS`
- `TOTAL_ACC`
- `CD`
- `CALC_CARDS`
- `SAVINGS_BARS`
- `COMBINED_SAVINGS`
- `SPEND_DIST_WITH_ULTIMATE`
- `SPEND_DIST_WITHOUT_ULTIMATE`
- `BEST_CARDS`
- `BEST_CARDS_COMB_SAVINGS`
- `REDEEM_DATA`
- `MARKET_REDEEM_CARDS`
- `ACTIONS_DATA`
- `CARD_PROMO`

### 3. Pages Rewired

Rewired active business-number displays across:

- Home dashboard
- Transactions list
- Transaction bottom sheet
- Optimize screen
- Owned card detail tabs
- Best Cards list
- Best Card detail screen
- Portfolio create/results
- Calculator
- Actions bottom sheet
- Redeem screen

The UI structure and visuals were kept intact. Changes were limited to data wiring, computed values, and removal of local business math.

### 4. Removed Local Business Math

Removed or replaced UI-local calculations such as:

- Hardcoded annual savings/spend totals
- Invented split math like `base * 0.3`
- Fallback reward percentages such as `0.03`, `0.05`, `0.1`
- Hardcoded redemption multipliers
- Hardcoded fee waiver and cap progress amounts
- Hardcoded marketplace recommendation numbers
- Calculator-local duplicate reward tables

Where data is unavailable, the UI now uses explicit unavailable or zero values instead of inventing values.

### 5. Reconciliation Rules

The canonical layer now handles:

- Explicit monthly/yearly conversion
- Indian money formatting through existing `f()` consumers
- Spend distribution reconciliation
- Portfolio per-card reconciliation
- Best-card combined savings definition
- Transaction saved/missed/uplift consistency

Rounding drift is handled deterministically by adjusting the final component in reconciled lists.

## Tests Added

Added `src/data/simulation/metrics.test.ts`.

The tests verify:

- Current, Optimized, and Ultimate totals are consistent across summary and optimize selectors
- Spend distribution rows sum to total spend
- Portfolio card totals reconcile to `savings on spends + milestone benefits - annual fee`
- Per-transaction saved, missed, and market uplift values match canonical scenario outputs
- Best Cards combined savings matches its canonical definition
- Owned-card product rules are enforced for HSBC Travel One, Axis Flipkart, and HSBC Live+
- Merchant-specific rules such as Axis Flipkart Myntra 7.5% cashback and monthly caps are applied through the canonical calculator/transaction helpers
- HDFC Diners Club Black Metal market-card rules are present for category caps, welcome benefit, and milestone benefit

## Validation Run

Passed:

```bash
bun run build
bun run test
```

Also smoke-tested the production preview routes:

- `/home`
- `/cards`
- `/cards/0`
- `/portfolio/create`
- `/portfolio/results`
- `/calculate`
- `/transactions`
- `/optimize`

All returned HTTP 200.

## Reference Sweeps

Completed the required pre-change and post-change sweeps for displayed business metrics and duplicated computations.

After implementation, remaining numeric matches in UI files were broad-search hits for presentation values such as opacity, borders, animation timing, dimensions, and explicit empty/unavailable placeholders. Active displayed business metrics now flow through the canonical metrics selectors.

## Notes

- Some legacy compatibility code remains so older imports continue to work.
- The active Best Card detail route uses the canonicalized detail flow.
- Presentation math such as progress percentages and chart sizing remains in UI components because it controls rendering, not business metric definitions.
- Future metric changes should be made in `src/data/simulation/metrics.ts`, not inside feature components.
- Product card rules live in `src/data/simulation/inputs.ts` for owned cards and `src/data/simulation/recommendData.ts` / `src/data/fixtures/recommendCards.json` for market cards.
- Merchant-aware reward math is handled by `getCardRewardForSpend` and `getBestCardForSpend` in `src/data/simulation/mockApi.ts`.
