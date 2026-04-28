// @ts-nocheck

// ─── Spend Profile (from data/api request.json — verified) ─────────────────
export const SPEND_PROFILE = {
  amazon_spends: 5000,
  flipkart_spends: 7000,
  other_online_spends: 4000,
  other_offline_spends: 4000,
  grocery_spends_online: 8000,
  offline_grocery: 7000,
  online_food_ordering: 8333,
  cab_rides: 0,
  fuel: 6000,
  dining_or_going_out: 10000,
  mobile_phone_bills: 1500,
  electricity_bills: 3000,
  water_bills: 1500,
  flights_annual: 100000,
  hotels_annual: 60000,
  insurance_health_annual: 60000,
  insurance_car_or_bike_annual: 24000,
  life_insurance: 24000,
  school_fees: 0,
  rent: 45667,
  domestic_lounge_usage_quarterly: 2.25,
  international_lounge_usage_quarterly: 0.75,
};

// ─── Bucket Metadata ───────────────────────────────────────────────────────
export const ANNUAL_BUCKETS = [
  "flights_annual", "hotels_annual", "insurance_health_annual",
  "insurance_car_or_bike_annual", "life_insurance", "school_fees",
];

export const LOUNGE_BUCKETS = [
  "domestic_lounge_usage_quarterly", "international_lounge_usage_quarterly",
];

export const LOUNGE_REFERENCE = { domestic_per_visit: 750, international_per_visit: 1250 };

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
  online_food_ordering: "Dining",
  cab_rides: "Cab Rides",
  dining_or_going_out: "Dining",
  fuel: "Fuel",
  mobile_phone_bills: "Bills",
  electricity_bills: "Bills",
  water_bills: "Bills",
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
  cab_rides: ["Uber"],
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

// Reverse map: merchant name → bucket key.
// Derived from BUCKET_TO_MERCHANT. If a merchant appears in multiple buckets
// (e.g. MakeMyTrip in flights_annual & hotels_annual), the FIRST occurrence wins.
// Use BUCKET_TO_MERCHANT directly if you need the full multi-bucket mapping.
export const MERCHANT_TO_BUCKET: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [bucket, merchants] of Object.entries(BUCKET_TO_MERCHANT)) {
    for (const m of merchants) {
      if (!(m in map)) map[m] = bucket;
    }
  }
  return map;
})();

export const MERCHANT_ICONS: Record<string, string> = {
  Amazon: "📦", Flipkart: "🛒", Myntra: "👗", Nykaa: "🩷", Ajio: "👔",
  BookMyShow: "🎬", "Urban Company": "🏠", Lenskart: "👓",
  Croma: "📱", "Reliance Digital": "🛍️", Decathlon: "🏋️", IKEA: "🛋️",
  BigBasket: "🥦", Blinkit: "🟡", Zepto: "🟣", "Swiggy Instamart": "🟠",
  DMart: "🛒", "Nature's Basket": "🍎", "Local Store": "🏪",
  Swiggy: "🍔", Zomato: "🍕", Dominos: "🍕", Uber: "🚕",
  Shell: "⛽", "HP Petrol": "⛽", "Indian Oil": "⛽",
  Starbucks: "☕", "McDonald's": "🍔", Restaurant: "🍽️",
  Jio: "🔵", Airtel: "🔴",
  "Electricity Board": "⚡", "Water Board": "💧",
  "CRED RentPay": "🏠", NoBroker: "🏠",
  MakeMyTrip: "✈️", IndiGo: "✈️", Cleartrip: "🔵",
  OYO: "🏨", "Booking.com": "🏨",
  "Star Health": "🛡️", "ICICI Lombard": "🛡️", LIC: "🛡️",
};

