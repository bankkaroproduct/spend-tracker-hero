# Task: Build Simulation Data Layer

## Goal

Replace all hardcoded/mock data with a simulation layer that computes every data point from defined inputs, mirroring how production will work (API calls + transaction parsing). When we later wire real APIs, only input sources change — all downstream logic stays.

## Architecture

```
simulation/inputs.ts     → Spend profile, card portfolio, card-to-bucket usage
simulation/mockApi.ts    → Simulated /calculate (3x) + /recommend_cards (1x) responses
simulation/compute.ts    → All derived values (savings bars, per-txn, actions, scores)
simulation/legacy.ts     → Drop-in adapters re-exporting under existing names
```

---

## File 1: `src/data/simulation/inputs.ts`

### Spend Profile (from api request.json — verified)

```typescript
export const SPEND_PROFILE = {
  amazon_spends: 5000,
  flipkart_spends: 7000,
  other_online_spends: 4000,
  other_offline_spends: 4000,
  grocery_spends_online: 8000,
  offline_grocery: 7000,
  online_food_ordering: 8333,
  fuel: 6000,
  dining_or_going_out: 10000,
  mobile_phone_bills: 1500,
  electricity_bills: 3000,
  water_bills: 1500,
  flights_annual: 100000,       // annual, API divides by 12
  hotels_annual: 60000,         // annual
  insurance_health_annual: 60000,
  insurance_car_or_bike_annual: 24000,
  life_insurance: 24000,
  school_fees: 0,
  rent: 45667,                  // monthly (sent as-is to API)
  domestic_lounge_usage_quarterly: 2.25,
  international_lounge_usage_quarterly: 0.75,
};
```

**TOTAL_MONTHLY_SPEND**: Sum of all monthly buckets + rent = 111,000
**TOTAL_ANNUAL_SPEND**: (111,000 x 12) + 268,000 = **1,600,000** (replaces old TOTAL_ACC of 1,500,250)

### Card Portfolio (verified via CardGenius MCP 2026-04-26)

**Card 0: HSBC Travel One**
Source: CardGenius alias `hsbc-travel-one`

```typescript
{
  index: 0,
  name: "HSBC Travel One",       // matches existing CARDS[0].name
  card_alias: "hsbc-travel-one",
  bank: "HSBC",
  last4: "7891",
  color: "#0c2340",
  accent: "#1a5276",
  headerAccent: "#1a5276",
  card_type: "Mastercard",
  image: "/legacy-assets/cards/hsbc-travel-one.png",

  // Reward structure (from CardGenius)
  savings_type: "points",
  ptName: "Reward Points",
  reward_rates: {
    travel: 0.008,    // 4 RP/₹100 x ₹0.20/RP = 0.8%
    default: 0.004,   // 2 RP/₹100 x ₹0.20/RP = 0.4%
  },
  rp_per_100: { travel: 4, default: 2 },
  conv_rate: 0.20,    // 1 RP = ₹0.20
  spend_conversion: 100, // earn RP per ₹100
  accelerated_cap_monthly_rp: 50000, // 50K accelerated RP/month
  // No overall monthly savings cap

  // Bucket classification
  travel_buckets: ["flights_annual", "hotels_annual"],
  // All other buckets get default rate
  zero_buckets: ["fuel", "rent"], // explicitly earns 0 on these

  // Card state (simulated from statement parsing)
  activation_date: "2025-06-15",
  points_balance: 12400,
  points_expiring: { amount: 2200, days_until: 18 },
  credit_limit: 300000,
  credit_used: 87000,

  // Fee structure
  annual_fee: 4999,
  annual_fee_incl_gst: "₹5,899 (incl. GST)",
  fee_waiver_threshold: 800000,  // ₹8L
  joining_fee: "₹5,899 (incl. GST)",

  // Benefits
  milestone_benefits: [
    { minSpend: 1200000, reward: "10,000 bonus Reward Points", value: 2000 },
  ],
  welcome_benefits: {
    description: "₹1,000 cashback + Postcard Hotel voucher ₹3,000 + EazyDiner Prime 3mo",
    minimum_spend: 10000,
    maximum_days: 30,
    bonus_rp: { amount: 3000, min_spend: 100000, max_days: 90 },
  },
  lounge_access: { domestic_annual: 6, international_annual: 4 },
  lounge_used: { domestic: 3, international: 1 },

  quality: "Average",  // will be recomputed by computeCardQuality()
  availPts: 12400,
}
```

**Card 1: Axis Flipkart**
Source: CardGenius alias `axis-flipkart-credit-card`

