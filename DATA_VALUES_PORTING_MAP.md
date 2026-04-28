# Data Values Porting Map

This file lists the business numbers currently used by the canonical metrics/data layer and where each value comes from. Use this as the porting reference for any other UI.

Do not copy numbers from UI components. UI should consume selectors from `src/data/simulation/metrics.ts` or raw canonical inputs from the files listed below.

## Canonical Entry Points

| Need | Use this selector/function | Source file |
|---|---|---|
| App headline totals | `selectSummaryMetrics()` | `src/data/simulation/metrics.ts` |
| Home dashboard | `selectHomeMetrics()` | `src/data/simulation/metrics.ts` |
| Transactions | `selectTransactionMetrics()` | `src/data/simulation/metrics.ts` |
| Optimize | `selectOptimizeMetrics()` | `src/data/simulation/metrics.ts` |
| Owned card detail | `selectOwnedCardDetailMetrics(cardIndex)` | `src/data/simulation/metrics.ts` |
| Best Cards list | `selectBestCardsListMetrics()` | `src/data/simulation/metrics.ts` |
| Best Card detail | `selectBestCardDetailMetrics(index)` | `src/data/simulation/metrics.ts` |
| Portfolio | `selectPortfolioMetrics(cardNames?)` | `src/data/simulation/metrics.ts` |
| Calculator | `calculateRewardsForInput(amount, query, isCategory)` | `src/data/simulation/metrics.ts` |
| Actions | `selectActionsMetrics()` | `src/data/simulation/metrics.ts` |
| Redeem | `selectRedeemMetrics()` | `src/data/simulation/metrics.ts` |
| Single-card transaction reward | `getCardRewardForSpend(cardIndex, amount, bucket, merchant)` | `src/data/simulation/mockApi.ts` |
| Best owned card for one spend | `getBestCardForSpend(amount, bucket, merchant)` | `src/data/simulation/mockApi.ts` |

## Spend Profile

Source: `src/data/simulation/inputs.ts`

All monthly buckets are monthly rupee amounts. Annual buckets are annual rupee amounts and are divided by 12 by the calculation layer. Lounge buckets are visit counts, not spend amounts.

| Key | Value | Unit | Notes |
|---|---:|---|---|
| `amazon_spends` | 5,000 | monthly ₹ | Shopping |
| `flipkart_spends` | 7,000 | monthly ₹ | Shopping |
| `other_online_spends` | 4,000 | monthly ₹ | Includes Myntra, Nykaa, Ajio, BookMyShow, Urban Company, Lenskart |
| `other_offline_spends` | 4,000 | monthly ₹ | Includes Croma, Reliance Digital, Decathlon, IKEA |
| `grocery_spends_online` | 8,000 | monthly ₹ | Online grocery |
| `offline_grocery` | 7,000 | monthly ₹ | Offline grocery |
| `online_food_ordering` | 8,333 | monthly ₹ | Swiggy, Zomato, Dominos |
| `cab_rides` | 0 | monthly ₹ | Cab bucket |
| `fuel` | 6,000 | monthly ₹ | Fuel |
| `dining_or_going_out` | 10,000 | monthly ₹ | Dining |
| `mobile_phone_bills` | 1,500 | monthly ₹ | Bills |
| `electricity_bills` | 3,000 | monthly ₹ | Bills |
| `water_bills` | 1,500 | monthly ₹ | Bills |
| `rent` | 45,667 | monthly ₹ | Rent |
| `flights_annual` | 1,00,000 | annual ₹ | Travel |
| `hotels_annual` | 60,000 | annual ₹ | Travel |
| `insurance_health_annual` | 60,000 | annual ₹ | Insurance |
| `insurance_car_or_bike_annual` | 24,000 | annual ₹ | Insurance |
| `life_insurance` | 24,000 | annual ₹ | Insurance |
| `school_fees` | 0 | annual ₹ | Education |
| `domestic_lounge_usage_quarterly` | 2.25 | quarterly visits | Lounge, not spend |
| `international_lounge_usage_quarterly` | 0.75 | quarterly visits | Lounge, not spend |
| `TOTAL_ANNUAL_SPEND` | 16,00,000 | annual ₹ | Canonical total |

## Merchant Mapping

Source: `src/data/simulation/inputs.ts`

Merchant-level rates can only affect precise transaction/calculator values when a merchant is known. Headline totals are bucket-based unless a canonical merchant spend split is added.