// ─── Card Portfolio (verified via CardGenius MCP 2026-04-26) ────────────────
export const USER_CARDS = [
  {
    index: 0,
    name: "HSBC Travel One",
    card_alias: "hsbc-travel-one",
    bank: "HSBC",
    last4: "7891",
    color: "#0c2340",
    accent: "#1a5276",
    headerAccent: "#1a5276",
    card_type: "Mastercard",
    image: "/legacy-assets/cards/hsbc-travel-one.webp",

    savings_type: "points" as const,
    ptName: "Reward Points",
    // Spec: base 2 RP/₹100 unlimited; flights 16 RP/₹100 cap 1800 RP/mo; hotels 24 RP/₹100 cap 1800 RP/mo.
    // (Per-bucket RP + cap are enforced in mockApi.ts)
    reward_rates: { default: 0.004 },
    rp_per_100: { flights_annual: 16, hotels_annual: 24, default: 2 },
    conv_rate: 0.20,
    spend_conversion: 100,
    travel_rp_cap_monthly: 1800,

    zero_buckets: ["fuel", "rent"],

    activation_date: "2025-06-15",
    points_balance: 12400,
    points_expiring: { amount: 2200, days_until: 18 },
    credit_limit: 300000,
    credit_used: 87000,

    annual_fee: 4999,
    annual_fee_incl_gst: "₹5,899 (incl. GST)",
    fee_waiver_threshold: 800000,
    joining_fee: "₹5,899 (incl. GST)",

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

    quality: "Average",
    availPts: 12400,
  },
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
    image: "/legacy-assets/cards/axis-flipkart.webp",

    savings_type: "cashback" as const,
    ptName: "Cashback",
    // Spec: base 1% unlimited; Flipkart 5% cap ₹4000/mo; Myntra 7.5% cap ₹4000/mo;
    // Hotels+Flights 5% cap ₹4000/mo; Swiggy 4% unlimited; Uber 4% unlimited.
    reward_rates: {
      flipkart_spends: 0.05,
      myntra: 0.075,
      flights_annual: 0.05,
      hotels_annual: 0.05,
      online_food_ordering: 0.04,
      cab_rides: 0.04,
      default: 0.01,
    },
    conv_rate: 1.0,
    spend_conversion: 0,

    bucket_caps: {
      flipkart_spends: 4000,
      myntra: 4000,
      flights_annual: 4000,
      hotels_annual: 4000,
    },

    preferred_buckets: [],
    zero_buckets: ["fuel", "rent", "school_fees"],
    fuel_surcharge_waiver: { rate: 0.01, min_txn: 400, max_txn: 4000, max_per_cycle: 400 },

    activation_date: "2025-03-20",
    points_balance: 0,
    points_expiring: null,
    credit_limit: 150000,
    credit_used: 53000,

    annual_fee: 500,
    annual_fee_incl_gst: "₹590 (incl. GST)",
    fee_waiver_threshold: 350000,
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
  },
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
    image: "/legacy-assets/cards/hsbc-live.webp",

    savings_type: "cashback" as const,
    ptName: "Cashback",
    reward_rates: { accelerated: 0.10, default: 0.015 },
    conv_rate: 1.0,
    spend_conversion: 0,

    shared_cap: {
      amount: 1000,
      buckets: ["dining_or_going_out", "online_food_ordering", "grocery_spends_online", "offline_grocery"],
    },

    zero_buckets: ["fuel", "rent"],

    activation_date: "2024-11-10",
    points_balance: 0,
    points_expiring: null,
    credit_limit: 200000,
    credit_used: 42000,

    annual_fee: 999,
    annual_fee_incl_gst: "₹1,179 (incl. GST)",
    fee_waiver_threshold: 200000,
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
  },
];

// ─── Actual Card Usage per Bucket (intentionally suboptimal) ────────────────
export const ACTUAL_CARD_USAGE: Record<string, number> = {
  amazon_spends: 1,
  flipkart_spends: 1,
  other_online_spends: 0,
  other_offline_spends: 0,
  grocery_spends_online: 0,
  offline_grocery: 0,
  online_food_ordering: 1,
  fuel: 0,
  dining_or_going_out: 0,
  mobile_phone_bills: 2,
  electricity_bills: 2,
  water_bills: 2,
  rent: 0,
  school_fees: 0,
  flights_annual: 0,
  hotels_annual: 0,
  insurance_health_annual: 0,
  insurance_car_or_bike_annual: 0,
  life_insurance: 0,
  domestic_lounge_usage_quarterly: 0,
  international_lounge_usage_quarterly: 0,
};

// ─── Derived Constants ──────────────────────────────────────────────────────
const monthlyBuckets = Object.entries(SPEND_PROFILE).filter(
  ([k]) => !ANNUAL_BUCKETS.includes(k) && !LOUNGE_BUCKETS.includes(k)
);
export const TOTAL_MONTHLY_SPEND = monthlyBuckets.reduce((s, [, v]) => s + v, 0);
export const TOTAL_ANNUAL_SPEND = 1600000;

export const ALL_INPUT_BUCKETS = Object.keys(SPEND_PROFILE);
export const ALL_BUCKETS = [...ALL_INPUT_BUCKETS, ...RESPONSE_ONLY_BUCKETS];
