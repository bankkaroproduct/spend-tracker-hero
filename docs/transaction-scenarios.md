# Transaction Scenario System

Single source of truth for how each transaction is classified, tagged in the
list, and rendered in the bottom sheet. All routing happens in
`src/data/simulation/txnScenario.ts` via `getTransactionScenario(txn)`.

## Inputs

`getTransactionScenario(txn)` computes these values for the transaction's spend
bucket:

| Variable | Meaning |
|---|---|
| `actualSavings` | Reward earned by the card actually used, or `0` for UPI |
| `bestWalletCard` / `bestWalletSavings` | Best card the user already owns for this bucket |
| `bestMarketCard` / `bestMarketSavings` | Best eligible non-owned market card for this bucket |
| `bestOverallCard` / `bestOverallSavings` | Best card across owned wallet cards plus eligible market cards |
| `worthAddingCard` | Non-owned market card shown in acquisition sections, only when it beats the wallet |
| `walletDelta` | `bestWalletSavings - actualSavings`, clamped at `0` |
| `marketDelta` | `bestMarketSavings - actualSavings`, clamped at `0` |

The scenario layer intentionally separates **best overall** from **worth adding**:
owned cards are included when deciding whether the user already used the best
card in the market, but owned cards are never shown as acquisition recommendations.

## Routing

```ts
if (isUPI) {
  if (bestWalletSavings === 0 && bestMarketSavings > 0) return "S5c";
  if (bestMarketSavings > bestWalletSavings && bestWalletSavings > 0) return "S5b";
  if (bestWalletCard === bestOverallCard && bestWalletSavings > 0) return "S5a";
  return "S6";
}

if (actualSavings === 0 && bestWalletSavings === 0 && bestMarketSavings > 0) return "S4";
if (cardUsed !== bestWalletCard && bestWalletSavings > actualSavings) return "S3";
if (cardUsed === bestWalletCard && cardUsed === bestOverallCard) return "S1";
if (cardUsed === bestWalletCard && bestMarketSavings > actualSavings) return "S2";
return "S6";
```

## Scenario Meanings

| ID | Meaning |
|---|---|
| `S1` | User paid by card and used the best card available overall |
| `S2` | User used their best wallet card, but a non-owned market card earns more |
| `S3` | User owns a better card than the one they used |
| `S4` | Card payment earned zero; no owned card helps, but a market card does |
| `S5a` | UPI payment; the user's best wallet card is also best overall |
| `S5b` | UPI payment; a wallet card helps, but a market card is better |
| `S5c` | UPI payment; no wallet card helps, but a market card does |
| `S6` | Defensive fallback: missing data or no card anywhere rewards this brand |

## UI Rules

Collapsed rows use `tagText()`, `SCENARIO_PILL`, and
`SCENARIO_SAVED_COLOR` from `txnScenario.ts`. `S6` renders no tag pill.

Saved amount colors are exact:

| Scenario | Hex |
|---|---|
| `S1` | `#078146` |
| `S2` | `#68A250` |
| `S3`, `S4`, `S5a`, `S5b`, `S5c`, `S6` | `#B56D3C` |

Bottom-sheet section visibility is returned on the scenario object:

| Scenario | Card You Used | Better Wallet Card | Worth Adding |
|---|:---:|:---:|:---:|
| `S1` | yes, green best-card badge | no | no |
| `S2` | yes, green market-best badge | no | yes |
| `S3` | yes | yes | only if market savings beats wallet savings |
| `S4` | yes, no-wallet-reward subtext | no | yes |
| `S5a` | UPI text | yes, green market-best badge | no |
| `S5b` | UPI text | yes, amber better-card badge | yes |
| `S5c` | UPI text plus no-wallet-reward subtext | no | yes |
| `S6` | neutral no-reward text | no | no |

## Invariants

1. `getTransactionScenario()` runs once per transaction and child components do
   not re-route scenarios.
2. Worth Adding never recommends an owned card.
3. UPI is a payment method, not a card visual.
4. Missing bucket, missing card mapping, or zero useful savings safely falls
   back to `S6`.
5. Any scenario routing or visibility change must update this document.
