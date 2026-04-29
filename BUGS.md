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

## Fix order

1. **Step 1** → BUG-2, BUG-3, BUG-6 (smallest, fixes most-visible damage).
2. **Step 2** → BUG-5 (also helps E-row data in BUG-5 caption text).
3. **Step 3** → BUG-4, BUG-10.
4. **Step 4** → BUG-7, BUG-8, BUG-9.
5. **Step 5** → BUG-1 (URL semantics).
