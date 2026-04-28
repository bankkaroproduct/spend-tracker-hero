## Goal

Replace the current ad-hoc "best / switch / newcard / needsdata" tagging with a single source-of-truth scenario classifier (`getTransactionScenario`) that returns one of `S1`, `S2`, `S3`, `S4`, `S5a`, `S5b`, `S5c`, or `S6`. That string drives:

- The **collapsed transaction row** — saved-amount color + tag pill (color + text)
- The **TxnSheet bottom sheet** — section visibility, badges, and copy

This unifies behavior across `LegacyTransactionsScreen`, `LegacyHomeScreen` previews, and `BottomSheets.TxnSheet`.

---

## 1. New file: `src/data/simulation/txnScenario.ts`

Single classifier + helpers. Reuses existing data:

- `getBestCardForBucket(bucket)` → wallet best (cardIndex + monthly savings)
- `getBestMarketCardForBucket(bucket)` → market best (cardName + monthly savings)
- `getEligibleMarketCards()` → for the actual market card object (image, rate)
- `USER_CARDS` → for wallet card name/image lookup

Exports:

```ts
export type ScenarioId = 'S1'|'S2'|'S3'|'S4'|'S5a'|'S5b'|'S5c'|'S6';

export interface TxnScenario {
  id: ScenarioId;
  // Pre-computed display values, all in ₹ already pro-rated to this txn:
  actualSavings: number;
  bestWalletSavings: number;       // for THIS txn
  bestMarketSavings: number;       // for THIS txn
  walletDelta: number;             // bestWalletSavings - actualSavings
  marketDelta: number;             // bestMarketSavings - actualSavings (or vs wallet for S2)
  bestWalletCard: { name: string; image: string; rateLabel: string } | null;
  bestMarketCard: { name: string; image: string; rateLabel: string } | null;
  walletEqualsMarket: boolean;     // S3 sub-state + S5 routing
}

export function getTransactionScenario(txn): TxnScenario;
```

Routing (in this order, matching the spec):

```
if (txn.via === 'UPI' || txn.unaccounted is false but card_index null):
  if (bestWalletSavings === 0 && bestMarketSavings > 0) → S5c
  if (bestMarketSavings > bestWalletSavings)            → S5b
  if (walletCard === marketCard && bestWalletSavings>0) → S5a
  → S6

// Card payments:
if (actualSavings === 0 && bestWalletSavings === 0 && bestMarketSavings > 0) → S4
if (cardUsed !== bestWalletCard && bestWalletSavings > actualSavings)        → S3
if (cardUsed === bestWalletCard && cardUsed === bestMarketCard)              → S1
if (cardUsed === bestWalletCard && bestMarketSavings > actualSavings)        → S2
→ S6
```

Pro-rating identical to existing logic in `compute.ts` line 306–311:
`(amt / bucketMonthlySpend) * monthlySavings`.

---

## 2. Tag pill + collapsed row updates — `LegacyShared.tsx`

Update `ctaVariants` to add the three pill colors per spec, mapped by scenario:

| Scenario | Pill bg | Pill text color | Saved-amount color |
|---|---|---|---|
| S1, S2 | `#EAFBF3` (green) | `#078146` | S1=`#078146`, S2=`#68A250` |
| S3, S5a, S5b | `#F9F9E0` (yellow) | `#CF7908` | `#B56D3C` |
| S4, S5c | `#EAF2FC` (blue) | `#0862CF` | `#B56D3C` |
| S6 | no pill (omit `<InlineCTA>`) | — | `#B56D3C` |

`TransactionRow` props change: accept `scenario: TxnScenario` instead of `cta` + `savedColor`. Compute pill text from `TAG_TEXT[scenario.id]` and shorten card names with `splitCardShort()` (first 2 words). Saved color comes from a `SAVED_COLOR[id]` table.

Tag text templates (uppercase, ₹ formatted with `f()`):

```
S1:  USED BEST CARD FOR THIS
S2:  USED YOUR BEST CARD FOR THIS
S3:  USE {WALLET_CARD} AND SAVE ₹{walletDelta}
S4:  + GET {MARKET_CARD} & EARN ₹{bestMarketSavings}
S5a: USE {WALLET_CARD} AND SAVE ₹{bestWalletSavings}
S5b: USE {WALLET_CARD} AND SAVE ₹{bestWalletSavings}
S5c: + GET {MARKET_CARD} & EARN ₹{bestMarketSavings}
```

`LegacyTransactionsScreen.mapTxn` and the home preview's mapper drop the old `cta` derivation and instead call `getTransactionScenario(t)` once per row, passing the result through.

---

## 3. TxnSheet rewrite — `src/components/sheets/BottomSheets.tsx`