```typescript
{
  index: 1,
  name: "Axis Flipkart",
  card_alias: "axis-flipkart-credit-card",
  bank: "Axis",
  last4: "4521",
  color: "#5b2c8e",
  accent: "#8b5cf6",
  headerAccent: "#930A41",
  card_type: "VISA",
  image: "/legacy-assets/cards/axis-flipkart.png",

  savings_type: "cashback",
  ptName: "Cashback",
  reward_rates: {
    flipkart_spends: 0.05,         // 5%
    // Myntra falls under other_online_spends — apply 7.5% to Myntra portion
    cleartrip: 0.05,               // 5% (not a separate bucket, embedded in travel)
    preferred: 0.04,               // Swiggy, Uber, PVR, Cult.fit
    default: 0.01,                 // 1% on all other
  },
  conv_rate: 1.0,
  spend_conversion: 0, // N/A for cashback

  // Cap structure (IMPORTANT: real caps are per-merchant per-quarter)
  // Approximation for simulation: convert to monthly per-bucket
  bucket_caps: {
    flipkart_spends: 1333,         // ₹4K/quarter ÷ 3
    // Myntra portion of other_online: also ₹1,333/mo but we can't split the bucket
    // preferred merchants (Swiggy etc): unlimited
    // default: unlimited
  },
  // No overall monthly cap (spec's ₹750/mo was wrong)

  preferred_buckets: ["online_food_ordering"], // Swiggy falls here
  // Only truly zero-earning buckets. Insurance earns 1% default.
  // Fuel has surcharge waiver (separate benefit) but 0 reward points.
  zero_buckets: ["fuel", "rent", "school_fees"],
  // Fuel surcharge waiver: 1% on txns ₹400-₹4K, max ₹400/cycle
  fuel_surcharge_waiver: { rate: 0.01, min_txn: 400, max_txn: 4000, max_per_cycle: 400 },

  activation_date: "2025-03-20",
  points_balance: 0,
  points_expiring: null,
  credit_limit: 150000,
  credit_used: 53000,

  annual_fee: 500,
  annual_fee_incl_gst: "₹590 (incl. GST)",
  fee_waiver_threshold: 350000,  // ₹3.5L (not ₹2L as spec said)
  joining_fee: "₹590 (incl. GST)",

  milestone_benefits: [],
  welcome_benefits: {
    description: "₹250 Flipkart voucher on first transaction within 30 days",
    minimum_spend: 1,
    maximum_days: 30,
  },
  lounge_access: { domestic_annual: 0, international_annual: 0 },
  lounge_used: { domestic: 0, international: 0 },

  quality: "Good",
  availPts: null,
}
```

**Card 2: HSBC Live+**
Source: CardGenius alias `hsbc-live-plus-credit-card`

```typescript
{
  index: 2,
  name: "HSBC Live+",
  card_alias: "hsbc-live-plus-credit-card",
  bank: "HSBC",
  last4: "3364",
  color: "#006d5b",
  accent: "#00a086",
  headerAccent: "#006d5b",
  card_type: "VISA",
  image: "/legacy-assets/cards/hsbc-live.png",

  savings_type: "cashback",   // CONFIRMED cashback, not points
  ptName: "Cashback",
  reward_rates: {
    accelerated: 0.10,   // 10% on dining, food delivery, grocery
    default: 0.015,      // 1.5% on everything else
  },
  conv_rate: 1.0,        // cashback = 1:1
  spend_conversion: 0,

  // CRITICAL: ₹1,000/month SHARED cap across dining + food delivery + grocery
  shared_cap: {
    amount: 1000,
    buckets: ["dining_or_going_out", "online_food_ordering",
              "grocery_spends_online", "offline_grocery"],
  },
  // 1.5% on other buckets has NO cap

  zero_buckets: ["fuel", "rent"],

  activation_date: "2024-11-10",
  points_balance: 0,       // cashback card, no points balance
  points_expiring: null,    // no points to expire
  credit_limit: 200000,
  credit_used: 42000,

  annual_fee: 999,
  annual_fee_incl_gst: "₹1,179 (incl. GST)",
  fee_waiver_threshold: 200000,  // ₹2L
  joining_fee: "₹1,179 (incl. GST)",

  milestone_benefits: [],
  welcome_benefits: {
    description: "₹1,000 cashback on ₹20,000 spend in 30 days + ₹250 Amazon voucher",
    minimum_spend: 20000,
    maximum_days: 30,
  },
  lounge_access: { domestic_annual: 4, international_annual: 0 },
  lounge_used: { domestic: 1, international: 0 },

  quality: "Good",
  availPts: null,
}
```

### Actual Card Usage per Bucket

```typescript
export const ACTUAL_CARD_USAGE: Record<string, number> = {
  amazon_spends: 1,           // Axis Flipkart (suboptimal — only 1%)
  flipkart_spends: 1,         // Axis Flipkart (correct — 5%)
  other_online_spends: 0,     // HSBC Travel (0.4%)
  other_offline_spends: 0,    // HSBC Travel (0.4%)
  grocery_spends_online: 0,   // HSBC Travel (suboptimal — Live+ gives 10%)
  offline_grocery: 0,         // HSBC Travel (suboptimal)
  online_food_ordering: 1,    // Axis Flipkart (4%, but Live+ gives 10%)
  fuel: 0,                    // HSBC Travel (0% — all cards earn 0 on fuel)
  dining_or_going_out: 0,     // HSBC Travel (0.4%, Live+ gives 10%)
  mobile_phone_bills: 2,      // HSBC Live+ (1.5%)
  electricity_bills: 2,       // HSBC Live+ (1.5%)
  water_bills: 2,             // HSBC Live+ (1.5%)
  rent: 0,                    // HSBC Travel (0% — all earn ~0 on rent)
  school_fees: 0,             // N/A, ₹0 spend
  flights_annual: 0,          // HSBC Travel (0.8% — correct)
  hotels_annual: 0,           // HSBC Travel (0.8% — correct)
  insurance_health_annual: 0, // HSBC Travel (0.4%)
  insurance_car_or_bike_annual: 0,
  life_insurance: 0,
  domestic_lounge_usage_quarterly: 0,
  international_lounge_usage_quarterly: 0,
};
```