| Bucket | Merchants |
|---|---|
| `amazon_spends` | Amazon |
| `flipkart_spends` | Flipkart |
| `other_online_spends` | Myntra, Nykaa, Ajio, BookMyShow, Urban Company, Lenskart |
| `other_offline_spends` | Croma, Reliance Digital, Decathlon, IKEA |
| `grocery_spends_online` | BigBasket, Blinkit, Zepto, Swiggy Instamart |
| `offline_grocery` | DMart, Nature's Basket, Local Store |
| `online_food_ordering` | Swiggy, Zomato, Dominos |
| `cab_rides` | Uber |
| `fuel` | Shell, HP Petrol, Indian Oil |
| `dining_or_going_out` | Starbucks, McDonald's, Restaurant |
| `mobile_phone_bills` | Jio, Airtel |
| `electricity_bills` | Electricity Board |
| `water_bills` | Water Board |
| `rent` | CRED RentPay, NoBroker |
| `flights_annual` | MakeMyTrip, IndiGo, Cleartrip |
| `hotels_annual` | MakeMyTrip, OYO, Booking.com |
| `insurance_health_annual` | Star Health |
| `insurance_car_or_bike_annual` | ICICI Lombard |
| `life_insurance` | LIC |

## Owned Card Rules

Source: `src/data/simulation/inputs.ts`

### HSBC Travel One

| Rule | Value |
|---|---:|
| Base reward | 2 RP per ₹100 |
| Base cash value | 0.4% effective at ₹0.20/RP |
| Flight reward | 16 RP per ₹100 |
| Hotel reward | 24 RP per ₹100 |
| Flight/hotel monthly RP cap | 1,800 RP |
| Point conversion | ₹0.20/RP |
| Zero reward buckets | Fuel, rent |
| Annual fee | ₹4,999 |
| Annual fee including GST | ₹5,899 |
| Fee waiver threshold | ₹8,00,000/year |
| Current points balance | 12,400 RP |
| Expiring points | 2,200 RP in 18 days |
| Credit limit | ₹3,00,000 |
| Credit used | ₹87,000 |
| Milestone | Spend ₹12,00,000, get 10,000 bonus RP worth ₹2,000 |
| Lounge access | 6 domestic/year, 4 international/year |

### Axis Flipkart

| Rule | Value |
|---|---:|
| Base cashback | 1% |
| Flipkart cashback | 5% |
| Flipkart monthly cap | ₹4,000 |
| Myntra cashback | 7.5% |
| Myntra monthly cap | ₹4,000 |
| Flights cashback | 5% |
| Hotels cashback | 5% |
| Flights/hotels monthly cap | ₹4,000 |
| Online food ordering cashback | 4% |
| Cab rides cashback | 4% |
| Zero reward buckets | Fuel, rent, school fees |
| Fuel surcharge waiver | 1%, txn ₹400-₹4,000, max ₹400/cycle |
| Annual fee | ₹500 |
| Annual fee including GST | ₹590 |
| Fee waiver threshold | ₹3,50,000/year |
| Credit limit | ₹1,50,000 |
| Credit used | ₹53,000 |
| Welcome benefit | ₹250 Flipkart voucher on first transaction within 30 days |

### HSBC Live+

| Rule | Value |
|---|---:|
| Base cashback | 1.5% |
| Accelerated cashback | 10% |
| Accelerated buckets | Dining, online food ordering, online grocery, offline grocery |
| Shared monthly cap | ₹1,000 |
| Zero reward buckets | Fuel, rent |
| Annual fee | ₹999 |
| Annual fee including GST | ₹1,179 |
| Fee waiver threshold | ₹2,00,000/year |
| Credit limit | ₹2,00,000 |
| Credit used | ₹42,000 |
| Welcome benefit | ₹1,000 cashback on ₹20,000 spend in 30 days + ₹250 Amazon voucher |
| Lounge access | 4 domestic/year |

## Actual Card Usage

Source: `src/data/simulation/inputs.ts`

This intentionally suboptimal mapping defines current savings. Values are card indexes:

- `0` = HSBC Travel One
- `1` = Axis Flipkart
- `2` = HSBC Live+

