# Data Point Audit — Spend Analyser MVP

## Context

Every screen in the app currently uses hardcoded/mock data. This audit maps every user-visible data element to its real data source so we can replace hardcoded values with live computed values.

**Data architecture (confirmed with product):**
- **User's cards**: 3x `/calculate` calls (one per card: HSBC Travel One, Axis Flipkart, HSBC Live+) with the user's spend profile. Returns identical `spending_breakdown` structure per card.
- **Market recommendations**: 1x `/recommend_cards` call. Returns top N market cards ranked by net savings.
- **Transaction data**: SMS/Gmail parsing gives per-transaction card assignment, amounts, merchants, dates.
- **Reward points/statements**: From bank statements (Gmail parsing or manual entry).

**Key formulas (confirmed):**
- **Current Savings** = Sum(savings from whichever card user actually used per bucket) — requires SMS-parsed card-to-bucket mapping
- **Optimized Savings** = Sum(max savings across user's 3 cards per bucket) — from 3x /calculate responses
- **Ultimate Savings** = Sum(max savings across 3 cards + #1 recommended per bucket) — from /calculate + /recommend_cards
- **Match Score** = App-computed, based on how well card covers user's top spending buckets
- **Total Accounted Spends** = Sum of parsed transactions = sum of API input amounts x 12

---

## Screen 1: Home Dashboard
**Files**: `LegacyHomeScreen.tsx`, `LegacyShared.tsx` (HeroSection, SpendAnalysis, TransactionAnalysis, ImportantActions, ToolsSection, TransactionsPreview, CardPromo)

### Section: Hero (LegacyShared.tsx:619-725)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 1 | Card names (3 cards) | "Axis Flipkart", "HSBC Travel One", "HSBC Live+" | APP_COMPUTED | `getCardDisplayName(i)` -- masked/mapped/full based on state. Real names from card identification (SMS/Gmail parsing + user mapping) | In State 1: masked as "HSBC ..7891" |
| 2 | Card art images | 3 hardcoded PNGs | API_DIRECT + STATIC | `/calculate` response doesn't return images. `/recommend_cards` returns `image` URL. For user's own cards: need a local card-to-image mapping or fetch from CardGenius `image` field | Currently hardcoded paths in `cardArtByIndex[]` |
| 3 | Card count | 3 | APP_COMPUTED | Count of user's identified/added cards | Currently fixed at 3 from `CARDS` array |
| 4 | "You're missing out on Rs.90,000" | Rs.90,000 | APP_COMPUTED | `Ultimate Savings - Current Savings`. Ultimate = Sum max(savings across 3 owned + #1 recommended) per bucket. Current = Sum savings from actual card used per bucket | Hardcoded in LegacyShared.tsx:700 |
| 5 | "You saved Rs.20,000/yr" | Rs.20,000/yr | APP_COMPUTED | Current Savings = Sum(savings from card user actually used per bucket) across all buckets x 12. Requires SMS-parsed card-to-bucket assignment | Hardcoded in LegacyShared.tsx:707 |
| 6 | "You could save Rs.1,10,000/yr" | Rs.1,10,000/yr | APP_COMPUTED | Ultimate Savings = Sum max(savings across 3 cards + #1 recommended) per bucket x 12 | Hardcoded in LegacyShared.tsx:711 |
| 7 | PARTIAL badge | "PARTIAL" | APP_COMPUTED | Shows when `isState1` -- card not yet identified | Driven by localStorage `sa:hasGmail` / `sa:mappingCompleted` |

### Section: Transaction Analysis (LegacyShared.tsx:296-317)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 8 | Bar 1: "Current savings" | Rs.10,845/yr | APP_COMPUTED | Sum(savings from card actually used per bucket) x 12. Same as hero "You saved" | Hardcoded |
| 9 | Bar 2: "If cards used right" | Rs.40,845/yr | APP_COMPUTED | Optimized Savings = Sum max(savings across user's 3 cards) per bucket x 12. From 3x /calculate responses | Hardcoded |
| 10 | Bar 3: "With the ultimate card" | Rs.1,00,845/yr | APP_COMPUTED | Ultimate Savings = Sum max(savings across 3 cards + #1 recommended) per bucket x 12 | Hardcoded |

### Section: Spend Analysis (LegacyShared.tsx:327-416)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 11 | Total Accounted Spends | Rs.15,40,250 | APP_COMPUTED | Sum of all parsed transaction amounts from SMS/Gmail. Equivalent to Sum(API input values) x 12 | Hardcoded in LegacyShared.tsx:385 |
| 12 | Category breakdown (7 rows) | Shopping 44% Rs.6,77,710, Groceries 20% Rs.3,08,050, etc. | APP_COMPUTED | Group all parsed transactions by category -> sum amounts -> compute percentages. Categories assigned via merchant-to-category mapping | All 7 rows hardcoded in LegacyShared.tsx:328-334 |
| 13 | Brand breakdown (7 rows) | Amazon 28% Rs.4,31,270, Flipkart 19%, etc. | APP_COMPUTED | Group all parsed transactions by merchant brand -> sum amounts -> compute percentages | All 7 rows hardcoded in LegacyShared.tsx:338-344 |

### Section: Important Actions (LegacyShared.tsx:253-265)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 14 | Action: "Credit Limit Reached" | Hardcoded text | APP_COMPUTED + API_DIRECT | Credit limit = from bank statement/user input. Usage = sum of current month's transactions on that card. Alert triggers when usage > threshold % | Hardcoded in LegacyShared.tsx:258 |
| 15 | Action: "Dining rewards maxed out" | Hardcoded text | API_DIRECT + APP_COMPUTED | `spending_breakdown[dining].maxCapReached` from /calculate tells you the cap exists. App must track monthly usage against `maxCap` value | Hardcoded |
| 16 | Action: "5,000 points expiring" | Hardcoded text | APP_COMPUTED | Points balance + expiry date from bank statements (Gmail parsing). API has no knowledge of user's point balance | Hardcoded. Points balance = UNKNOWN source until statement parsing built |
| 17 | Action: "Spend Rs.8,000 more to waive annual fee" | Hardcoded text | API_DIRECT + APP_COMPUTED | API gives `annual_fee_spends` (waiver threshold). App tracks YTD spend on card. Delta = threshold - YTD spend | Hardcoded |
| 18 | Action count badge | "10" | APP_COMPUTED | Count of active actions based on state filtering | Hardcoded in LegacyShared.tsx:256 |

### Section: Transactions Preview (LegacyHomeScreen.tsx:61, LegacyShared.tsx:427-593)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 19 | Transaction merchant name | "Flipkart", "Amazon", etc. | APP_COMPUTED | Extracted from SMS/Gmail transaction parsing. Merchant identification from transaction text | Currently from mock `ALL_TXNS` array |
| 20 | Transaction amount | Rs.500-Rs.5,000 range | APP_COMPUTED | Extracted from SMS/Gmail transaction parsing | Mock amounts from fixed pool |
| 21 | Transaction card used | "Axis Flipkart | 27 Jan" | APP_COMPUTED | Card identification from SMS sender/content or Gmail statement matching | Mock cycling through 4 cards |
| 22 | Transaction saved amount | "Rs.15", "Rs.80", etc. | API_COMPUTED | For the card actually used: `spending_breakdown[bucket].savings x (txn_amt / bucket_total_monthly_spend)`. Pro-rate the bucket savings to individual transaction | Mock from fixed pool [5,10,15,0,25...150] |
| 23 | Transaction missed amount | "Rs.10"-"Rs.30" | API_COMPUTED | Difference between best-card savings and actual-card savings for that bucket, pro-rated to transaction amount | Mock from [10,15,20,25,30] |
| 24 | Transaction tag/CTA | "Best card for this brand", "Use Axis Flipkart -- saves Rs.15" | API_COMPUTED | Compare actual card's savings vs best card's savings per bucket. If actual = best -> "Best card". If not -> "Use {best_card} -- saves Rs.{delta}" | Generated by `tg()` function from mock data |
| 25 | Filter chips | "Unaccounted", "via Axis Flipkart Card", etc. | APP_COMPUTED | Chip labels from identified card names. State 1: only "Unaccounted" | Dynamic based on card identification state |
| 26 | Unaccounted transaction SMS text | Raw SMS content | APP_COMPUTED | Original SMS text that couldn't be parsed/categorized | Mock SMS in `ALL_TXNS` |

### Section: Card Promo (LegacyShared.tsx:319-325)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 27 | Promo card image | amex-promo-banner.png | API_DIRECT | `/recommend_cards` response -> `savings[0].image` or `card_bg_image` | Hardcoded to Amex |
| 28 | Promo savings text | "save up to Rs.1,00,845/year" | API_COMPUTED | `savings[0].total_savings_yearly` from /recommend_cards response (top recommended card's annual savings) | Hardcoded in alt text |

---

## Screen 2: Transactions
**File**: `LegacyTransactionsScreen.tsx` (99 lines)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 29 | Full transaction list | 100 mock transactions | APP_COMPUTED | All parsed transactions from SMS/Gmail. Each has: merchant, amount, date, card used | From `ALL_TXNS` mock array |
| 30 | Date group headers | "1 APR - TODAY", "1 MAR - 1 APR", etc. | APP_COMPUTED | Group transactions by month from parsed dates | Generated from mock dates |
| 31 | Per-txn saved/missed amounts | Same as #22/#23 | API_COMPUTED | Same per-transaction savings computation | Same mock source |
| 32 | Per-txn card name | Dynamic via `getCardDisplayName()` | APP_COMPUTED | Card identification state determines display format | State-dependent |
| 33 | Per-txn recommendation tags | Same as #24 | API_COMPUTED | Same tag logic | Same mock source |
| 34 | Sort options | "Recent", "Most Saved", "Most Spent", etc. | STATIC | Fixed sort criteria labels | State 1 hides "Most Saved"/"Least Saved" |
| 35 | Filter categories | Shopping, Groceries, Bills, etc. (11) | STATIC | Fixed category list | Labels are static |
| 36 | Filter brands | Flipkart, Amazon, Swiggy, etc. (12) | APP_COMPUTED | Distinct merchant brands from parsed transactions | Currently hardcoded list |

---

## Screen 3: Optimize
**File**: `LegacyOptimiseScreen.tsx` (773 lines)

### Section: Hero (OptHero, lines 97-135)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 37 | "You can save upto Rs.90,000/yr" | Rs.90,000/yr | APP_COMPUTED | Ultimate Savings (Bar 3) = Sum max(savings across 3 cards + #1 recommended) per bucket x 12 | Hardcoded line 110 |
| 38 | Bar 1: Current Savings | Rs.20,000 | APP_COMPUTED | Sum(savings from card actually used per bucket) x 12 | Hardcoded line 116 |
| 39 | Bar 2: Spends Optimized | Rs.50,000 | APP_COMPUTED | Sum max(savings across user's 3 cards) per bucket x 12 | Hardcoded line 117 |
| 40 | Bar 3: Optimized + Ultimate | Rs.90,000 | APP_COMPUTED | = #37 | Hardcoded line 118 |
| 41 | Bar labels | "Current Savings", "Spends Optimized", "Optimized + Ultimate Card" | STATIC | Fixed labels | Line 124 |

### Section: Here's How (lines 186-238)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 42 | "Get the ultimate credit card" save | Rs.90,000/yr | APP_COMPUTED | Same as #37 (Ultimate Savings) | Hardcoded line 206 |
| 43 | "Use existing cards right" save | Rs.40,000/yr | APP_COMPUTED | Optimized minus Current = Bar 2 - Bar 1. This is the reallocation gain from switching cards per bucket | Hardcoded line 207. Should be Rs.50,000-Rs.20,000=Rs.30,000? Or is it Bar 2 value? **AMBIGUITY** |
| 44 | "Claim and Redeem expiring benefits" | "Extra Savings" | APP_COMPUTED | Sum of: unclaimed welcome benefits + redeemable points value + milestone benefits near threshold. From statement parsing + API `milestone_benefits`, `welcomeBenefits` | Hardcoded as badge text |

### Section: Card Optimizations (lines 244-276)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 45 | Recommended ultimate card name | "SWIGGY BLCK" | API_DIRECT | `savings[0].card_name` from /recommend_cards (highest ROI card) | Hardcoded. Should come from API top result |
| 46 | Recommended card bank | "HDFC BANK" | API_DIRECT | `savings[0].bank_name` | Hardcoded |
| 47 | Recommended card image | swiggy-blck-card.webp | API_DIRECT | `savings[0].image` or `card_bg_image` | Hardcoded local asset |
| 48 | "SAVE UPTO Rs.90,000/yr" | Rs.90,000/yr | APP_COMPUTED | Same as #37 | Hardcoded line 265 |

### Section: Spend Distribution (lines 352-400)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 49 | Total yearly spend | Rs.16,00,000/yr | APP_COMPUTED | Sum of all parsed transactions x annualization factor. Or: Sum(API input values) x 12 | Hardcoded line 382 |
| 50 | Segment percentages (with ultimate) | 50%, 25%, 12%, 13% | APP_COMPUTED | For each card (3 owned + ultimate), compute what % of total spend should be routed to it for optimal savings. Per bucket: assign to card with max savings -> sum assigned spend per card -> divide by total | Hardcoded line 356 |
| 51 | Segment percentages (without ultimate) | 38%, 32%, 18%, 12% | APP_COMPUTED | Same as above but only across user's 3 owned cards | Hardcoded line 357 |
| 52 | Card spend amounts (with ultimate) | Rs.8L, Rs.4L, Rs.2L, Rs.2L | APP_COMPUTED | Sum of bucket spends assigned to each card in optimal allocation | Hardcoded lines 361-364 |
| 53 | Card savings amounts | Rs.50K, Rs.50K, Rs.10K, Rs.10K | APP_COMPUTED | Sum of `spending_breakdown[bucket].savings` for buckets assigned to each card | Hardcoded lines 361-364 |
| 54 | Card category assignments | "Bills, Food Ordering, Dining", "Shopping", etc. | APP_COMPUTED | Which spending categories are optimally assigned to which card | Hardcoded |
| 55 | "Save Extra Rs.50,000" toggle | Rs.50,000 | APP_COMPUTED | Ultimate Savings - Optimized Savings = gain from adding the recommended card | Hardcoded line 377 |

### Section: Cards Usage -- Category Panel (lines 490-547)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 56 | Shopping: card to use | "Axis Flipkart" | API_COMPUTED | For `flipkart_spends` bucket: compare savings across 3x /calculate responses -> pick highest | Hardcoded |
| 57 | Shopping: reward rate | "5% Cashback" | API_DIRECT | `spending_breakdown[flipkart_spends].savings / spend x 100` or from `explanation` field | Hardcoded |
| 58 | Shopping: optimal spend amount | Rs.5,40,000 | APP_COMPUTED | Sum of all shopping-category bucket spends x 12 that should be routed to this card | Hardcoded line 525 |
| 59 | Shopping: spend distribution bar | 81% / 19% | APP_COMPUTED | % of shopping spend going to primary vs secondary card | Hardcoded lines 541-542 |

---

## Screen 4: Card Detail
**File**: `CardDetailScreen.tsx` (543 lines)

### Section: Header (lines 98-135)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 60 | Bank name | "HSBC BANK", "AXIS BANK" | USER_INPUT + STATIC | From `SEMI_CARDS[ci].bank` -- identified during onboarding/card mapping | Static from mock data |
| 61 | Card name | Dynamic via `getCardDisplayName(ci)` | APP_COMPUTED | State-dependent display | Dynamic |
| 62 | Card quality badge | "Good card" / "Average card" | UNKNOWN | `CARDS[ci].quality` -- currently hardcoded. **No clear API source.** Could be derived from card's ROI rank vs market? | Hardcoded in cards.ts. Needs product decision |
| 63 | Last 4 digits | "XXXX 7891" | USER_INPUT | From SMS parsing or manual entry during card identification | From `CARDS[ci].last4` |

### Section: Tab 0 -- Card Analysis (lines 202-340)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 64 | Reward Points balance | 3,200 | APP_COMPUTED | From bank statement parsing (Gmail) or manual entry. API has NO knowledge of point balance | Hardcoded in cards.ts `availPts: 3200` |
| 65 | "+1,240 Earned in last 30 days" | +1,240 | APP_COMPUTED | Sum of `spending_breakdown[*].points_earned` from /calculate for this card, filtered to last 30 days of transactions | Hardcoded line 211 |
| 66 | "600 Points Expiring In 3 Days" | 600 pts, 3 days | APP_COMPUTED | From bank statement/email parsing -- expiry notices in emails | Hardcoded line 217-218 |
| 67 | Total Saved/Earned on card | `cd.totalSaved` | API_COMPUTED | Sum `spending_breakdown[*].savings` x 12 from /calculate for this card. If points: raw RP count. If cashback: Rs. amount | From mock `CD[ci].totalSaved` |
| 68 | Time period filter | "Last 365 Days" | USER_INPUT | User-selected time window | Dynamic from state |
| 69 | Category/Brand bar chart (8 items) | Shopping Rs.7,800 saved, Dining Rs.5,250, etc. | APP_COMPUTED | Group this card's transactions by category/brand -> sum saved amounts per group. Saved per txn = pro-rated bucket savings | From mock `CD[ci].categories` / `CD[ci].brands` |
| 70 | Category/Brand list (10 items) | Same data as bars, with spend + saved per item | APP_COMPUTED | Same as #69 | From mock data |

### Section: Tab 1 -- Transactions (card-specific)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 71 | Card-specific transactions | Filtered `ALL_TXNS` by card | APP_COMPUTED | All parsed transactions where this card was used | Mock filtered by `t.via.includes(uc.name)` |
| 72 | Per-txn "Best card for this brand" tag | Dynamic | API_COMPUTED | Compare this card's bucket savings vs best card's savings. `missedAmt = Math.round(t.amt * 0.03)` is hardcoded -- should use actual delta | Line 89: missed = `Math.round(t.amt * 0.03)` is **HARDCODED 3%**. Should be `(bestCard.savings - thisCard.savings) / bucket_spend x txn_amt` |

### Section: Tab 2 -- Benefits (from `CD[ci]`)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 73 | Welcome benefit description | "1000 Reward Points worth Rs.300" | API_DIRECT | `/calculate` or `/recommend_cards` -> `welcomeBenefits[].voucher_bonus`, `cash_value`, `brands[].name` | From mock `CD[ci].welcome` |
| 74 | Welcome benefit claim status | "Claimed" / "Not yet" | APP_COMPUTED | Compare user's spend in first N days vs `welcomeBenefits[].minimum_spend`. Requires transaction history + card activation date | Hardcoded in mock CD data |
| 75 | Milestone rewards (3 tiers) | "Spend Rs.2.5L -> Rs.600", "Rs.5L -> Rs.1,200", "Rs.7.5L -> Rs.1,200" | API_DIRECT | `milestone_benefits[].minSpend`, `voucherBonus`, `brand` | From mock CD data |
| 76 | Milestone progress/status | "Claimed" / "Rs.48,000 to go" / "Locked" | APP_COMPUTED | `milestone_benefits[].minSpend` from API minus YTD spend on this card (from transaction sum). API gives thresholds, app tracks progress | Hardcoded status in mock |
| 77 | Lounge access details | "2 domestic/quarter, 1 international/quarter" | API_DIRECT | `travel_benefits.domestic_lounges_unlocked`, `international_lounges_unlocked` from /calculate response | From mock CD data |
| 78 | Lounge visits used | "1 of 2 used" | APP_COMPUTED | From bank statements -- lounge visit emails/SMS. API has no knowledge of usage | Hardcoded in mock |
| 79 | Credit limit total | Rs.2,00,000 | APP_COMPUTED | From bank statement parsing or manual entry. API does NOT return credit limits | Hardcoded in mock CD data |
| 80 | Credit limit used | Rs.53,000 | APP_COMPUTED | Sum of current billing cycle transactions on this card | Hardcoded |
| 81 | Credit utilization % | 27% | APP_COMPUTED | `credit_used / credit_total x 100` | Computed from hardcoded values |

### Section: Tab 3 -- Fees (from `CD[ci]`)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 82 | Annual fee | "Rs.500 + GST" | API_DIRECT | `annual_fees` from /calculate response. Also `annual_fee_text` | From mock CD data |
| 83 | Fee waiver threshold | "Spend Rs.1,50,000 to waive" | API_DIRECT | `annual_fee_spends` from API response | From mock |
| 84 | Fee waiver progress | "Rs.1,12,000 spent" / "Waived" | APP_COMPUTED | YTD spend on this card vs `annual_fee_spends` threshold | Hardcoded status |
| 85 | Fee waiver days remaining | "50 DAYS LEFT" | APP_COMPUTED | Card anniversary date minus today. Anniversary = card activation date + 365 days. From statement/user input | Hardcoded |
| 86 | Bank fees table (9 items) | Forex 3.50%, APR 3.75%, etc. | API_DIRECT | Not in current /calculate response. Would need a separate card-details endpoint or static mapping | From mock `BANK_FEES` data |
| 87 | Late fees table (6 tiers) | Rs.0-100: Rs.0, Rs.101-500: Rs.100, etc. | API_DIRECT | Same -- not in /calculate response | From mock `LATE_FEES` data |

### Section: Important Actions (card-specific, lines 156-182)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 88 | Card-specific actions | Filtered from `CD[ci].actions` | APP_COMPUTED + API_DIRECT | Same source as home actions #14-17, filtered to this card | From mock CD data |

---

## Screen 5: Best Cards For You
**File**: `BestCardsScreen.tsx` (473+ lines)

### Section: Card List (BEST_CARDS array, lines 38-83)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 89 | Card name | "HDFC Infinia", "IDFC First Classic", etc. | API_DIRECT | `savings[].card_name` from /recommend_cards | Currently 20 hardcoded cards in BEST_CARDS array |
| 90 | Bank name | "HDFC Bank", "IDFC First Bank", etc. | API_DIRECT | `savings[].bank_name` | Hardcoded |
| 91 | Annual fee | Rs.0-Rs.10,000 | API_DIRECT | `savings[].annual_fees` (string with GST) or `annual_fee_without_gst` (number) | Hardcoded |
| 92 | Estimated savings | Rs.42,000-Rs.150,000 | API_DIRECT | `savings[].total_savings_yearly` | Hardcoded -- varies wildly from API values |
| 93 | Match score (%) | 65%-98% | APP_COMPUTED | Based on how well card covers user's top spending buckets. Formula TBD -- could be: (card's savings on user's top 5 buckets) / (best possible savings on those buckets) x 100 | **FORMULA NOT FINALIZED.** Hardcoded per card. API has `rating` (1-5) but that's editorial, not personalized |
| 94 | Category tag amounts | Shopping Rs.10K, Travel Rs.8K, etc. | API_COMPUTED | From `spending_breakdown[bucket].savings x 12` for relevant buckets on this card | Hardcoded per card |
| 95 | Highlights (3 per card) | "3.3% reward rate via SmartBuy", etc. | API_DIRECT | `product_usps[].header` + `description` from /recommend_cards | Hardcoded -- API has `product_usps` array |
| 96 | Filter tags | "Eligible Cards", "Lifetime Free", "FD backed", "Invite Only" | API_DIRECT + APP_COMPUTED | `invite_only` flag from API. "Lifetime Free" = `annual_fees == "0"`. "FD backed" = needs product mapping. "Eligible" = needs eligibility check | Hardcoded per card |
| 97 | Combined savings (top 2) | Rs.100,000 | APP_COMPUTED | Not clear formula. Currently hardcoded as `combSavings=100000` | Line 88. **NEEDS PRODUCT DECISION** |

### Section: Card Detail (lines 91-200+)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 98 | Net annual savings | `card.savings - card.annualFee` | API_COMPUTED | `total_savings_yearly - annual_fee_without_gst` from /recommend_cards | Computed from hardcoded values |
| 99 | Usage advice / Replace card suggestion | "Replace your HSBC Live+ with this card and save Rs.61,900" | APP_COMPUTED | Compare this card's total savings vs user's worst card's savings. Delta = recommended savings - worst card savings | Hardcoded in `CARD_DET` object. `replaceSave` per card |
| 100 | Comparison bar chart (this card vs 3 user cards) | This card Rs.150K, Axis Rs.80K, HSBC Travel Rs.50K, HSBC Live Rs.45K | API_COMPUTED | This card's savings from /recommend_cards. User cards' savings from 3x /calculate responses (`total_savings_yearly`) | Hardcoded in lines 137-141. User card values should come from /calculate |
| 101 | Brand fit table (spend, rate, savings per brand) | Amazon 3.3% Rs.4,950, Flipkart 3.3% Rs.3,300, etc. | API_DIRECT | From `spending_breakdown[bucket].savings`, `spend`, and rate derivation per bucket | Hardcoded in `brandFit` arrays |
| 102 | "Total savings you could earn" | Computed from brandFit | API_COMPUTED | Sum `spending_breakdown[*].savings x 12` from this card's /recommend_cards response | Computed from hardcoded brandFit |
| 103 | Why good / Why not lists | 3-4 bullet points each | API_DIRECT + STATIC | `product_usps` from API gives positive USPs. "Why not" = editorial content, not in API | Hardcoded. Why not = UNKNOWN source |
| 104 | Welcome benefits | "5000 Reward Points worth Rs.1,250" | API_DIRECT | `welcomeBenefits[].voucher_bonus`, `cash_value`, `brands[].name` | Hardcoded. API has this data |
| 105 | Milestone rewards | "10,000 Points at Rs.8L spend" | API_DIRECT | `milestone_benefits[].minSpend`, `voucherBonus`, `rpBonus`, `brand` | Hardcoded. API has this data |
| 106 | Lounge access details | "Unlimited airport lounge access" | API_DIRECT | `travel_benefits.domestic_lounges_unlocked`, `international_lounges_unlocked` | Hardcoded. API has travel_benefits |
| 107 | Fees (annual, joining, waiver) | "Rs.10,000 + GST", "Spend Rs.10L to waive" | API_DIRECT | `annual_fees`, `joining_fees`, `annual_fee_spends`, `annual_fee_waiver_toggle` | Hardcoded in CARD_DET. API has all these fields |
| 108 | Bank fees / Late fees tables | Forex 2%, APR 3.49%, etc. | UNKNOWN | Not in /recommend_cards response. Would need separate endpoint or static card data | Hardcoded. **GAP: No API source for bank fees/late fees** |
| 109 | "How to apply" steps | 3-4 steps per card | STATIC | Editorial content, not from API | Hardcoded |
| 110 | CashKaro/Network URLs | Apply links | API_DIRECT | `cg_network_url`, `ck_store_url` from /recommend_cards | Hardcoded. API provides these |

---

## Screen 6: Actions
**File**: `ActionsScreen.tsx` (188 lines)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 111 | Action: "Credit Limit Reached" | Axis Flipkart, cap type | APP_COMPUTED | Credit limit from statement. Current usage from transaction sum. Alert when usage > threshold | Hardcoded in ACTIONS_DATA line 21 |
| 112 | Action: "Dining rewards maxed out" | HSBC Travel One | API_DIRECT + APP_COMPUTED | `maxCapReached` from /calculate + monthly tracking | Hardcoded |
| 113 | Action: "All rewards maxed out" | Axis Flipkart | API_DIRECT + APP_COMPUTED | `totalMaxCap` exhausted -- track total RP/cashback earned vs `totalMaxCap` | Hardcoded |
| 114 | Action: "Travel rewards maxing out soon" | HSBC Travel One | API_DIRECT + APP_COMPUTED | `maxCap` for travel buckets nearly reached. App tracks monthly progress | Hardcoded |
| 115 | Action: "Spend Rs.4,200 more to waive Annual Fee" | Rs.4,200, "50 DAYS LEFT" | API_DIRECT + APP_COMPUTED | `annual_fee_spends` from API minus YTD spend. Days = card anniversary minus today | Hardcoded |
| 116 | Action: "5,000 points worth Rs.1,500 expiring" | 5,000 pts, Rs.1,500, "IN 30 DAYS" | APP_COMPUTED | Points balance + expiry from bank emails. Value = points x best `conv_rate` from `redemption_options` | Hardcoded. Points data from statements |
| 117 | Action: "Annual Fee payment approaching in 30 days" | 30 days | APP_COMPUTED | Card anniversary date minus today | Hardcoded |
| 118 | Tab filter counts | Per-tab action counts | APP_COMPUTED | Count actions by type after state filtering | Dynamic |

---

## Screen 7: Calculator
**File**: `CalcScreen.tsx` (519 lines)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 119 | Brand list by category | 120+ brands across 13 categories | STATIC + API_DIRECT | Brand/category mapping is static. Reward rates per brand come from /calculate `spending_breakdown` | Currently from mock `CALC_BRANDS` in calculator.ts |
| 120 | Calc result: savings per card | "Rs.100 -> 2RP Save Rs.100" | API_DIRECT | Call /calculate with single-bucket spend -> read `spending_breakdown[bucket].savings`, `points_earned`, `conv_rate` | Currently from mock `CALC_CARDS` rates |
| 121 | Wallet card results (user's cards) | HSBC Travel One Rs.100, HSBC Live+ Rs.75 | API_DIRECT | From 3x /calculate with the entered amount in the selected bucket | Hardcoded in lines 73-76 |
| 122 | Market card results | Amex Rs.400, IndusInd Rs.350, Rs.300 | API_DIRECT | From /recommend_cards spending_breakdown for the selected bucket | Hardcoded in lines 77-81 |
| 123 | CashKaro cashback % | 2% | STATIC | CashKaro platform cashback rate -- not from CardGenius API | Hardcoded line 83. Need CashKaro API or static config |
| 124 | Limits & Caps tracking section | Card limit Rs.1,20,000, Reward cap Rs.30,000, etc. | API_DIRECT + APP_COMPUTED | `maxCap`, `totalMaxCap` from /calculate. Usage tracking is APP_COMPUTED from transaction sums | Hardcoded lines 148-264. API has cap values, app tracks progress |
| 125 | "How to earn" explanation text | Card-specific earning rules | API_DIRECT | `spending_breakdown[bucket].explanation[].explanation` HTML from /calculate | Hardcoded in `howToEarn` object |

---

## Screen 8: Redeem
**File**: `RedeemScreen.tsx` (100+ lines)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 126 | Card point names | "Reward Points" / "Cashback" | API_DIRECT + STATIC | Not in /calculate response directly. Derived from `savings_type` ("points" vs "cashback") | From mock `REDEEM_DATA` |
| 127 | Point value (Rs./pt) | Rs.0.30/pt (HSBC), Rs.1/pt (Axis, HSBC Live+) | API_DIRECT | `spending_breakdown[*].conv_rate` from /calculate. Or: `redemption_options[].conversion_rate` from /recommend_cards | Hardcoded in REDEEM_DATA |
| 128 | Redemption partners & rates | Air Miles Rs.0.50/pt, Amazon Rs.0.30/pt, etc. | API_DIRECT | `redemption_options[]` from /recommend_cards: `method`, `brand`, `conversion_rate`, `min_points` | Hardcoded. API has full `redemption_options` array |
| 129 | Recommended redemption option | "Air Miles" for HSBC | API_DIRECT | `recommended_redemption_options[]` from /recommend_cards | Hardcoded. API has this field |
| 130 | Redemption steps | "Login to HSBC Online -> Cards -> Rewards..." | STATIC | Editorial content -- not from API | Hardcoded per partner |
| 131 | "How to check balance" URL | "HSBC India App -> Credit Cards -> ..." | STATIC | App-specific instructions, not from API | Hardcoded |
| 132 | Points balance | User input field | USER_INPUT | User enters current point balance manually, or parsed from bank statement | Input field |
| 133 | Market card redemption options | HDFC Infinia Rs.0.50/PT, Amex Rs.0.50/PT, etc. | API_DIRECT | `redemption_options` from /recommend_cards for market cards | Hardcoded in `MARKET_CARDS` |

---

## Screen 9: Card Detail -- Per-Bucket Breakdown (data files)
**Files**: `src/data/cardDetail.ts`, `src/data/spend.ts`, `src/data/optimize.ts`

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 134 | Per-brand spend + saved (CD_BRANDS, 20 items) | Amazon Rs.32K/Rs.6K, Swiggy Rs.18K/Rs.4K, etc. | APP_COMPUTED + API_DIRECT | Spend = sum of transactions per merchant. Saved = pro-rated `spending_breakdown[bucket].savings` from /calculate | All hardcoded in cardDetail.ts |
| 135 | Per-category spend + saved (CD_CATS, 20 items) | Shopping Rs.52K/Rs.7.8K, Dining Rs.35K/Rs.5.25K | APP_COMPUTED + API_DIRECT | Same derivation, grouped by category instead of brand | All hardcoded |
| 136 | SPEND_BRANDS (50 brands, amounts + txn counts) | Amazon Rs.195K/86 txns, Flipkart Rs.142K/72 txns | APP_COMPUTED | Group all transactions by merchant -> sum amounts, count transactions | All hardcoded in spend.ts |
| 137 | SPEND_CATS (10 categories, amounts + txn counts) | Shopping Rs.385K/142 txns, Groceries Rs.248K/96 txns | APP_COMPUTED | Group all transactions by category -> sum amounts, count | All hardcoded in spend.ts |
| 138 | OPT_BRANDS (7 brands, optimization data) | Amazon Rs.50K best=HSBC Live+ 1.5%, Flipkart Rs.45K best=Axis 5% | API_COMPUTED | For each brand/bucket: compare savings across 3x /calculate -> pick best -> show rate and savings | All hardcoded in optimize.ts |

---

## Screen 10: Profile
**File**: `ProfileScreen.tsx` (79 lines)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 139 | Member since | "Jan 2025" | APP_COMPUTED | User's registration/first-transaction date | Hardcoded line 33 |
| 140 | Cards count | `CARDS.length` (3) | APP_COMPUTED | Count of identified cards | Dynamic |
| 141 | "Saved Rs.50K" | Rs.50K | APP_COMPUTED | Same as Current Savings (#5) -- Sum savings from actual card usage | Hardcoded line 37 |
| 142 | Transaction count | "100" | APP_COMPUTED | Count of all parsed transactions | Hardcoded line 38 |
| 143 | Sync status items | "Active", "Connected", "Not Connected" | APP_COMPUTED | SMS permission status, Gmail connection status, notification status | Hardcoded statuses |
| 144 | Cache size | "12MB" | APP_COMPUTED | Local storage/cache size | Hardcoded line 24 |
| 145 | Last sync time | "2 min ago" | APP_COMPUTED | Timestamp of last SMS/Gmail sync | Hardcoded |

---

## Screen 11: Building (Onboarding Loader)
**File**: `BuildingScreen.tsx` (354 lines)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 146 | Semi-card details | HSBC ..7891, Axis ..4521, HSBC ..3364 | APP_COMPUTED | From SMS parsing -- bank name + last 4 digits identified from transaction SMS patterns | Hardcoded in building screen lines 42-44 |
| 147 | Sample transactions (5) | Amazon Rs.3,500 saved Rs.80, Flipkart Rs.2,800 saved Rs.140 | APP_COMPUTED | First few parsed transactions, with savings computed from /calculate | Hardcoded lines 46-52 |
| 148 | "Saving 70% less than what you could" | 70% | APP_COMPUTED | `1 - (Current Savings / Ultimate Savings)` | Hardcoded line 219 |
| 149 | Saving efficiency | 30% | APP_COMPUTED | `Current Savings / Ultimate Savings x 100` | Hardcoded |
| 150 | You saved / Could save | Rs.50,000 / Rs.1,50,000 | APP_COMPUTED | Same as #5 and #6 computation | Hardcoded lines 220-221 |
| 151 | Action reminders (3) | "4,820 pts expiring", "30% credit limit left", "Reward cap on dining" | APP_COMPUTED | Same sources as Actions screen #111-117 | Hardcoded lines 306-316 |

---

## Bottom Sheets (BottomSheets.tsx)

### TxnSheet -- Transaction Detail

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 152 | Brand name + icon | From transaction data | APP_COMPUTED | Parsed from SMS/Gmail | Dynamic |
| 153 | "You Spent" amount | Transaction amount | APP_COMPUTED | From parsed transaction | Dynamic |
| 154 | Card used + cashback rate | "Axis Flipkart", "5% CASHBACK" | APP_COMPUTED + API_DIRECT | Card from transaction parsing. Rate from `spending_breakdown[bucket]` | Rate currently hardcoded per card |
| 155 | Amount saved | Rs.{saved} | API_COMPUTED | Pro-rated bucket savings for this transaction amount | From transaction mock data |
| 156 | Better wallet card + rate | "HSBC Live+", "1.5% CASHBACK" | API_COMPUTED | Compare savings across 3x /calculate for this bucket -> show best alternative | Hardcoded |
| 157 | "Could Save" wallet | `txnSheet.missed` or `amt x 0.05` | API_COMPUTED | Best alternative card savings - actual card savings, for this transaction. Currently **HARDCODED 5% fallback** | Line: `couldSaveWallet = txnSheet.missed || Math.round(txnSheet.amt * 0.05)` |
| 158 | Market best card + rate | "HDFC Infinia", "3.3%" | API_DIRECT | Top card from /recommend_cards for this bucket | Hardcoded |
| 159 | "Could Save" market | `amt x 0.10` | API_COMPUTED | Market-best card savings - actual card savings. Currently **HARDCODED 10%** | `Math.round(txnSheet.amt * 0.1)` is hardcoded |

### ActSheet -- Action Detail

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 160 | Action urgency | "In X Days -- Act now" | APP_COMPUTED | Days until expiry/deadline from parsed dates | From mock action data |
| 161 | "Why this matters" copy | Type-specific explanation | STATIC | Fixed copy per action type (points/benefit/fee/milestone/cap) | Hardcoded |

### CapBS -- Cap Alert

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 162 | Alternative card name + rate | From action data | API_COMPUTED | Best alternative card for this bucket from /calculate comparison | From mock data |

### CatBS -- Categorization

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 163 | Category list (8) | Shopping, Groceries, Bills, Travel, Insurance, Fuel, Dining, Entertainment | STATIC | Fixed category taxonomy | Hardcoded |
| 164 | Brand list per category | From `BRAND_MAP` | STATIC + APP_COMPUTED | Could be expanded based on parsed transaction merchants | From mock data |

---

## Screen 12: Onboarding
**File**: `OnboardScreen.tsx`

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 165 | Detected card count | "We found 3 cards" | APP_COMPUTED | Count of unique bank+last4 combinations found in SMS parsing | Dynamic |
| 166 | Bank + last4 chips | "HSBC ..7891", "Axis ..4521", "HSBC ..3364" | APP_COMPUTED | Extracted from transaction SMS patterns -- bank name + last 4 digits | From SMS parsing |
| 167 | Card mapping options | Bank-specific card variant list | STATIC + API_DIRECT | For a given bank, list of possible card products. Could come from CardGenius card catalogue or static mapping | Currently hardcoded |
| 168 | Voice match transcript | User's spoken card name | USER_INPUT | Speech-to-text from voice card identification flow | Dynamic |
| 169 | Voice match result | "Did you mean HSBC Travel One?" | APP_COMPUTED | Fuzzy match of transcript against known card names | Dynamic |
| 170 | SMS permission status | "idle" / "loading" / "granted" | APP_COMPUTED | Device SMS permission state | Dynamic |
| 171 | OTP digits | User-entered 6 digits | USER_INPUT | Phone verification OTP | Dynamic |

## Screen 13: Gmail Mock Flow
**File**: `GmailMockFlow.tsx`

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 172 | Gmail OTP | 4-digit entry | USER_INPUT | Gmail OAuth verification | Dynamic |
| 173 | First name / Last name | "Aarav" / "Sharma" | USER_INPUT | User identity for Gmail auth. Currently hardcoded defaults | Hardcoded defaults in Index.tsx:156-157 |
| 174 | HSBC last-4 confirmation | "..84" / "..21" | USER_INPUT | User confirms last 4 digits of identified cards | Hardcoded defaults in Index.tsx:159-160 |
| 175 | "Cards we found" summary | 3 cards identified | APP_COMPUTED | Cards resolved from Gmail statement parsing -- bank, product name, last4 | After flow completion, triggers full card mapping |

## Merchant Tagging Workflow (via CatBS in BottomSheets.tsx)

| # | Data Element | Current Value | Source Type | Source Detail | Notes |
|---|---|---|---|---|---|
| 176 | Unaccounted transaction count | Every 12th transaction | APP_COMPUTED | Transactions where merchant/category couldn't be auto-identified from SMS | Count of `unaccounted: true` in parsed transactions |
| 177 | Original SMS text | Full SMS content | APP_COMPUTED | Raw SMS that couldn't be parsed | Displayed in CatBS for user to manually categorize |
| 178 | Manual category assignment | User-selected category | USER_INPUT | User picks from 8 categories | Updates transaction override |
| 179 | Manual brand assignment | User-selected brand | USER_INPUT | User picks from brand list within category | Updates transaction override |
| 180 | "Not a spend" reason | Loan/EMI, Refund, OTP, Duplicate, Other | USER_INPUT | User marks transaction as non-spend | Removes from analysis |
| 181 | Tagged transaction savings | `Math.round(amt x 0.02)` | APP_COMPUTED | After tagging, assigns default 2% savings estimate. **Should use actual /calculate bucket savings** | Hardcoded 2% in BottomSheets.tsx |

---

## GAPS & UNKNOWNS -- Items needing product/engineering decisions

| # | Element | Current State | What's Missing |
|---|---|---|---|
| G1 | **Card quality badge** ("Good card" / "Average card") | Hardcoded per card in `cards.ts` | No API field. Need formula -- e.g., card ROI percentile rank vs market? |
| G2 | **Match score** (65%-98%) on Best Cards | Hardcoded per card | Formula TBD. Suggestion: `(card_savings_on_user_top_buckets / max_possible_savings_on_those_buckets) x 100` |
| G3 | **Bank fees / late fees tables** | Hardcoded per card in `cardDetail.ts` | Not in /calculate or /recommend_cards response. Need separate endpoint or static card metadata DB |
| G4 | **Points balance + expiry** | Hardcoded (3,200 pts, 600 expiring) | Requires bank statement parsing from Gmail. No API source. This is a core APP_COMPUTED requirement |
| G5 | **Credit limit + usage** | Hardcoded (Rs.2L total, Rs.53K used) | From bank statements. No API source. Critical for credit utilization alerts |
| G6 | **Card activation date** | Not tracked | Needed for fee waiver deadline calculation (anniversary date) and welcome benefit eligibility window |
| G7 | **Lounge visit tracking** | Hardcoded (1 of 2 used) | From bank emails/SMS. API gives entitlement (`domestic_lounges_unlocked`), app must track usage |
| G8 | **Welcome benefit claim status** | Hardcoded | Requires: (a) card activation date, (b) spend within `maximum_days`, (c) comparison vs `minimum_spend` |
| G9 | **Milestone progress** | Hardcoded | API gives thresholds (`milestone_benefits[].minSpend`). App needs YTD spend sum on this card |
| G10 | **"How to apply" steps** | Hardcoded editorial content | Not from API. Needs content management -- could be in a separate CMS or hardcoded |
| G11 | **"Why not" lists** on Best Cards | Hardcoded editorial content | Not from API. `product_usps` only gives positives |
| G12 | **CashKaro cashback %** | Hardcoded 2% | Need CashKaro API or static config per merchant |
| G13 | **Recommendation threshold** | Not decided | User mentioned: "if saving 10k, won't recommend 12k card -- maybe 15k+". Need threshold % (50%? 30%?) |
| G14 | **Combined savings** (top 2 cards) | Hardcoded Rs.100,000 | Formula undefined. Is it sum of top 2 cards' savings? Or optimal 2-card allocation? |
| G15 | **Optimization "save" amounts** per HereIsHow card | Rs.90K, Rs.40K, "Extra Savings" | **Multiple contradictions:** (a) Hero shows Rs.90K = Bar 3 (Ultimate), but "Get ultimate card" CTA also shows Rs.90K which user said = "Bar 3 - Bar 1" (delta). Both can't be Rs.90K unless Current=0. (b) "Use existing cards right" shows Rs.40K -- is this Bar 2 value (Rs.50K) or delta Bar2-Bar1 (Rs.30K)? Neither matches Rs.40K. (c) "Extra Savings" = unclaimed benefits value? All three need explicit formulas. |
| G16 | **Transaction-to-bucket mapping** | Not implemented | Critical foundation: mapping each parsed transaction merchant to an API spending bucket (amazon_spends, flipkart_spends, etc.) |
| G17 | **Food/dining benefits** | In API (`food_dining_benefits`) but not shown anywhere | API returns `food_benefit_percentage`, `food_benefit_max_cap`, `food_benefit_mov`. Not surfaced in any screen |

---

## API Field Coverage Summary

### Fields from /calculate (per user card) that map to UI:

| API Field | Used In | Screen(s) |
|---|---|---|
| `spending_breakdown[bucket].savings` | Per-bucket reward value | Home, Card Detail, Optimize, Calculator, TxnSheet |
| `spending_breakdown[bucket].points_earned` | Raw points display | Card Detail Analysis tab |
| `spending_breakdown[bucket].maxCap` | Cap warning threshold | Actions, Card Detail, Calculator limits |
| `spending_breakdown[bucket].totalMaxCap` | Overall card cap | Actions |
| `spending_breakdown[bucket].maxCapReached` | Cap hit badge | Actions, TxnSheet |
| `spending_breakdown[bucket].explanation` | "How to earn" HTML | Calculator |
| `spending_breakdown[bucket].conv_rate` | Point-to-Rs. conversion | Redeem, Card Detail |
| `spending_breakdown[bucket].savings_type` | "points" vs "cashback" | Redeem, Card Detail |
| `spending_breakdown[bucket].spend_conversion` | "Rs.200 = X RP" display | Calculator |
| `total_savings` | Monthly savings total | Home hero (x12) |
| `total_savings_yearly` | Annual savings | Optimize bars, Best Cards comparison |

### Fields from /recommend_cards that map to UI:

| API Field | Used In | Screen(s) |
|---|---|---|
| `card_name`, `bank_name` | Card identity | Best Cards, Optimize recommended |
| `image`, `card_bg_image`, `card_bg_gradient` | Card visuals | Best Cards, Optimize, Card Promo |
| `total_savings_yearly` | Annual savings | Best Cards savings display |
| `roi` | Net value (savings - fee) | Best Cards net savings |
| `annual_fees`, `joining_fees` | Fee display | Best Cards Fees tab |
| `annual_fee_spends`, `annual_fee_waiver_toggle` | Waiver info | Best Cards, Actions |
| `product_usps[]` | Card highlights | Best Cards "Why good" |
| `milestone_benefits[]` | Milestone rewards | Best Cards Benefits, Actions |
| `welcomeBenefits[]` | Welcome offers | Best Cards Benefits |
| `travel_benefits` | Lounge details | Best Cards Benefits |
| `redemption_options[]` | Redemption partners | Redeem screen |
| `recommended_redemption_options[]` | Best redemption | Redeem screen |
| `spending_breakdown[bucket].*` | Per-bucket breakdown | Best Cards "How can this help" |
| `food_dining_benefits[]` | Dining perks | **NOT USED** currently |
| `rating`, `user_rating_count` | Rating display | **NOT USED** currently |
| `invite_only` | Eligibility filter | Best Cards filter tags |
| `cg_network_url`, `ck_store_url` | Apply links | Best Cards CTA |
| `brand_options[]`, `spending_category_brands[]` | Accelerated brand info | **NOT USED** -- could enhance Calculator |
| `tags` | Category tags | **NOT USED** -- could populate filter chips |
| `ek_store_id`, `ck_store_id` | CashKaro integration | **NOT USED** -- could power CashKaro earnings |

### Data NOT in any API (must be APP_COMPUTED from transaction parsing):

| Data | Needed For |
|---|---|
| Per-transaction card assignment | Current Savings, TxnSheet "card you used" |
| Per-transaction merchant identification | Category mapping, brand grouping |
| YTD spend per card | Fee waiver progress, milestone progress |
| Current month spend per bucket per card | Cap utilization tracking |
| Points balance | Redeem, Actions (expiring points) |
| Credit limit + current usage | Card Detail utilization, Actions |
| Card activation date | Fee waiver deadline, welcome benefit window |
| Lounge visit history | Card Detail Benefits tab |

---

## Verification Plan

Once data sources are wired up, verify each screen by:

1. **Home**: Change API input spends -> confirm hero savings amounts update. Add/remove a card -> confirm card strip updates.
2. **Transactions**: Parse real SMS -> confirm merchant names, amounts, dates render. Change card-to-bucket assignment -> confirm tags recalculate.
3. **Optimize**: Modify spend profile -> confirm all 3 bars, distribution %, and card assignments update. Toggle ultimate card -> confirm recomputation.
4. **Card Detail**: Switch between cards -> confirm per-card savings, transactions, benefits, fees all update. Verify points balance from statement.
5. **Best Cards**: Call /recommend_cards with real spends -> confirm card list, savings, match scores render from API data. Verify welcome/milestone/lounge from response.
6. **Actions**: Verify cap alerts trigger from `maxCapReached`. Verify fee waiver countdown from `annual_fee_spends` vs YTD.
7. **Calculator**: Enter amount for a brand -> call /calculate -> verify savings match API response per card.
8. **Redeem**: Select card -> verify redemption options match `redemption_options[]` from API.