### Bucket Metadata

```typescript
export const ANNUAL_BUCKETS = [
  "flights_annual", "hotels_annual", "insurance_health_annual",
  "insurance_car_or_bike_annual", "life_insurance", "school_fees",
];

export const LOUNGE_BUCKETS = [
  "domestic_lounge_usage_quarterly", "international_lounge_usage_quarterly",
];

// NOTE: Lounge values are NOT hand-computed per month.
// The real API returns:
//   - spending_breakdown[lounge_bucket].savings = pre-computed monthly value
//   - travel_benefits.total_travel_benefit_annual = annual lounge value (top-level)
//   - travel_benefits.domestic_lounge_benefits_annual, etc.
// For simulation: use the API's pattern. The API takes quarterly visit count
// as input and returns the valuation. Reference values for building mock:
//   domestic visit = ₹750, international = ₹1,250
// But these go into travel_benefits (annual), not spending_breakdown math.
export const LOUNGE_REFERENCE = { domestic_per_visit: 750, international_per_visit: 1250 };

// Response-only buckets (always present in API, spend=0 for this user)
export const RESPONSE_ONLY_BUCKETS = [
  "ott_channels", "large_electronics_purchase_like_mobile_tv_etc",
  "all_pharmacy", "railway_lounge_usage_quarterly",
  "new_monthly_cat_1", "new_monthly_cat_2", "new_monthly_cat_3",
  "new_cat_1", "new_cat_2", "new_cat_3",
];

export const BUCKET_TO_CATEGORY: Record<string, string> = {
  amazon_spends: "Shopping",
  flipkart_spends: "Shopping",
  other_online_spends: "Shopping",
  other_offline_spends: "Shopping",
  grocery_spends_online: "Groceries",
  offline_grocery: "Groceries",
  online_food_ordering: "Food & Dining",
  dining_or_going_out: "Food & Dining",
  fuel: "Fuel",
  mobile_phone_bills: "Bills & Utilities",
  electricity_bills: "Bills & Utilities",
  water_bills: "Bills & Utilities",
  rent: "Rent",
  flights_annual: "Travel",
  hotels_annual: "Travel",
  insurance_health_annual: "Insurance",
  insurance_car_or_bike_annual: "Insurance",
  life_insurance: "Insurance",
  school_fees: "Education",
};

export const BUCKET_TO_MERCHANT: Record<string, string[]> = {
  amazon_spends: ["Amazon"],
  flipkart_spends: ["Flipkart"],
  other_online_spends: ["Myntra", "Nykaa", "Ajio", "BookMyShow", "Urban Company", "Lenskart"],
  other_offline_spends: ["Croma", "Reliance Digital", "Decathlon", "IKEA"],
  grocery_spends_online: ["BigBasket", "Blinkit", "Zepto", "Swiggy Instamart"],
  offline_grocery: ["DMart", "Nature's Basket", "Local Store"],
  online_food_ordering: ["Swiggy", "Zomato", "Dominos"],
  fuel: ["Shell", "HP Petrol", "Indian Oil"],
  dining_or_going_out: ["Starbucks", "McDonald's", "Restaurant"],
  mobile_phone_bills: ["Jio", "Airtel"],
  electricity_bills: ["Electricity Board"],
  water_bills: ["Water Board"],
  rent: ["CRED RentPay", "NoBroker"],
  flights_annual: ["MakeMyTrip", "IndiGo", "Cleartrip"],
  hotels_annual: ["MakeMyTrip", "OYO", "Booking.com"],
  insurance_health_annual: ["Star Health"],
  insurance_car_or_bike_annual: ["ICICI Lombard"],
  life_insurance: ["LIC"],
};
```

---

## File 2: `src/data/simulation/mockApi.ts`

### 2A. Build /calculate response for each user card

For each card, for each bucket in SPEND_PROFILE:

1. Get the monthly spend: `spend = ANNUAL_BUCKETS.includes(bucket) ? SPEND_PROFILE[bucket] / 12 : SPEND_PROFILE[bucket]`
2. For LOUNGE_BUCKETS: these are special. The `spend` field = quarterly visit count (not ₹). The `savings` is pre-computed by the API. For simulation, compute:
   - `savings = visits_per_quarter × value_per_visit` (₹750 domestic, ₹1250 intl) → this is QUARTERLY value
   - Monthly savings = quarterly / 3
   - But also set `travel_benefits` at the card level as annual totals
   - `savings_type = "cashback"`, `points_earned = 0`