Replace the current `isBest / noReward / walletHasBetter` branching with a single switch on `scenario.id`. Keep all existing styles (card box backgrounds, `cardImgStyle`, `SectionLabel`, `DashedLine`, `txnBtnStyle`, animations).

Per spec — section matrix:

| Section | S1 | S2 | S3 | S4 | S5a | S5b | S5c | S6 |
|---|---|---|---|---|---|---|---|---|
| Card You Used (visual) | ✅ | ✅ | ✅ | ✅ | ❌ UPI text | ❌ UPI text | ❌ UPI text | ✅ |
| "No wallet rewards" subtext | — | — | — | ✅ | — | — | ✅ | — |
| Better Card In Wallet | — | — | ✅ | — | ✅ | ✅ | — | — |
| Worth Adding | — | ✅ | only if mkt>wallet | ✅ | — | ✅ | ✅ | — |
| Green badge ("Best card…") | ✅ in CYU | ✅ in CYU | ✅ in BCIW if wallet=market | — | ✅ in BCIW | — | — | — |
| Amber badge ("Use it next time") | — | — | ✅ in BCIW if wallet≠market | — | — | ✅ in BCIW | — | — |

Background gradient stays scenario-driven:
- S1, S2 → cream `#FFF4DC`
- S3, S5a, S5b → peach `#FDF2E9`
- S4, S5c → light orange `#FFE4DC`
- S6 → plain white

UPI block replaces the "Card You Used" card with the existing grey text box: `"You've used UPI for this transaction. No rewards earned"` (already exists at line 111 — keep verbatim, escape apostrophe with template literal).

"No wallet rewards" subtext box (S4, S5c): reuse the existing grey box style at line 127, copy `"No cards in your wallet give rewards on this brand"`.

Worth Adding shows `bestMarketCard` with `Could Save ₹{bestMarketSavings}` and Details > link → `setScreen("bestcards")` (existing wiring at line 171). For S3 conditional: only render if `bestMarketSavings > bestWalletSavings`.

Badge copy (`{brand}` → `txnSheet.brand`):
- GREEN_BEST_TO_USE: "Best card to use for {brand}" / "Keep using it for maximum rewards" → S1
- GREEN_BEST_IN_MARKET: "Best card in market for {brand}" / "Keep using it for maximum rewards" → S2, S3 (wallet=market), S5a
- AMBER_BETTER_CARD: "Better card for {brand}" / "Use it next time" → S3 (wallet≠market), S5b

S6 dead state: render only the header + a single grey box "No reward on this brand" + Got it button.

---

## 4. Cleanup

- Remove the now-unused `tg()` helper export from `src/data/simulation/legacy.ts` and `computeTag()` in `compute.ts` (or have them call the new classifier internally for backward compatibility — TBD based on remaining call sites; will check `rg "\btg\(|computeTag\("` and adapt).
- `SIM_BEST_FOR` and `SIM_MARKET_BEST` (legacy.ts:374-411) remain — they're still used by the new classifier as quick lookups by merchant name.

---

## Technical notes

- All files involved already use `@ts-nocheck` — no type churn.
- React hook ordering: TxnSheet currently early-returns `if(!txnSheet)`. The scenario is computed after the early-return, no hooks involved → safe.
- No JSX fragments added in conditional branches — use `<div>` wrappers (matches existing pattern).
- Apostrophes already use template literals where needed (line 111).
- All ₹ formatting via existing `f()` from `@/lib/format`.
- Card image lookup: extend the existing `CARD_IMG_MAP` fallback by reading from market card object's `image`/`card_bg_image` (already done in legacy.ts:408).

---

## Files changed

1. **NEW** `src/data/simulation/txnScenario.ts` — classifier + display-value pre-computation.
2. **EDIT** `src/features/legacy/LegacyShared.tsx` — `TransactionRow` accepts `scenario`, new pill/saved-color tables, drop legacy `cta` plumbing.
3. **EDIT** `src/features/legacy/LegacyTransactionsScreen.tsx` — `mapTxn` calls classifier, passes scenario through.
4. **EDIT** `src/components/sheets/BottomSheets.tsx` — `TxnSheet` switches on `scenario.id`, renders sections per matrix; remove ad-hoc `isBest`/`noReward`/`walletHasBetter`.
5. **EDIT** `src/data/simulation/legacy.ts` — re-export `getTransactionScenario`; leave `tg()` shimmed to call new classifier so unrelated screens (home preview) keep working.
6. **EDIT** any home-preview row mapper that constructs `cta` (will check `LegacyHomeScreen` + `LegacyShared.TransactionsPreview` and update to scenario flow).
