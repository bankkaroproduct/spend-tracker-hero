# Transaction Scenario System

Single source of truth for how each transaction is classified, tagged in the
list, and rendered in the bottom sheet. All routing happens in
**`src/data/simulation/txnScenario.ts`** via `getTransactionScenario(txn)`.

## Inputs (per transaction)

Computed inside `getTransactionScenario`:

| Variable | Source | Meaning |
|---|---|---|
| `bucket` | `txn.bucket` or `MERCHANT_TO_BUCKET[txn.brand]` | Spend bucket key (e.g. `dining_or_going_out`) |
| `isUPI` | `txn.via === "UPI"` or `txn.card === "UPI"` | Was this a UPI payment? |
| `proRate` | `txn.amt / monthlyBucketSpend` | Scale monthly bucket savings → this txn |
| `actualSavings` | `calculateResponses[cardIdx].spending_breakdown[bucket].savings × proRate` | What the user actually earned |
| `bestWalletSavings` | `getBestCardForBucket(bucket).savings × proRate` | Best of the user's owned cards |
| `bestMarketSavings` | `getBestMarketCardForBucket(bucket).savings × proRate` | Best of eligible market cards |
| `walletDelta` | `max(0, bestWalletSavings − actualSavings)` | What they'd gain by switching wallet card |
| `marketDelta` | `max(0, bestMarketSavings − actualSavings)` | What they'd gain by adding the market card |

> **Eligible market cards** = `recommendResponse.savings` filtered by:
> - `!isInviteOnlyMarketCard` (excludes Magnus Burgundy, HDFC Infinia)
> - `!isAlreadyOwnedMarketCard` (excludes any card the user already owns, by normalized name)
>
> See `src/data/simulation/mockApi.ts`.

## Scenarios (S1–S6)

| ID | Condition | Meaning |
|---|---|---|
| **S1** | Used best wallet card AND that card ≥ best market card | Optimal — best in market |
| **S2** | Used best wallet card BUT a market card would do better | Optimal in wallet, market upgrade exists |
| **S3** | Used a card, but a different **owned** card would earn more | Switch to a card you already have |
| **S4** | Card payment with `actualSavings = 0` AND `bestWalletSavings = 0` AND `bestMarketSavings > 0` | No wallet card rewards this brand; only a market card would |
| **S5a** | UPI, wallet card would earn (and market doesn't beat it) | Use card instead of UPI |
| **S5b** | UPI, market card beats best wallet card | Use card instead of UPI; also a market upgrade exists |
| **S5c** | UPI, no rewarding wallet card, only market card would earn | Acquisition opportunity via UPI |
| **S6** | Fallback — unaccounted, missing bucket, or no useful comparison | Neutral / no actionable insight |

### Routing pseudocode

```
if isUPI:
  if !bestWallet && bestMarket: S5c
  elif bestMarket > bestWallet: S5b
  elif bestWallet > 0:          S5a
  else:                         S6
else:  // card payment
  if actual==0 && bestWallet==0 && bestMarket>0: S4
  if cardUsed != bestWalletCard && bestWallet > actual: S3
  if cardUsed == bestWalletCard:
    if bestMarket <= actual or walletEqualsMarket: S1
    else: S2
  else: S6
```

## Tag pill (transaction list)

Defined in `txnScenario.ts` — `tagText()` and `SCENARIO_PILL`.

| ID | Text template | Pill bg | Pill color |
|---|---|---|---|
| S1 | `USED BEST CARD FOR THIS` | `#EAFBF3` | `#078146` |
| S2 | `USED YOUR BEST CARD FOR THIS` | `#EAFBF3` | `#078146` |
| S3 | `USE {WALLET} AND SAVE ₹{walletDelta}` | `#FBF6D8` | `#B07A0E` |
| S4 | `+ GET {MARKET} & EARN ₹{bestMarketSavings}` | blue gradient | `#0862CF` |
| S5a | `USE {WALLET} AND SAVE ₹{bestWalletSavings}` | `#FBF6D8` | `#B07A0E` |
| S5b | `USE {WALLET} AND SAVE ₹{bestWalletSavings}` | `#FBF6D8` | `#B07A0E` |
| S5c | `+ GET {MARKET} & EARN ₹{bestMarketSavings}` | blue gradient | `#0862CF` |
| S6 | (no tag) | `#EDEDED` | `#7a8296` |

### Saved-amount color (`SCENARIO_SAVED_COLOR`)

| Scenario | Hex |
|---|---|
| S1 | `#078146` (deep green) |
| S2 | `#68A250` (light green) |
| S3 / S4 / S5a / S5b / S5c / S6 | `#B56D3C` (rust — denotes leak) |

## Bottom-sheet visibility matrix

`src/components/sheets/BottomSheets.tsx` → `TxnSheet`. Three blocks
(`CardYouUsedBlock`, `BetterCardInWalletBlock`, `WorthAddingBlock`) toggle per
scenario:

| Scenario | Card You Used | Better Card In Wallet | Worth Adding |
|---|:---:|:---:|:---:|
| S1 | ✅ (with green "best in market" badge) | — | — |
| S2 | ✅ | — | ✅ |
| S3 | ✅ | ✅ | **❌** (do not nudge market when wallet already wins) |
| S4 | ✅ (no-reward subtext) | — | ✅ |
| S5a | ✅ (UPI text variant) | ✅ | — |
| S5b | ✅ (UPI text variant) | ✅ | ✅ |
| S5c | ✅ (UPI no-reward subtext) | — | ✅ |
| S6 | ✅ (neutral) | — | — |

### Sheet background gradient (`SHEET_BG`)

| Scenario | Gradient (top → corner accent) |
|---|---|
| S1 | white → `#FFF4DC` (gold) |
| S2 / S3 / S5a / S5b | white → `#FDF2E9` (peach) |
| S4 / S5c | white → `#EAF2FC` (blue) |
| S6 | white → `#FFE4DC` (red) |

## Critical invariants

1. **Never recommend a card the user already owns.** `getEligibleMarketCards()`
   filters via both `isInviteOnlyMarketCard` and `isAlreadyOwnedMarketCard`.
   Name matching uses normalization (strips "credit card", punctuation, case).
2. **Pro-rate, never hardcode.** Per-transaction savings always derive from the
   bucket's monthly savings × `(txnAmt / monthlyBucketSpend)`. No `0.03 × amt`
   style fallbacks.
3. **S3 hides "Worth Adding".** When the user already has a better wallet card,
   the primary message is "use what you own" — adding a market card dilutes it.
4. **Invite-only cards excluded everywhere.** Magnus Burgundy and HDFC Infinia
   are filtered from market recommendations and from the optimisation totals on
   the Best Cards screen.
5. **All `useState` at the top of `TxnSheet` before any conditional return.**
   No JSX fragments inside `BottomSheets.tsx` (project convention).

## Where to edit

| Change | File |
|---|---|
| Add/rename a scenario, change routing | `src/data/simulation/txnScenario.ts` |
| Change tag text or pill colors | `txnScenario.ts` (`tagText`, `SCENARIO_PILL`, `SCENARIO_SAVED_COLOR`) |
| Show/hide a block per scenario | `src/components/sheets/BottomSheets.tsx` (`showCYU`, `showBetterInWallet`, `showWorthAdding`) |
| Filter market card pool | `src/data/simulation/mockApi.ts` (`getEligibleMarketCards`) |
| Bucket ↔ merchant mapping | `src/data/simulation/inputs.ts` (`BUCKET_TO_MERCHANT`, `MERCHANT_TO_BUCKET`) |