3. For all other buckets: Apply card's reward rate to get raw savings
4. Apply per-bucket caps (clamp and set `maxCapReached`)
5. Apply shared caps (HSBC Live+ ₹1K shared across 4 buckets)
6. Sum all bucket savings (excluding lounge) = `total_savings` (monthly)
7. `total_savings_yearly = total_savings * 12`
8. `roi = total_savings_yearly + travel_benefits.total_travel_benefit_annual + total_extra_benefits - annual_fee_without_gst`

**Rate computation per card per bucket:**

**HSBC Travel One:**
```
flights_annual:  spend/12 × 0.008 = 8333 × 0.008 = 66.67
hotels_annual:   spend/12 × 0.008 = 5000 × 0.008 = 40.00
amazon_spends:   5000 × 0.004 = 20.00
flipkart_spends: 7000 × 0.004 = 28.00
dining:          10000 × 0.004 = 40.00
online_food:     8333 × 0.004 = 33.33
grocery_online:  8000 × 0.004 = 32.00
offline_grocery: 7000 × 0.004 = 28.00
other_online:    4000 × 0.004 = 16.00
other_offline:   4000 × 0.004 = 16.00
bills/water:     6000 × 0.004 = 24.00
fuel:            0 (zero bucket)
rent:            0 (zero bucket)
insurance_health:  60000/12 × 0.004 = 5000 × 0.004 = 20.00
insurance_car:     24000/12 × 0.004 = 2000 × 0.004 = 8.00
life_insurance:    24000/12 × 0.004 = 2000 × 0.004 = 8.00
Approx monthly total (reward points only): ~₹380/mo → ~₹4,560/yr

Lounge (handled separately as travel_benefits, NOT in spending_breakdown math):
  travel_benefits.domestic_lounge_benefits_annual = 2.25 visits/qtr × 4 qtrs × ₹750 = ₹6,750
  travel_benefits.international_lounge_benefits_annual = 0.75 × 4 × ₹1,250 = ₹3,750
  travel_benefits.total_travel_benefit_annual = ₹10,500
  (The API returns these as top-level annual figures, and also pre-computes
   spending_breakdown[lounge_bucket].savings as a monthly value.)

Total yearly: ~₹4,560 (points) + ₹10,500 (lounge) = ~₹15,060
```
NOTE: These are approximations from verified CardGenius rates. The real /calculate API
will return exact values. For simulation, build the response to match the API shape from
data/api response pretty.json (lines 963-1022 show lounge bucket structure).

**Axis Flipkart:**
```
flipkart_spends: 7000 × 0.05 = 350 → capped at 1333/mo → 350 (under cap)
amazon_spends:   5000 × 0.01 = 50
online_food:     8333 × 0.04 = 333.32 (Swiggy = preferred, unlimited)
other_online:    4000 × 0.01 = 40 (Myntra portion would be 7.5% but can't split bucket)
other_offline:   4000 × 0.01 = 40
dining:          10000 × 0.01 = 100
grocery_online:  8000 × 0.01 = 80
offline_grocery: 7000 × 0.01 = 70
bills/water:     6000 × 0.01 = 60
flights_annual:  100000/12 × 0.01 = 8333 × 0.01 = 83.33
hotels_annual:   60000/12 × 0.01 = 5000 × 0.01 = 50.00
insurance_health: 60000/12 × 0.01 = 50.00  (1% default, NOT zero)
insurance_car:    24000/12 × 0.01 = 20.00
life_insurance:   24000/12 × 0.01 = 20.00
fuel:             0 (no reward points; surcharge waiver is a separate benefit, see below)
rent:             0 (convenience fee negates rewards)
school_fees:      0 (₹0 spend)
Approx monthly: ~₹1,347
Yearly: ~₹16,160

Fuel surcharge waiver: 1% waiver on txns ₹400-₹4,000, max ₹400/cycle.
  At ₹6K/mo fuel, this saves ~₹60/mo = ₹720/yr.
  Model as a separate line item in card benefits, NOT in spending_breakdown.savings.
  (The real API handles fuel surcharge waiver outside the reward calculation.)
```

**HSBC Live+:**
```
Accelerated (10% with ₹1K/mo shared cap):
  dining:        10000 × 0.10 = 1000
  online_food:   8333 × 0.10 = 833
  grocery_online:8000 × 0.10 = 800
  offline_grocery:7000 × 0.10 = 700
  SUBTOTAL: 3333 → CAPPED at 1000 total. Distribute proportionally.
  dining gets:   1000 × (1000/3333) = 300
  food gets:     1000 × (833/3333) = 250
  grocery gets:  1000 × (800/3333) = 240
  offline_groc:  1000 × (700/3333) = 210

Default 1.5% (no cap):
  amazon:          5000 × 0.015 = 75
  flipkart:        7000 × 0.015 = 105
  other_online:    4000 × 0.015 = 60
  other_offline:   4000 × 0.015 = 60
  bills/water:     6000 × 0.015 = 90
  flights_annual:  100000/12 × 0.015 = 8333 × 0.015 = 125.00
  hotels_annual:   60000/12 × 0.015 = 5000 × 0.015 = 75.00
  insurance_health: 60000/12 × 0.015 = 75.00
  insurance_car:    24000/12 × 0.015 = 30.00
  life_insurance:   24000/12 × 0.015 = 30.00
  fuel: 0, rent: 0

Approx monthly: 1000 (capped accelerated) + 725 (default) = ~₹1,725
Yearly: ~₹20,700
```

