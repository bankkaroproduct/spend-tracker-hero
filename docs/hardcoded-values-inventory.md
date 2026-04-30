# Hardcoded And Static Business Values Inventory

Generated during the production metrics migration. Style/layout numbers are not
listed here unless they affect business values.

## Canonical Source Data Inputs

| File | Line | Value | Meaning | Replacement/source |
|---|---:|---|---|---|
| `src/data/simulation/inputs.ts` | 4-27 | spend profile amounts | User spend profile inputs by bucket. Monthly buckets are monthly; annual buckets are annual; lounge buckets are quarterly counts. | Keep as source input until real API/user profile replaces it. |
| `src/data/simulation/inputs.ts` | 125-276 | owned card definitions | User-owned cards, fees, caps, points, milestones, credit limits. | Keep as source input; production metrics must consume via adapters/selectors. |
| `src/data/simulation/inputs.ts` | 142-143 | HSBC Travel One `2/16/24 RP per ₹100` | Base/flight/hotel reward rules. | `adaptUserCard()` -> `CardRuleSet`; UI must not duplicate. |
| `src/data/simulation/inputs.ts` | 190-206 | Axis Flipkart `1%`, Flipkart `5%`, Myntra `7.5%`, ₹4,000 monthly caps | Supplied card rules. | `adaptUserCard()` -> engine; merchant-specific rules only apply when merchant is known. |
| `src/data/simulation/inputs.ts` | 252-258 | HSBC Live+ `1.5%`, `10%`, ₹1,000 shared monthly cap | Supplied card rules. | `adaptUserCard()` -> engine shared-cap logic. |
| `src/data/simulation/inputs.ts` | 289-310 | `ACTUAL_CARD_USAGE` | Current card used per bucket. | Canonical current-savings baseline input. |
| `src/data/simulation/inputs.ts` | 318 | `TOTAL_ANNUAL_SPEND = 1600000` | Annual spend total. | Source input until profile total is derived from real data. |

## API Fixture / Mock Inputs

| File | Line | Value | Meaning | Replacement/source |
|---|---:|---|---|---|
| `src/data/simulation/recommendData.ts` | 15-67 | HDFC Diners Club Black Metal overrides | Supplied HDFC DCBM rules and benefits layered onto fixture card. | Keep in API fixture/adapter boundary. |
| `src/data/simulation/recommendData.ts` | 19 | `75000` | HDFC DCBM card-level yearly RP cap. | `adaptCardGeniusCard()` -> engine card cap. |
| `src/data/simulation/recommendData.ts` | 24-25 | `25000` | Welcome voucher cash value. | Best-card detail selector. |
| `src/data/simulation/recommendData.ts` | 33-37 | `₹4,00,000`, `10,000` | Milestone spend and RP/value. | Best-card detail selector. |
| `src/data/simulation/recommendData.ts` | 42-48 | unlimited lounge, 10% dining discount | HDFC DCBM benefits. | Best-card detail selector; do not count lounge twice in ROI. |
| `src/data/simulation/mockApi.ts` | 227-316 | lounge valuation | Lounge count/value conversion in mock `/calculate`. | Selector bridge treats these as API-valued benefits, not spend rewards. |

## Computed Metrics Now Routed Through Canonical Layer

| File | Line | Value | Meaning | Replacement/source |
|---|---:|---|---|---|
| `src/data/domain/*` | all | period, money, bucket helpers | Canonical unit and identity helpers ported from V2. | Production source. |
| `src/data/engine/*` | all | rewards, caps, portfolio, transaction math | Canonical engine ported from V2. | Production source. |
| `src/data/integrations/*` | all | USER_CARDS / CardGenius adapters | Converts raw data to domain models and validates duplicates. | Production source. |
| `src/data/simulation/metrics.ts` | summary selector | current/optimized savings | Now computed through engine/adapters for owned spend rewards, with API-valued lounge benefits added once. | `selectSummaryMetrics()` only. |
| `src/data/simulation/metrics.ts` | `__metricsDebug()` | old-vs-engine summary drift | Migration diagnostic. | Remove or keep dev-only after full migration. |
| `src/data/simulation/metrics.ts` | `selectBestCardHelpMetrics()` | Best-card brand/category help payload | Best Cards detail "How to use" payload now owns spend, saved, could-save, rate label, cap info, breakdown, and txn count. | UI calls selector and only renders/navigates. |
| `src/features/profile/ProfileScreen.tsx` | profile stats | saved and transaction count | Profile stats now read `SAVINGS_BARS.bar1` and `ALL_TXNS.length` instead of fixed display values. | Keep wired to canonical summary/transaction selectors. |

## Remaining Invalid / UI-Side Business Values To Remove

| File | Line | Value | Problem | Replacement/source |
|---|---:|---|---|---|
| `src/components/sheets/BottomSheets.tsx` | 26-27 | `fmtRate`, `fmtBaseRate` local reward formatting | UI derives rates from legacy maps. | Transaction/action selector should provide rate labels. |
| `src/components/sheets/BottomSheets.tsx` | 295-297 | fallback `conv_rate || 0.20`, fallback `5000` points | UI invents points value if text parsing fails. | Actions metrics should provide points and rupee value or unavailable. |
| `src/components/sheets/BottomSheets.tsx` | 325 | fallback fee waiver threshold `350000`, reset `50 days` | UI fallback business values. | Actions/owned-card metrics should provide threshold and reset days. |
| `src/components/sheets/BottomSheets.tsx` | 330-334 | hardcoded `5%`, `3%`, `2%` category rates | UI-side recommendation rates. | Actions metrics should provide category rows/rates. |
| `src/data/actionsConsider.ts` | 235-245 | hardcoded fee categories/rates | Static action detail values. | `selectActionsMetrics()` should expose these rows from card/transaction data. |
| `src/features/cardDetail/CardAnalysisFigma.tsx` | 457 | “save upto ₹potential” copy | Value is selector-backed, copy remains UI. | Keep copy; ensure `cd.potential` comes from owned-card selector only. |

## Asset Values

## Removed UI-Side Business Values

| File | Removed value | Replacement/source |
|---|---|---|
| `src/features/bestcards/BestCardsScreen.tsx` | Local `b.spend * b.rate / 100`, invented `saved = potential * 0.35`, fallback `0.03`, `altRate: 1`, and `txnCount = spend / 800` | `selectBestCardHelpMetrics()` in `src/data/simulation/metrics.ts`. |
| `src/features/profile/ProfileScreen.tsx` | Fixed saved and transaction-count display values | `SAVINGS_BARS.bar1` and `ALL_TXNS.length`. |

| File | Status | Meaning |
|---|---|---|
| `public/cdn/categories/` | canonical | Category icons used by `categoryImage()`. |
| `public/categories/` | unreferenced in `src`, deletion attempted but blocked by Windows/OneDrive permissions | Legacy category icons. Safe to delete once filesystem permits. |

## Verification Commands

```bash
bun run test
bun run build
bun x vitest run -c vitest.v2.config.ts
```

Current anti-drift grep status:

- `/categories/*` production code references have been migrated to `/cdn/categories/*`.
- UI-side business fallbacks still remain in `BottomSheets.tsx` and `actionsConsider.ts`; these are explicitly listed above and should be removed after Actions/BottomSheet metrics are selector-backed.
- Best Cards detail and Profile display hardcodes listed above have been removed.