| Bucket | Current card |
|---|---|
| Amazon | Axis Flipkart |
| Flipkart | Axis Flipkart |
| Other online | HSBC Travel One |
| Other offline | HSBC Travel One |
| Online grocery | HSBC Travel One |
| Offline grocery | HSBC Travel One |
| Online food ordering | Axis Flipkart |
| Fuel | HSBC Travel One |
| Dining | HSBC Travel One |
| Mobile bills | HSBC Live+ |
| Electricity bills | HSBC Live+ |
| Water bills | HSBC Live+ |
| Rent | HSBC Travel One |
| School fees | HSBC Travel One |
| Flights | HSBC Travel One |
| Hotels | HSBC Travel One |
| Health insurance | HSBC Travel One |
| Motor insurance | HSBC Travel One |
| Life insurance | HSBC Travel One |
| Lounge usage | HSBC Travel One |

## Market Card Data

Primary source: `src/data/fixtures/recommendCards.json`

Adapter/enrichment source: `src/data/simulation/recommendData.ts`

Raw root references:

- `data/recommendCards_25_fixture.json`
- `data/api response pretty.json`

Market cards are not manually calculated in UI. They come from the fixture response and are normalized by `recommendData.ts`.

### HDFC Diners Club Black Metal

Source: `src/data/fixtures/recommendCards.json` plus normalization in `src/data/simulation/recommendData.ts`.

| Rule | Value |
|---|---:|
| Base reward | 5 RP per ₹150 |
| Total monthly card cap | 75,000 RP |
| Grocery cap | 2,000 RP/month |
| School fees cap | 2,000 RP/month |
| Utility bills cap | 2,000 RP/month |
| Dining cap | 1,000 RP/month |
| Hotels cap | 10,000 RP/month |
| Flights cap | 10,000 RP/month |
| Insurance cap | 5,000 RP/month |
| Welcome benefit | Spend ₹1,50,000 within 90 days, get ₹25,000 vouchers |
| Milestone | Spend ₹4,00,000 within 90 days, get 10,000 RP |
| Dining offer | 10% discount, 1 time/month, MOV ₹3,000, max discount ₹800 |
| Lounge | Unlimited domestic and international, represented as market-card travel benefit text |

## Lounge Values

Source: `src/data/simulation/inputs.ts`

| Value | Amount |
|---|---:|
| Domestic lounge reference value | ₹750/visit |
| International lounge reference value | ₹1,250/visit |

Lounge visit counts are not spend. The calculation layer converts available visits into annual travel benefit value.

## Redemption Values

Source: `src/data/simulation/metrics.ts`

| Card type | Default redemption |
|---|---|
| HSBC Travel One | Statement Credit at card `conv_rate` |
| Cashback cards | Statement Cashback at card `conv_rate` |
| Market cards | First `redemption_options` entry from fixture, or data unavailable |

Do not hardcode airline/hotel redemption values in UI.

## Current Runtime Headline Values

Source: `selectSummaryMetrics()` in `src/data/simulation/metrics.ts`

These values depend on the current canonical spend profile and card rules.

| Metric | Current value |
|---|---:|
| Total spend | ₹16,00,000/year |
| Current savings | ₹26,226/year |
| Optimized savings | ₹38,490/year |
| Ultimate savings | ₹1,21,541/year |
| Optimization uplift | ₹12,264/year |
| Ultimate uplift | ₹83,051/year |
| Total potential uplift | ₹95,315/year |

## Legacy / Do Not Port As Requirements

These files contain older static/demo values or compatibility data. Do not treat them as canonical requirements.

| File | Why not canonical |
|---|---|
| `src/data/cardDetail.ts` | Older static card detail mock values |
| `src/data/transactions.ts` | Older static transaction mock values |
| `src/data/spend.ts` | Older static brand/category spend values; useful as reference only, not reconciled with canonical spend profile |
| `src/data/calculator.ts` | Legacy calculator catalogue/taxonomy; active reward math is canonicalized through `metrics.ts` and `mockApi.ts` |
| `src/data/bestCards.ts` | Older marketplace mock values |
| `src/data/optimize.ts` | Older optimize mock values |
| `src/features/redundant/*` | Archived parallel implementations |

## Important Porting Notes

- Money should be formatted with Indian grouping, equivalent to `toLocaleString("en-IN")`.
- Monthly and yearly values must stay explicit.
- Annual buckets in `SPEND_PROFILE` are divided by 12 for monthly calculations.
- Merchant-specific rules such as Myntra 7.5% only apply when the merchant is known.
- Do not invent merchant splits inside a bucket. Add a canonical merchant spend profile first if headline totals must reflect merchant-specific rates.
- Charts/tables should use reconciled selector outputs rather than recomputing totals in UI.