### Shape

Each response must match the real API shape from `api response pretty.json`:

```typescript
interface CalculateResponse {
  card_name: string;
  card_alias: string;
  bank_name: string;
  card_type: string;
  total_savings: number;         // monthly (reward points/cashback only)
  total_savings_yearly: number;
  total_extra_benefits: number;  // milestone value etc (annual)
  roi: number;                   // total_savings_yearly + lounge + milestones - fee
  annual_fees: string;           // "11800"
  annual_fee_without_gst: string;
  annual_fee_spends: string;     // waiver threshold, e.g. "500000"
  annual_fee_waiver_toggle: number;
  card_max_cap: string | null;   // "75000" or null
  travel_benefits: {
    domestic_lounge_benefits_annual: number;
    international_lounge_benefits_annual: number;
    railway_lounge_beneftis_annual: number;   // note: typo matches real API
    domestic_lounges_unlocked: number;
    international_lounges_unlocked: number;
    railway_lounges_unlocked: number;
    total_travel_benefit_annual: number;
  };
  milestone_benefits: Array<{
    minSpend: string;
    maxDays: string;
    rpBonus: string;
    voucherBonus: string;
    brand: string;
    cash_conversion: string;
    eligible: boolean;
  }>;
  welcomeBenefits: Array<{
    brands: Array<{ id: number; name: string }>;
    voucher_bonus: string;
    cash_value: number;
    maximum_days: string;
    minimum_spend: string;
  }>;
  spending_breakdown: Record<string, {
    on: string;
    spend: number;               // monthly (annual/12 for annual buckets)
    savings: number;             // monthly ₹ value
    savings_type: "points" | "cashback";
    points_earned: number;       // raw RP (0 for cashback cards)
    maxCap: number | "Unlimited";
    totalMaxCap: number | "Unlimited";
    maxCapReached: boolean;
    explanation: Array<{ key: "monthly" | "annual"; explanation: string }>;
    conv_rate: number;
    spend_conversion: number;
  }>;
}
// Shape matches data/api response pretty.json exactly.
// See lines 1-1041 (HDFC Diners Black) and 1042-end (Axis Magnus) for real examples.
```

Include ALL 30+ buckets (21 input + ~10 response-only with spend=0, savings=0).

### 2B. /recommend_cards response

**Data source priority: MCP call > data/api response pretty.json > invented numbers**

