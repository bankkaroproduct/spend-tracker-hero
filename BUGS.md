# Bug List

Status legend: 🔴 open · 🟡 in progress · 🟢 fixed

## Optimize → Recommended Ultimate Card → "View all Details"

### 🟢 BUG-1 — Redirect lands on wrong URL (FIXED — `/cards/best/:slug` route added; deep-linkable)
- **Where**: Tap "View all Details" on Optimize hero (Image #6, ₹1,21,541/yr promo for HDFC Diners Black).
- **Observed**: URL becomes `http://localhost:8080/cards` (BestCards list route). Should be a per-card detail URL.
- **Root cause**: `openUltimateCardDetail` in `src/features/legacy/LegacyOptimiseScreen.tsx:1213` calls `setScreen("bestcards")`. The route mapping in `src/pages/Index.tsx:308` is `bestcards → /cards`. List vs. detail is internal `bestCardDetail` state, not URL.
- **Fix plan**: Step 5 — add `/cards/best/:slug` route and update screen↔URL mapping.

### 🟢 BUG-2 — Headline savings value mismatch (FIXED) (₹1,21,541 → ₹70,068)
- **Where**: Detail page header `SAVE UPTO`.
- **Observed**: Optimize tile promised ₹1,21,541/yr; detail shows ₹70,068/yr.
- **Root cause**: Optimize tile reads `CARD_PROMO.savings` (`marketYearlySavings(marketTop)` = standalone yearly on full spend). `CardDetailV2` line 132 reads `portfolio.totalSavings` from `selectPortfolioMetrics([card.name])` (best-per-bucket of {3 user cards + this card}). Different metrics.
- **Fix plan**: Step 1 — pass `savings` through `openUltimateCardDetail`; `CardDetailV2` uses `card.savings ?? portfolio.totalSavings`.

### 🟢 BUG-3 — Card image missing (FIXED) (orange placeholder)
- **Where**: Detail page header (Image #7).
- **Observed**: Generic orange rectangle instead of HDFC Diners Black art.
- **Root cause**: `openUltimateCardDetail` builds a stub card object with no `image` field; `CARD_PROMO.image` not threaded through.
- **Fix plan**: Step 1 — include `image: CARD_PROMO.image` in the stub.

### 🟢 BUG-4 — Hardcoded sections render HSBC Travel One copy (FIXED — Milestones/Welcome/Lounge/Fees now derived from card payload) for every card
- **Where**: `CardDetailV2.tsx` lines 14–68 — `MILESTONES`, `LOUNGE`, `WELCOME`, `FEES_WAIVERS`, `ADDITIONAL_BANK_FEES`, `LATE_PAYMENT_FEES`, `TIMELINE`.
- **Observed**: Open detail for any non-HSBC-Travel-One card; Milestones/Lounge/Welcome/Fees/Late Fees/Timeline copy is wrong (HSBC text, ₹500 annual fee, "Spend ₹20,000/month on Axis Flipkart Card via the Flipkart App" timeline, etc.).
- **Root cause**: Constants authored for one card, never re-derived per `card`.
- **Fix plan**: Step 3 — derive from `card.milestone_benefits`, `welcome_benefits`, `travel_benefits`, `fee_waiver`, `product_usps`.

### 🟢 BUG-5 — Cards Usage shows wrong cards (FIXED — exact-match in selectPortfolioMetrics)
- **Where**: Detail page → Cards Usage section per-category panel (Image #5, #8).
- **Observed**: Categories list non-owned, non-recommended cards (HDFC Swiggy, PIXEL Play). Insurance row shows Diners Black with ₹1,08,000 spend → ₹3,600/yr savings (suspicious). Rent row shows HSBC Travel One with ₹0/yr (cap missing).
- **Root cause**: `selectPortfolioMetrics([card.name])` uses fuzzy substring match (`metrics.ts:425`) — pulls in unrelated market cards. Compounding: when called from detail page, candidate set should be {3 user cards + this one card}, not "any card whose normalized name overlaps".
- **Fix plan**: Step 2 — switch to exact match; verify candidates are correct.

### 🟢 BUG-6 — Back button returns to BestCards list (FIXED), not Optimize
- **Where**: Detail page back arrow.
- **Observed**: Tapping back goes to /cards (BestCards list), not /optimize where the user came from.
- **Root cause**: `openUltimateCardDetail` never sets `bcFromScreen`; `CardDetailV2` close button calls `setBestCardDetail(null)` which falls back to BestCards list.
- **Fix plan**: Step 1 — set `bcFromScreen="optimize"`; close button respects it.

## BestCards list page (`/cards`)

### 🟢 BUG-7 — "Current Savings" disagrees with home hero (FIXED — now reads SAVINGS_BARS.bar1)
- **Where**: BestCards hero block — "Current Savings ₹63,870/yr" (Image #10).
- **Observed**: Home hero shows ₹26,226 ("You saved"); BestCards shows ₹63,870.
- **Root cause**: BestCards hero uses a different selector than `selectSavingsBars().bar1`.
- **Fix plan**: Step 4 — reconcile to single source.

### 🟢 BUG-8 — "You Could Save" disagrees with optimize bar3 (FIXED — now reads SAVINGS_BARS.bar3)
- **Where**: BestCards hero — "You Could Save ₹97,691/yr" (Image #10).
- **Observed**: Optimize/home bar3 = ₹1,21,541; BestCards hero = ₹97,691.
- **Root cause**: Same as BUG-7 — different selector.
- **Fix plan**: Step 4.

### 🟢 BUG-9 — Per-row "Combine with your cards & Save ₹X" values look invented (FIXED — now uses selectPortfolioMetrics best-per-bucket)
- **Where**: BestCards list rows (Image #11). Axis Magnus Burgundy "Save ₹1,81,724"; HSBC Premier "Save ₹1,55,011".
- **Observed**: Values not traceable to any /calculate or /recommend response.
- **Root cause**: `BEST_CARDS_COMB_SAVINGS` selector — needs audit.
- **Fix plan**: Step 4.

## Other

### 🟡 BUG-10 — Buttons / tags broken on detail page (PARTIAL — likely resolved by BUG-4/5 fixes; needs visual re-check)
- **Where**: Generic complaint across detail page.
- **Observed**: User reports "buttons, tags, etc nothing working".
- **Root cause**: TBD — likely fallout from BUG-4/5 (content keyed to wrong card data).
- **Fix plan**: Re-check after Step 3.

---

## Newly discovered (audit pass — onboarding / state / redeem)

### 🟡 BUG-11 — GmailExtraInfoScreen bypasses completeGmailLink() (DOCUMENTED INTENTIONAL per CLAUDE.md)
- **Where**: `src/features/onboard/GmailExtraInfoScreen.tsx:162–169`
- **Observed**: handleProceed sets `hasGmail`/`userFlag`/`mappingCompleted`/`cardMapping` directly then `setScreen("txn-eval")` after 2s — never calls `completeGmailLink()`. Documented in CLAUDE.md as "intentional", but means any post-link side-effects (analytics, deep-link, future flags) silently skip in onboarding while BuildingScreen's Gmail path goes through `completeGmailLink`.
- **Severity**: High (silent-divergence risk).

### 🟢 BUG-16 — NOT A BUG (Resolution summary "Continue" button at line 159 calls `setBuildPhase(5)`; the gap between summary appearing and user clicking Continue is a deliberate confirm-gate, not a stall)
- **Where**: `src/features/building/BuildingScreen.tsx:119–125` + `src/pages/Index.tsx:428–437`
- **Observed**: When user confirms manual card mapping in CardMappingUI, code sets `showCardMappingUI=false`, `showResolutionSummary=true` but never bumps `buildPhase`. The phase-watcher in Index.tsx only auto-advances when `buildPhase` increments — so the cinematic stalls on the resolution summary and never transitions to home.
- **Severity**: Critical (dead-end UX).

### 🟢 BUG-18 (onboarding) — ManualEntryScreen accepts "Other" as valid (FIXED — allMapped now requires non-Other for every slot)
- **Where**: `src/features/onboard/ManualEntryScreen.tsx:130`
- **Observed**: `allMapped = SLOTS.every((_, i) => mappings[i])` passes when slot is `"Other"` (skip). User can hit "Skip →" on all 3 slots and the confirmation screen still renders + advances to `txn-eval`. Should require a real card pick.
- **Severity**: High (silent data corruption — onboarding marks user as State-2 with no real cards).

### 🟢 BUG-13 — CardIdentificationScreen state bleed (FIXED — clears cardMapping + mappingCompleted on switch to manual)
- **Where**: `src/features/onboard/CardIdentificationScreen.tsx:126–128`
- **Observed**: Tapping "I'll enter them manually" doesn't reset `cardMapping` or `mappingCompleted`, so stale mappings from an earlier failed attempt persist into the new manual flow.
- **Severity**: Medium (state bleed).

### 🟡 BUG-14 — RedeemScreen State-1/2 overlay is visual-only
- **Where**: `src/features/redeem/RedeemScreen.tsx:57–71`
- **Observed**: The "Your points balance is unknown" overlay covers the screen but the underlying RedeemBS sheet stays mounted + interactive. Bypassable via DOM/CSS.
- **Severity**: Medium (low real-world risk in a mobile webview, but not a true gate).

### 🟡 BUG-15 — Actions State-1 filter hides non-credit-limit caps
- **Where**: `src/pages/Index.tsx:234–237`
- **Observed**: `getFilteredActions` for State-1 keeps only `type==="points" || type==="milestone" || (type==="cap" && a.creditLimit===true)`. Annual-fee-waiver caps and other non-credit-limit caps disappear in State-1 even though they're meaningful to the user.
- **Severity**: Medium (matches CLAUDE.md spec — may be a spec bug rather than an impl bug; flag for product call).

## Newly discovered (audit pass — transactions / bottom sheets)

> _All entries below are agent-found (Explore audit). File:line refs verified by the agent; root-cause claims still need a 5-minute manual check before fixing. Marked ⚠️ where the agent's reasoning sounded shaky._

### 🟢 BUG-17 — Card-Used filter chips silently fail (FIXED — `useTransactionGroups` uses substring match; chip label fixed)
- **Where**: `src/features/legacy/LegacyTransactionsScreen.tsx:64` + `src/components/sheets/BottomSheets.tsx:702`
- **Observed**: Filter chips store short keys (`"Flipkart"`, `"Travel One"`, `"Live+"`, `"UPI"`) but each `txn.card` field uses full names (`"Axis Flipkart Card"`, `"HSBC Travel One"`, `"HSBC Live+"`). Chip → filter set works, but the equality test against `txn.card` never matches → chips appear active but filter nothing.
- **Severity**: **High** (silent UX failure on a top-level control).

### 🟢 BUG-18 — "via HSBC Live +" chip label has stray space (FIXED — replaced all instances)
- **Where**: `src/features/legacy/LegacyTransactionsScreen.tsx:64`
- **Observed**: Chip displays "Live +" (with space) but mapping key + transaction `card` use "Live+" (no space). Typo blocks the comparison even after BUG-17 is fixed.
- **Severity**: **High** (specific manifestation of BUG-17, fix together).

### 🟢 BUG-19 — TxnSheet "Worth Adding" block shows full market savings instead of delta (FIXED — now uses marketDelta)
- **Where**: `src/components/sheets/BottomSheets.tsx:169`
- **Observed**: Worth Adding block reads `scn.bestMarketSavings` (full monthly card savings) but the copy says "Could Save". S3 path correctly uses `scn.marketDelta` (line 120). Inconsistency = wrong number under "Could Save".
- **Severity**: **High** (number lies to user).

### 🟡 BUG-20 — TxnSheet S5a/S5b show wallet savings instead of delta
- **Where**: `src/components/sheets/BottomSheets.tsx:120`
- **Observed**: BetterCardInWalletBlock branches on S3 to use `walletDelta`, but S5a/S5b paths fall through and display full `bestWalletSavings` instead. UPI scenarios show inflated "Could Save" text.
- **Severity**: **High** (same family as BUG-19; verify together against `docs/transaction-scenarios.md` visibility matrix).

### 🟡 BUG-21 — S2 scenario condition is unreachable (S1 swallows it)
- **Where**: `src/data/simulation/txnScenario.ts:254–259`
- **Observed**: S2 requires `cardUsedIsBestWallet && bestMarketSavings > actualSavings`. But the prior branch (line 254) returns S1 whenever `cardUsedIsBestWallet && cardUsedIsBestOverall`. Result: S2 is dead code; some transactions that should route to S2 surface as S1 with no Worth-Adding block.
- **Severity**: **Medium** (need to confirm what was supposed to differ between S1 and S2 — possible spec bug).

### 🟡 BUG-22 — CatBS uses base-rate fallback instead of per-bucket rate when tagging unaccounted txns
- **Where**: `src/components/sheets/BottomSheets.tsx:663`
- **Observed**: When user assigns a brand to an unaccounted txn, saved amount falls back to `SIM_CARD_BASE_RATE[card]` if no per-brand rate. Per CLAUDE.md "always compute from actual bucket rates" — should use per-bucket rate from simulation.
- **Severity**: **Medium**.

### 🟡 BUG-23 — TransactionRow saved-color override masks no-reward fallback
- **Where**: `src/features/legacy/LegacyShared.tsx:980`
- **Observed**: `saved === "₹0"` brown-color check happens after `SCENARIO_SAVED_COLOR[scenario.id]` override. If a scenario is computed for an S6 (no reward) row, the green color from the lookup wins instead of the brown ₹0 indicator.
- **Severity**: **Medium**.

### ⚠️ BUG-24 — ScenarioSheet S3 visibility mixes S3 and UPI rules (audit-flagged, low confidence)
- **Where**: `src/data/simulation/txnScenario.ts:181`
- **Observed (per agent)**: `showBetterInWallet` includes S3 (where user already owns better card), but the same flag also drives UPI scenarios. Mixed semantics.
- **Severity**: Medium. Verify against the visibility matrix in `docs/transaction-scenarios.md` before fixing.

### ⚠️ BUG-25 — TxnSheet best-market-card image fallback hardcodes HDFC Infinia
- **Where**: `src/data/simulation/txnScenario.ts:171`
- **Observed**: Image fallback chain: `card.image || card.card_bg_image || CARD_IMG_MAP[name] || "/legacy-assets/cards/hdfc-infinia.webp"`. Cards not in `CARD_IMG_MAP` show HDFC Infinia art under their name.
- **Severity**: Medium (visual lie).

### ⚠️ BUG-26 — FilterSheet State-2 displays mapped name but filters by short key
- **Where**: `src/components/sheets/BottomSheets.tsx:702`
- **Observed**: State-2 chip label shows `"HSBC " + cardMapping[0]` (friendly mapped name); filter logic still toggles short key. Same root cause family as BUG-17.
- **Severity**: Medium.

## Newly discovered (audit pass — best-cards / portfolio)

### 🟢 BUG-27 — `portfolioEntryCard` leak (FIXED — cleared in onCloseDetail)
- **Where**: `src/features/bestcards/CardDetailV2.tsx:79–82`
- **Observed**: "Create Portfolio" sets `portfolioEntryCard` but `onCloseDetail()` never clears it. Open card A → Create Portfolio → back → open card B → Create Portfolio → portfolio-create still pre-selects card A.
- **Severity**: **High** (broken sequential flow).

### 🟢 BUG-28 — PortfolioResultsScreen ghost portfolio (FIXED — redirects to portfolio-create when empty)
- **Where**: `src/features/portfolio/PortfolioResultsScreen.tsx:181`
- **Observed**: `const newCards = (portfolioNew?.length > 0) ? portfolioNew : ["Amex Travel Platinum", "AU Zenith", "HDFC Millennia"]`. If user clears their selection and lands on results, they see a fictional portfolio instead of a "no cards selected" empty state.
- **Severity**: **High** (ghost data — user thinks they have a portfolio they don't).

### 🟡 BUG-29 — `CARD_IMG_MAP` in PortfolioResultsScreen is incomplete; market cards not in the map render as a gradient placeholder
- **Where**: `src/features/portfolio/PortfolioResultsScreen.tsx:15–30, 365`
- **Observed**: Hardcoded 11-entry map. Any market card outside that list (Axis Neo, HDFC Millennium, etc.) renders blank in the carousel. Should fall back to `card.image` from the recommend response (CardDetailV2 already does this).
- **Severity**: Medium.

### 🟡 BUG-30 — Search query in BestCards list persists across detail navigation
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:42, 390`
- **Observed**: User searches → opens detail → backs out → list still filtered. Detail page itself queries the full set, so the user sees full data on detail then a filtered list on return. No reset on `setBestCardDetail`.
- **Severity**: Medium.

### 🟡 BUG-31 — Tab selection resets to "How to use" when switching cards in PortfolioResultsScreen pill nav
- **Where**: `src/features/portfolio/PortfolioResultsScreen.tsx:193, 323–330`
- **Observed**: User on Benefits tab clicks a different card pill → page snaps back to "How to use" tab. Tab state not preserved across `activeCard` change.
- **Severity**: Medium.

### 🟡 BUG-32 — "Apply Now" passes incomplete `card` object to eligibility sheet
- **Where**: `src/features/bestcards/CardDetailV2.tsx:273`
- **Observed**: `setBcEligSheet(card)` passes whatever `card` was supplied to CardDetailV2. From the optimize-promo path, `card` is a stub built in `openUltimateCardDetail` and may lack fields the eligibility sheet expects (`annualFee`, eligibility criteria, etc.).
- **Severity**: Medium.

### ⚠️ BUG-33 — Floating "Card Portfolio" widget may not re-render on portfolio change (audit-flagged, low confidence)
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:604`
- **Observed (per agent)**: Widget shows stale slot count after adding cards via list. Agent's "missing dependency" reasoning is suspect — `portfolioNew` is React state and should re-render. Possibly the bug is real but the cause is different (e.g., state is updated via module-level `_store` mirror without the Provider re-rendering).
- **Severity**: Medium. **Reproduce manually before changing code.**

### ⚠️ BUG-34 — "Add to Portfolio" button has no visual disabled state when portfolio is full
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:558`
- **Observed**: When `portfolioFull`, click is no-op but the button keeps full opacity / same color. Looks clickable.
- **Severity**: Low (cosmetic, but listed because it's a real UX glitch).

## Cross-screen consistency audit

The data-consistency agent reports **no remaining mismatches** across Home / Optimize / BestCards / CardDetailV2 / Profile (all use `SAVINGS_BARS.bar1/2/3` and `selectPortfolioMetrics()`) and **all four hardcoded percentage fallbacks listed in CLAUDE.md are no longer in the code** (TxnSheet 0.05/0.10, CatBS 0.02, CardDetailScreen 0.03). This contradicts CLAUDE.md — CLAUDE.md needs an update if confirmed.

**Action item**: spot-check the four CLAUDE.md locations manually, then update CLAUDE.md if clean.

## Deep audit pass — rewards math pipeline

> _Numerical-correctness audit. Run-once verifications below before fixing — but the agent's reasoning was concrete and I trust the file:line references._

### 🟢 BUG-35 — Lounge benefit double-counted in card ROI (FIXED)
- **Where**: `src/data/simulation/mockApi.ts:286–287, 299`
- **Observed**: Lounge annual value (e.g. ₹2,250 for HSBC Travel One) is stored as `annual÷12` per month inside `breakdown[lounge_bucket].savings`, then aggregated `× 12` into `total_savings_yearly` (correctly recovering ₹2,250). But `roi` then **adds `total_travel_benefit_annual` again**, producing a +₹2,250 overstatement (HSBC Travel One ROI = ₹14,250 instead of ₹12,750).
- **Severity**: **Critical** (every points-card with lounge benefit reports inflated ROI).

### 🟢 BUG-36 — `computeCurrentSavings()` omits lounge benefit entirely (FALSE POSITIVE)
> _Verified: `ACTUAL_CARD_USAGE` defines lounge buckets with `cardIdx=0` (not undefined). The skip condition (`cardIdx == null`) only fires for buckets not in the map. Lounge savings ARE included via `getBucketSavings(0, "domestic_lounge_usage_quarterly")` which returns `domLoungeAnnual/12`, then × 12 in `computeCurrentSavings`. Bar1 includes lounge correctly._

### (was) BUG-36
- **Where**: `src/data/simulation/compute.ts:56–64`
- **Observed**: Iterates `ALL_INPUT_BUCKETS`, skips bucket if `ACTUAL_CARD_USAGE[bucket]` is undefined. Lounge buckets (`domestic_lounge_usage_quarterly`, `international_lounge_usage_quarterly`) aren't in `ACTUAL_CARD_USAGE` → silently skipped. Result: `SAVINGS_BARS.bar1` (Current Savings, shown on home/BestCards/everywhere) excludes ₹2,250 of real lounge value while `total_savings_yearly` (used in some other selectors) includes it. The two values disagree on every screen.
- **Severity**: **High** (pre-existing inconsistency BUG-7/8 fix didn't cover this — re-introduces the same family of mismatch when comparing bar1 vs per-card `total_savings_yearly`).

### 🟡 BUG-37 — Shared cap pro-rate runs after per-bucket clamp (cap arithmetic order)
- **Where**: `src/data/simulation/mockApi.ts:183–225`
- **Observed**: Per-bucket caps clamp first, then shared-cap proportional redistribution treats the already-clamped values as inputs. Currently no card hits this case (HSBC Live+'s shared-cap buckets have no per-bucket caps), but the design hides overflow if a future card has both. Order should be: shared cap first, then per-bucket cap.
- **Severity**: Medium (latent — fragile).

### 🟡 BUG-38 — Shared-cap pro-rate mixes points and cashback units
- **Where**: `src/data/simulation/mockApi.ts:82–94, 217`
- **Observed**: For points cards, `breakdown[bucket].savings` is stored in ₹ (after `points × conv_rate`). Shared-cap redistribution uses raw ₹. Today only HSBC Live+ (cashback) has shared caps so no live bug; if a future points card gets a shared cap, the cap value (e.g. ₹1,000) will be applied to points-converted ₹ but the underlying cap was likely meant in raw points.
- **Severity**: Medium (latent).

### 🟢 BUG-39 — `marketYearlySavings` falsy fallback (FIXED — explicit typeof number check)
- **Where**: `src/data/simulation/metrics.ts:108–110`
- **Observed**: `card.total_savings_yearly || parseMoney(card.annual_rewards_value) || parseMoney(card.net_annual_savings)`. If a card legitimately produces ₹0 of savings (zero spend on its categories), the falsy-zero falls through to the next field which may be a stale/unconditional API value. Cards with no real fit get listed with overstated savings.
- **Severity**: Medium. Fix: use `?? null` on the first read or explicit `typeof === "number"` check.

### 🟡 BUG-40 — `reconcileNumberParts` reconciles spend but not all aggregated money fields
- **Where**: `src/data/simulation/metrics.ts:470–476`
- **Observed**: Reconciliation runs separately on `cards.spend` and on `cards.save`. Subsidiary fields like `breakdown.savingsOnSpends`, `milestoneBenefits`, `annualFee` are computed from already-rounded values without reconciliation. Sum of card-level breakdowns can drift ₹1–₹2 from the headline.
- **Severity**: Medium (cosmetic, but very common to spot in a screenshot).

### 🟡 BUG-41 — `getBestCardForBucket` ties → first-encountered card wins, no documented tiebreaker
- **Where**: `src/data/simulation/mockApi.ts:358–365`
- **Observed**: Strict `>` comparison; on ties, card index 0 wins. If the upstream order of `calculateResponses` ever changes (e.g. cards re-sorted in inputs.ts), the bar2/bar3 values can flip without spec change.
- **Severity**: Medium (deterministic today but brittle).

### 🟡 BUG-42 — Annual-bucket caps treated as monthly via `getMonthlySpend()`
- **Where**: `src/data/simulation/inputs.ts:30–33`, `mockApi.ts:154`
- **Observed**: `flights_annual` (₹1,00,000/yr) is divided by 12 → ₹8,333/mo, then RP caps applied as monthly (1,800 RP/mo). Spec doesn't clearly state whether the 1,800 RP cap is monthly-on-the-monthly-share or annual. Code treats as monthly. If spec means annual, computed reward is 12× too high for travel buckets.
- **Severity**: Medium. **Verify spec with product before fixing** — could be either reading.

## Deep audit pass — owned card detail (8 tabs)

### 🟢 BUG-43 — Cap progress bars display ₹ for reward-points cards (FIXED — convert to RP via toDisplayUnit)
- **Where**: `src/features/cardDetail/CardAnalysisFigma.tsx:187–188`
- **Observed**: All caps render `₹${f(usedNum)}/₹${f(totalNum)}`. For points cards (Axis Flipkart, HSBC Travel One) the cap unit is RP, not ₹. Result: HSBC Travel One travel cap shows "₹1,800 / ₹1,800" instead of "1,800 RP / 1,800 RP" — wrong unit AND if user reads as ₹ the number is misleading.
- **Severity**: **High** (wrong unit lies to user about their cap headroom).

### 🟢 BUG-44 — `BANK_FEES` / `LATE_FEES` hardcoded to card 0 (FIXED — added @deprecated; verified no live consumers; per-card adapter in legacy.ts is canonical)
- **Where**: `src/data/cardDetail.ts:48, 68`
- **Observed**: `export const BANK_FEES = BANK_FEES_HSBC_TRAVEL; export const LATE_FEES = LATE_FEES_HSBC_TRAVEL`. Anything importing `BANK_FEES`/`LATE_FEES` directly from `cardDetail.ts` (vs. the per-card `PER_CARD_BANK_FEES[i]` adapter in `legacy.ts`) sees HSBC Travel One values for every card.
- **Severity**: **High** (silent data corruption; needs grep for direct imports).

### 🟢 BUG-45 — Cap progress bar overage clamped (FIXED — `exceeded` flag flips bar red + "EXCEEDED" label)
- **Where**: `src/features/cardDetail/CardAnalysisFigma.tsx:183`
- **Observed**: `Math.min(100, Math.round((used/total) * 100))`. If used > total, bar shows 100% green/yellow but never indicates "you've already exceeded the cap — additional spend earns nothing". The Card Detail's whole purpose is to flag this.
- **Severity**: **High** (defeats the cap-tracking feature).

### 🟡 BUG-46 — `CapBar` has no "this txn" secondary fill (per CLAUDE.md spec)
- **Where**: `src/features/cardDetail/CardAnalysisFigma.tsx:110–124`
- **Observed**: CLAUDE.md "Card Detail Progress Bars" specifies primary fill (monthly used) + secondary fill (this txn). `CapBar` renders only one fill.
- **Severity**: Medium (missing spec'd visual; not a data bug).

### 🟡 BUG-47 — `cardIndex` resolved by `CARDS.findIndex(c.name === uc.name)` instead of being passed in
- **Where**: `src/features/cardDetail/CardAnalysisFigma.tsx:136–137`
- **Observed**: Parent `CardDetailScreen` already knows `ci` (card index from URL/state). CardAnalysisFigma re-derives via name lookup; if two cards ever share a name (or `CARDS` reorders), wrong CD entry shown.
- **Severity**: Medium (latent fragility).

### 🟢 BUG-48 — Cap list silently truncated to 3 entries (FIXED — removed slice(0,3))
- **Where**: `src/features/cardDetail/CardAnalysisFigma.tsx:180`
- **Observed**: `(cd?.limits?.caps || []).slice(0, 3)`. Cards with 4+ caps lose the 4th silently; no overflow indicator.
- **Severity**: Medium.

### 🟡 BUG-49 — Per-card transactions tab uses `t.via.includes(uc.name)` substring match
- **Where**: `src/features/cardDetail/CardDetailScreen.tsx:122`
- **Observed**: Substring match works today (no card name is a prefix of another) but a future card named "Travel" would match both "HSBC Travel One" and "Travel Plus". Should be `t.via === uc.name`.
- **Severity**: Medium (latent).

### 🟡 BUG-50 — "Make This Card Work Better" shows full yearly potential, not incremental upside
- **Where**: `src/features/cardDetail/CardAnalysisFigma.tsx:448`, `compute.ts:potential field`
- **Observed**: `cd.potential = total_savings_yearly`. UI labels it as upside but it's full potential — should be `potential - totalSaved` to show "additional gain available".
- **Severity**: Medium (number is correct in absolute terms but UI copy is misleading).

### 🟡 BUG-51 — Per-card Transactions tab hardcodes filter chip to `["Unaccounted"]` only
- **Where**: `src/features/cardDetail/CardDetailScreen.tsx:516`
- **Observed**: Per-card transactions tab can only filter to Unaccounted, no card-name chips. Inconsistent with the global Transactions screen which supports more chips.
- **Severity**: Medium.

### 🟡 BUG-52 — State-2 Gmail nudge renders twice on Benefits tab
- **Where**: `src/features/cardDetail/CardDetailScreen.tsx:553, 657`
- **Observed**: Two banners with similar copy on the same tab.
- **Severity**: Low (cosmetic / noise).

## Deep audit pass — BestCards table / Compare / Sort

### 🟢 BUG-53 — `BEST_CARDS` includes owned cards (FIXED — filtered via isAlreadyOwnedMarketCard at adapter)
- **Where**: `src/data/simulation/legacy.ts:235, 244` + `metrics.ts:241–289`
- **Observed**: `selectBestCardsListMetrics()` returns all cards from `recommendResponse` and only marks owned ones with `is_owned=true`. CLAUDE.md mandates "never recommend an owned card". `BEST_CARDS_COMB_SAVINGS` then takes top-2 unfiltered — if the user owns one of those top-2, the combined-savings calculation is polluted (recommending a card they already have).
- **Severity**: **Critical** (architectural violation; produces nonsensical recommendations).

### 🟡 BUG-54 — Table "Combined Savings" silent fallback inflates value if `selectPortfolioMetrics` throws
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:97–102`
- **Observed**: Inside `getBC()` the try/catch falls back to `thisCardTotal + onCard0 + onCard1 + onCard2` (naive sum, double-counts buckets). On the happy path uses portfolio best-per-bucket. Inconsistency = latent over-statement when selector errors.
- **Severity**: Medium (safety-net is wrong).

### 🟡 BUG-55 — Sort direction doesn't reset when switching Combined ↔ Category tabs
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:52–54`
- **Observed**: `tableSort` state survives tab switches. User can end up with a stale sort key for a column that doesn't exist in the new tab.
- **Severity**: Medium.

### 🟡 BUG-56 — Table category column headers have no /yr suffix (annual but ambiguous)
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:462–473`
- **Observed**: Header text "Savings on Shopping" without "/yr" — values are annual but user may read as monthly.
- **Severity**: Medium (correctness via labeling).

### 🟡 BUG-57 — Milestone column shows ₹0 indistinguishable from "data missing"
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:88–89`
- **Observed**: `getBestCardDetail(idx)?.milestones || []`. When the card has no milestone data in the recommend response, milestone value is 0 — same display as "card has milestones but they're worth ₹0 on your spend".
- **Severity**: Medium.

### 🟡 BUG-58 — Owned cards have no visual marker in TABLE mode (only in card-list mode)
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:~487–490 (table) vs 508–509 (list)`
- **Observed**: Card-list shows green "Owned" badge on owned-card rows. Table-mode card name cell is identical to market cards — user has to scroll right to the Eligibility column to discover ownership.
- **Severity**: Medium.

### 🟡 BUG-59 — Sort icon has no neutral state (gray triangle = "not sorted" or "sorted asc inactive"?)
- **Where**: `src/features/bestcards/BestCardsScreen.tsx:54–60`
- **Observed**: Both arrows visible always; only color changes. Hard to tell "this column is sorted desc" from "this column hasn't been clicked, default direction".
- **Severity**: Low (UX clarity only).

## Deep audit pass — transaction generation + saved/missed math

> _Several findings here claim very large errors (BUG-60 says 100× inflation). Verify on a single transaction before changing the formula — agent reasoning is plausible but high-impact claims deserve manual reproduction._

### 🟢 BUG-60 — FALSE POSITIVE
> _Verified `getCardRewardForSpend(cardIndex, amount, ...)` and `getBestCardForSpend(amount, ...)` in `mockApi.ts:70, 105` both pro-rate by `amount`. So `wallet.savings` returned to txnScenario IS per-txn. Agent misread the call chain._

### (was) BUG-60
- **Where**: `src/data/simulation/txnScenario.ts:201, 214–215`
- **Observed (per agent)**: `proRate = amt / monthlySpend` is computed but applied only to `market.savings` (line 211), not to `wallet.savings` or `actualSavings`. Result: per-txn `bestWalletSavings` and `actualSavings` carry full monthly rates. For ₹100 txn in ₹10K/mo bucket, `walletDelta` shown is the full monthly delta (e.g. ₹200) instead of the prorated ₹2.
- **Severity**: **Critical IF reproducible**. Verify with one S3 txn before fixing — if the saved/missed numbers in the UI today look reasonable, the agent may be misreading the code path.

### 🔴 BUG-61 — Tag generator excludes market cards from "best card" lookup
- **Where**: `src/data/simulation/legacy.ts:64–71` + `tg()` at line 74
- **Observed**: `bestCardForMap` is built only from owned cards via `getBestCardForBucket`. For S2/S4/S5c brands where a market card beats every wallet card, `bestCardForMap[brand]` still returns the user's best owned card. Tag pill / "use this card" copy points the user to the wrong card.
- **Severity**: **High** (silently misleads optimization guidance).

### 🟢 BUG-62 — S4 "Could Save" (FIXED via WorthAddingBlock — uses marketDelta now)
- **Where**: `src/data/simulation/txnScenario.ts:188, 246`
- **Observed**: S4 routes when `actualSavings === 0 && bestWalletSavings === 0 && bestMarketSavings > 0`. `walletDelta = max(0, 0 − 0) = 0`, but the tag-text path reads `scn.walletDelta`. Result: S4 transactions display "EARN ₹0" instead of the actual market delta.
- **Severity**: **High** (S4 = "no card in your wallet helps; market card would" — exactly the case where the number matters).

### 🟢 BUG-63 — FALSE POSITIVE (`wallet.savings` is already per-txn from `getBestCardForSpend(amount, ...)`)
### (was) BUG-63
- **Where**: `src/data/simulation/txnScenario.ts:215`
- **Observed**: `walletCardRef(wallet.cardIndex, bucket, amt, wallet.savings)` passes full bucket savings; `cardUsed` ref correctly passes `actualSavingsTxn` (line 214). Result: TxnSheet shows "HSBC Travel One: ₹2,000/mo" beside the per-txn line that actually only qualifies for ₹20.
- **Severity**: High.

### 🟢 BUG-64 — NOT A BUG (rate label is monthly-derived but represents a rate, which is correct)
### (was) BUG-64
- **Where**: `src/data/simulation/txnScenario.ts:211`
- **Observed**: `marketCardRef(market.card, bucket, monthlySpend, market.savings)` passes `monthlySpend` as the "amount" parameter the sheet labels with. User sees a monthly figure where they expect the per-txn figure.
- **Severity**: High.

### 🟡 BUG-65 — `missed` set to `walletDelta` for S3 (user already owns the better card)
- **Where**: `src/data/simulation/metrics.ts:170`
- **Observed**: For S3 (user used a non-best owned card; better card is in their wallet), `missed = walletDelta` ≠ 0. Per spec, `missed` should be 0 for in-wallet improvements (it's a "switch", not a "miss"). Showing it as `missed` confuses the savings tally.
- **Severity**: Medium (semantic; may also affect aggregate "missed" totals).

### 🟡 BUG-66 — UPI `missed` set to `null` instead of best-wallet delta
- **Where**: `src/data/simulation/compute.ts:310`
- **Observed**: UPI: `saved=0; missed=null`. Per CLAUDE.md, UPI `missed` should be best-wallet savings prorated (the user could have used a card). Setting `null` hides the opportunity cost.
- **Severity**: Medium.

### 🟢 BUG-67 — Transaction dates hardcoded to Jan-Apr (FIXED — anchored to current real month)
- **Where**: `src/data/simulation/compute.ts:281–282`
- **Observed**: `monthIdx = Math.floor(i / 25)` → 0..3, paired with literal `["Jan","Feb","Mar","Apr"]`. CLAUDE.md says dates should fall in last 12 months. Today is 2026-04-29 — current behavior collides with reality but on any other date, transactions appear stuck in Jan–Apr.
- **Severity**: Medium.

### 🟡 BUG-68 — Ambiguous merchant→bucket map keeps only first match (MakeMyTrip → flights only)
- **Where**: `src/data/simulation/inputs.ts:85–87, 97–105`
- **Observed**: `BUCKET_TO_MERCHANT` lists MakeMyTrip under both flights_annual and hotels_annual. The reverse map (`MERCHANT_TO_BUCKET`) does `if (!(m in map)) map[m] = bucket` — first wins. A MakeMyTrip hotel booking earns the flights rate.
- **Severity**: Medium (silent mis-bucket).

### 🟡 BUG-69 — Unaccounted txn loses card identity → scenario=null, saved/missed=null permanently
- **Where**: `src/data/simulation/compute.ts:348`, `txnScenario.ts:193`, `metrics.ts:163`
- **Observed**: Unaccounted transactions have `card_index: null`. `getTransactionScenario` short-circuits to null. After the user maps the txn (assigns brand + card), there's no recompute path — saved/missed stay null. CatBS-mapped transactions never get scenario data.
- **Severity**: Medium (post-mapping flow incomplete).

### 🟡 BUG-70 — Card cycling logic mixes `cardIdx` and `isUPI` flag (works today, brittle)
- **Where**: `src/data/simulation/compute.ts:213–215, 294, 341`
- **Observed**: Agent walked the code and confirmed it produces correct output today, but the logic relies on `cardIdx===3 → UPI` while also using `isUPI` boolean. Refactoring USER_CARDS to add a 4th card or remove UPI-as-a-card breaks the mapping silently.
- **Severity**: Low (latent fragility).

## Fix order

1. **Step 1** → BUG-2, BUG-3, BUG-6 (smallest, fixes most-visible damage).
2. **Step 2** → BUG-5 (also helps E-row data in BUG-5 caption text).
3. **Step 3** → BUG-4, BUG-10.
4. **Step 4** → BUG-7, BUG-8, BUG-9.
5. **Step 5** → BUG-1 (URL semantics).