Two sources available:
1. **`data/api response pretty.json`** — real API response with HDFC Diners Black (#1) and Axis Magnus Burgundy (#2)
2. **CardGenius MCP** — call `mcp__claude_ai_Great_cards__recommend_cards` with the SPEND_PROFILE to get a live response

At implementation time: call the MCP tool with all 21 spend fields to get a fresh response. This returns the exact JSON shape needed — `spending_breakdown`, `travel_benefits`, `milestone_benefits`, `welcomeBenefits`, `redemption_options`, `product_usps`, URLs, images, everything.

From the real API response (data/api response pretty.json), the top 2 cards are:

**Card 1: HDFC Diners Black** (id 78)
- total_savings_yearly: ₹78,501
- total_extra_benefits: ₹6,000 (milestone vouchers)
- travel_benefits.total_travel_benefit_annual: ₹10,500
- roi: ₹95,001
- annual_fee: ₹11,800 (₹10,000 + GST), waiver at ₹5L
- 75,000 RP card_max_cap (annual)
- spending_breakdown: 30+ buckets with per-bucket savings, caps, explanations

**Card 2: Axis Magnus Burgundy** (id 173)
- total_savings_yearly: ₹1,17,854
- travel_benefits.total_travel_benefit_annual: ₹10,500
- roi: ₹92,954
- annual_fee: ₹35,400 (₹30,000 + GST), waiver at ₹25L
- Unlimited max_cap
- spending_breakdown: 30+ buckets

These cards replace ALL hardcoded market card references across the app (see "Market Card Recommendation Mapping" section below).

### 2C. Market Card Recommendation Mapping

Every hardcoded "HDFC Infinia" / "Amex Platinum" reference must be replaced with the #1 card from /recommend_cards:

| Current hardcoded | Location | Replace with |
|---|---|---|
| "HDFC Infinia" at ₹150K | `optimize.ts` SAVINGS_COMP[0] | recommend_cards.savings[0] — card name + total_savings_yearly |
| "HDFC Infinia" bestCard/bestSaved | `cardDetail.ts` CD[0/1/2] | recommend_cards.savings[0].card_name + roi |
| Amex promo banner | `LegacyShared.tsx` CardPromo | recommend_cards.savings[0].image + card_bg_image |
| "₹1,00,845/year" promo text | `LegacyShared.tsx:322` | recommend_cards.savings[0].total_savings_yearly |
| "SWIGGY BLCK" / "HDFC BANK" | `LegacyOptimiseScreen.tsx:254-255` | recommend_cards.savings[0].card_name + bank_name |
| 20 inline BEST_CARDS | `BestCardsScreen.tsx:38-83` | All cards from recommend_cards.savings[] |
| "HDFC Infinia" in CARD_DET | `BestCardsScreen.tsx:92` | Build from recommend_cards.savings[0] benefits/fees |
| "HDFC Infinia" in TxnSheet market card | `BottomSheets.tsx` | Best card for specific bucket from recommend_cards |
| "Get HDFC Infinia & earn ₹X more" tag | `transactions.ts:8` tg() tier-3 | recommend_cards.savings[0].card_name + actual delta |
| Comparison bar chart user card values | `BestCardsScreen.tsx:137-141` | User cards from calculateResponses[].total_savings_yearly |

**For TxnSheet "best market card"**: Don't always show the #1 overall card. Show the card with highest savings for THAT specific bucket. Compare `recommend_cards.savings[i].spending_breakdown[bucket].savings` across all recommended cards and pick the best per bucket.

---

## File 3: `src/data/simulation/compute.ts`

### 3A. Core Savings

```typescript
function computeCurrentSavings(): number
// For each bucket: savings from calculateResponses[ACTUAL_CARD_USAGE[bucket]]
// Sum × 12. This is what the user actually earns.

function computeOptimizedSavings(): { total: number; assignment: Record<string, number> }
// For each bucket: max(savings) across 3 owned cards. Sum × 12.

function computeUltimateSavings(): { total: number; assignment: Record<string, number | "market"> }
// For each bucket: max(savings) across 3 owned + #1 recommended. Sum × 12.

function getSavingsBars(): {
  bar1: number;          // Current
  bar2: number;          // Optimized
  bar3: number;          // Ultimate
  flow1_delta: number;   // bar2 - bar1 ("Use existing cards right")
  flow2_delta: number;   // bar3 - bar1 ("Get the ultimate card")
  ultimate_uplift: number; // bar3 - bar2 ("Save Extra ₹X")
}
```

### 3A-bis. Combined Savings (Audit #97, Gap G14)

`combSavings` on Best Cards screen = optimal multi-card allocation across user's cards + top recommended:

```typescript
function computeCombinedSavings(topN: number = 2): number {
  // Take the top N recommended cards
  const marketCards = recommendResponse.savings.slice(0, topN);
  // For each bucket, find max savings across ALL candidates (3 user + topN market)
  let total = 0;
  for (const bucket of ALL_BUCKETS) {
    const allSavings = [
      ...calculateResponses.map(r => r.spending_breakdown[bucket]?.savings ?? 0),
      ...marketCards.map(r => r.spending_breakdown[bucket]?.savings ?? 0),
    ];
    total += Math.max(...allSavings);
  }
  // Add lounge benefits from the card with best travel_benefits
  const bestLounge = Math.max(
    ...calculateResponses.map(r => r.travel_benefits?.total_travel_benefit_annual ?? 0),
    ...marketCards.map(r => r.travel_benefits?.total_travel_benefit_annual ?? 0),
  );
  return total * 12 + bestLounge;
}
```

### 3B. Transaction Generator

Generate ~100 synthetic transactions consistent with SPEND_PROFILE. Each transaction:

```typescript
interface SimTransaction {
  brand: string;           // merchant name
  icon: string;            // emoji
  amt: number;             // amount
  date: string;            // "DD Mon" format
  via: string;             // card name (e.g., "Axis Flipkart Card")
  saved: number | null;    // computed, not hardcoded
  missed: number | null;   // computed, not hardcoded
  tag: string;             // computed tag text
  tagColor: string;
  tagBg: string;
  card: string;            // same as via
  last4: string;
  bank: string;
  unaccounted: boolean;
  sms: string | null;
  // New fields for simulation
  bucket: string;          // API bucket
  category: string;        // user-facing category
  card_index: number;      // 0, 1, 2
}
```

Must match the existing `ALL_TXNS` shape so screens don't break.

Distribution: Allocate transactions proportional to spend profile. ~8% unaccounted, ~3% excluded.

### 3C. Per-Transaction Savings

Replace ALL hardcoded percentage fallbacks:

| Location | Current hardcoded | Replace with |
|---|---|---|
| `CardDetailScreen.tsx:89` | `Math.round(t.amt * 0.03)` | `(bestCardSavings - thisCardSavings) / bucketSpend × txnAmt` |
| `BottomSheets.tsx` TxnSheet | `Math.round(txnSheet.amt * 0.05)` | actual wallet delta from compute |
| `BottomSheets.tsx` TxnSheet | `Math.round(txnSheet.amt * 0.1)` | actual market delta from compute |
| `BottomSheets.tsx` CatBS tagging | `Math.round(amt * 0.02)` | actual bucket rate after category assigned |

### 3D. Actions Generator

Compute from card state + /calculate responses:

1. **Cap breach**: Axis Flipkart's flipkart_spends will hit cap at ₹1,333/mo if spend > ₹26,660/mo. At ₹7K/mo, won't hit. BUT HSBC Live+ shared cap WILL hit (₹3,333 uncapped vs ₹1,000 cap). Generate: "Dining/food/grocery rewards capped on HSBC Live+. Switch to [alt card]."
2. **Fee waiver**: HSBC Travel One: ₹8L threshold. At ~₹1.33L/mo total spend on this card (from ACTUAL_USAGE), ~10 months of use = ₹13.3L YTD (since June 2025). Likely already waived. Axis Flipkart: ₹3.5L threshold, ~₹15K/mo assigned = ₹180K in ~12mo. Short by ~₹170K.
3. **Points expiring**: HSBC Travel One: 2,200 RP in 18 days = ₹440 value.
4. **Credit utilization**: Travel One 87K/300K = 29% (OK). Axis 53K/150K = 35% (OK). Live+ 42K/200K = 21% (OK). None triggers >70%.
5. **Milestone**: Travel One ₹12L milestone. Check YTD spend.
6. **Wasted spend**: fuel bucket (₹6K/mo, 0% on all cards). rent bucket (₹45.7K/mo, 0% on all).

### 3E. Category/Brand Breakdowns

Derive from transactions:
- Group by `category`, sum amounts, compute percentage of TOTAL_ANNUAL_SPEND
- Group by `brand` (merchant_name), sum amounts, compute percentage
- Return same shape as existing `SPEND_CATS` and `SPEND_BRANDS`

### 3F. Card Quality

```typescript
function computeCardQuality(cardIndex: number): string {
  const cardYearly = calculateResponses[cardIndex].total_savings_yearly;
  const marketBest = recommendResponse.savings[0].total_savings_yearly;
  const ratio = cardYearly / marketBest;
  if (ratio >= 0.8) return "Great";
  if (ratio >= 0.5) return "Good";
  if (ratio >= 0.3) return "Average";
  return "Below Average";
}
```

### 3G. Match Score

```typescript
function computeMatchScore(marketCard): number {
  // Top 5 buckets by spend
  // Score = (card's savings on those 5) / (best-possible savings on those 5) × 100
}
```

### 3H. Redemption Data

For each card, return:
- `points_name`: "Cashback" for Live+/Flipkart, "Reward Points" for Travel One
- `balance`: from card state
- `value_per_point`: conv_rate
- `redemption_options`: from /recommend_cards `redemption_options[]` if card is in market response, otherwise build from CardGenius data

---

## File 4: `src/data/simulation/legacy.ts`

Re-export under existing names so NO screen code changes.

### Exports to preserve (existing shape, new computed content):

| Export | From | New Source |
|---|---|---|
| `CARDS` | `cards.ts` | Build from `USER_CARDS` — same shape: `{name, last4, color, accent, headerAccent, quality, availPts, ptName}` |
| `SEMI_CARDS` | `cards.ts` | Build from `USER_CARDS` — same shape: `{bank, last4, color}` |
| `ALL_TXNS` | `transactions.ts` | Generated transactions with computed saved/missed/tags |
| `br` | `transactions.ts` | Merchant name array (from BUCKET_TO_MERCHANT) |
| `ic` | `transactions.ts` | Icon array (matching br) |
| `tg` | `transactions.ts` | Tag generator function — now uses real savings deltas |
| `SPEND_CATS` | `spend.ts` | Derived from transactions grouped by category |
| `SPEND_BRANDS` | `spend.ts` | Derived from transactions grouped by merchant |
| `TOTAL_ACC` | `spend.ts` | `TOTAL_ANNUAL_SPEND` = 1,600,000 |
| `CD` | `cardDetail.ts` | 3-element array built from /calculate responses + card state |
| `CD_BRANDS` | `cardDetail.ts` | From /calculate spending_breakdown, mapped to merchants |
| `CD_CATS` | `cardDetail.ts` | From /calculate spending_breakdown, mapped to categories |
| `BANK_FEES` | `cardDetail.ts` | Static — keep as-is (no API source, Gap G3) |
| `LATE_FEES` | `cardDetail.ts` | Static — keep as-is |
| `CALC_CARDS` | `calculator.ts` | Rebuilt with verified rates from CardGenius |
| `CALC_BRANDS` | `calculator.ts` | Keep structure, rates now consistent with /calculate |
| `CALC_CATS` | `calculator.ts` | Keep structure |
| `CAT_OPTIONS` | `calculator.ts` | Static — keep |
| `BRAND_MAP` | `calculator.ts` | Static — keep |
| `ACTIONS` | `actions.ts` | First 3 computed actions |
| `ALL_ACTIONS` | `actions.ts` | All computed actions |
| `SMS_ACTIONS` | `actions.ts` | Filtered for SMS-only state |

### Inline data to extract from screens:

| Data | Screen File | Line(s) | Action |
|---|---|---|---|
| `BEST_CARDS` array | `BestCardsScreen.tsx` | 38-83 | Replace with data built from /recommend_cards response |
| `CARD_DET` object | `BestCardsScreen.tsx` | 91-96 | Replace with data built from /recommend_cards benefits/fees |
| `ACTIONS_DATA` array | `ActionsScreen.tsx` | 20-28 | Import from computed actions |
| `BEST_FOR_BRAND` object | `CardDetailScreen.tsx` | 81 | Compute from optimized assignment |
| `bestCardFor` object | `transactions.ts` | 7 | Compute from optimized assignment |
| Hardcoded hero values | `LegacyShared.tsx` | 700, 707, 711 | Import from `getSavingsBars()` |
| Hardcoded bar values | `LegacyShared.tsx` | 310-312 | Import from `getSavingsBars()` |
| Hardcoded analysis data | `LegacyShared.tsx` | 327-344 | Import from category/brand breakdowns |
| Hardcoded ₹15,40,250 | `LegacyShared.tsx` | 385 | Import `TOTAL_ACC` |
| Hardcoded optimize bars | `LegacyOptimiseScreen.tsx` | 110, 116-118 | Import from savings bars |
| Hardcoded distribution | `LegacyOptimiseScreen.tsx` | 355-370 | Import from spend distribution |
| Hardcoded card panels | `LegacyOptimiseScreen.tsx` | 509-546 | Import from optimized assignment |

---

## Known Approximations

1. **Axis Flipkart caps**: Real caps are ₹4K/quarter/merchant. Simulation approximates as ₹1,333/mo/bucket. Myntra (7.5%) falls inside `other_online_spends` and can't be separated from the bucket — the simulation will apply 1% to the entire bucket and note Myntra as a special case.

2. **HSBC Live+ shared cap**: ₹1K/mo shared across 4 buckets. Simulation distributes proportionally to uncapped savings in those buckets.

3. **HSBC Travel One accelerated RP cap**: 50,000 RP/mo on travel. At spend of ~₹13.3K/mo on flights+hotels, earns ~533 RP/mo. Cap of 50K won't bind. But model it for correctness.

3b. **Fuel surcharge waiver**: Axis Flipkart has 1% waiver on ₹400-₹4K fuel txns (max ₹400/cycle). This is a savings benefit but NOT modeled in spending_breakdown.savings — it's a separate line item. The simulation should include it in `total_extra_benefits` or as a card-level annotation, not per-bucket rewards.

4. **Welcome benefit status**: All 3 cards have activation dates in the past. For simulation: Travel One (activated Jun 2025, 30-day window expired, ₹10K threshold — mark "Claimed" since user likely spent >₹10K in first month). Flipkart (activated Mar 2025, "Claimed"). Live+ (activated Nov 2024, "Claimed").

5. **CALC_CARDS rates outdated**: Current `calculator.ts` has wrong rates (Travel One default 0.5%, real is 0.4%; Flipkart default 1.5%, real is 1%). The simulation replaces these with verified rates.

---

## Validation Checklist

After implementation, verify:

- [ ] `TOTAL_ANNUAL_SPEND` = 1,600,000 (not 1,500,250)
- [ ] Bar 1 < Bar 2 < Bar 3
- [ ] `flow1_delta` = Bar 2 - Bar 1
- [ ] `flow2_delta` = Bar 3 - Bar 1
- [ ] `ultimate_uplift` = Bar 3 - Bar 2
- [ ] HSBC Live+ shared cap fires (3,333 uncapped → 1,000 capped)
- [ ] HSBC Travel One points expiring action fires (2,200 RP, 18 days)
- [ ] Wasted spend actions for fuel (₹6K/mo, 0% all cards) and rent (₹45.7K/mo)
- [ ] No hardcoded % fallbacks remain (0.03, 0.05, 0.10, 0.02)
- [ ] Category percentages from transactions sum to 100%
- [ ] All 30+ buckets present in each /calculate response
- [ ] `CARDS`, `SEMI_CARDS`, `ALL_TXNS` shapes unchanged (screens don't break)
- [ ] `CALC_CARDS` rates match CardGenius verified data
- [ ] Axis Flipkart fee waiver shows ₹3.5L (not ₹2L)
- [ ] HSBC Travel One fee shows ₹5,899 (not ₹3,481)
- [ ] HSBC Live+ treated as cashback everywhere (not points)
- [ ] flights_annual and hotels_annual are SEPARATE buckets everywhere (not combined "travel")
- [ ] Insurance buckets earn 1% on Axis Flipkart (not zero)
- [ ] Fuel surcharge waiver modeled separately from reward savings on Axis Flipkart
- [ ] Lounge values come from travel_benefits (annual top-level), NOT hand-divided in spending_breakdown
- [ ] No hardcoded "HDFC Infinia" or "Amex Platinum" — all from recommend_cards response
- [ ] CardPromo image/text from recommend_cards.savings[0].image + total_savings_yearly
- [ ] `combSavings` computed from multi-card optimal allocation, not hardcoded 100000
- [ ] TxnSheet market card is best-for-bucket, not always overall #1
- [ ] API response shape matches data/api response pretty.json (travel_benefits, milestone_benefits, etc.)
