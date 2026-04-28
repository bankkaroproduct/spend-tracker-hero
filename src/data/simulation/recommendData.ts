// @ts-nocheck
// Real MCP response from recommend_cards (25 cards, 31 buckets each)
// Source: data/recommendCards_25_fixture.json — captured 2026-04-28
import fixtureData from "@/data/fixtures/recommendCards.json";

function parseMoney(s: any): number {
  if (typeof s === "number") return s;
  if (!s) return 0;
  const cleaned = String(s).replace(/[^0-9.]/g, "");
  return cleaned ? Math.round(parseFloat(cleaned)) : 0;
}

function normalizeProductRules(card: any) {
  const alias = String(card.card_alias || card.seo_card_alias || "").toLowerCase();
  if (!alias.includes("hdfc-diners-club-black-metal")) return card;

  return {
    ...card,
    card_max_cap: "75000",
    welcomeBenefits: [
      ...(Array.isArray(card.welcomeBenefits) ? card.welcomeBenefits : []),
      {
        description: "Spend ₹1,50,000 within 90 days and get ₹25,000 worth of vouchers from Club Marriott, Amazon Prime, and Swiggy One.",
        voucher_bonus: "25000",
        cash_value: 25000,
        minimum_spend: 150000,
        maximum_days: 90,
      },
    ],
    milestone_benefits: [
      ...(Array.isArray(card.milestone_benefits) ? card.milestone_benefits : []),
      {
        minSpend: 400000,
        minimum_spend: 400000,
        max_days: 90,
        reward: "10,000 Reward Points",
        value: 10000,
      },
    ],
    travel_benefits: {
      ...(card.travel_benefits || {}),
      domestic_lounge_access: "Unlimited complimentary domestic lounge access",
      international_lounge_access: "Unlimited complimentary international lounge access",
    },
    food_dining_benefits: [
      ...(Array.isArray(card.food_dining_benefits) ? card.food_dining_benefits : []),
      {
        offer: "10% dining discount",
        frequency: "1 time per month",
        minimum_order_value: 3000,
        max_discount: 800,
      },
    ],
  };
}

const enriched = (fixtureData.recommendations || []).map((rawCard: any) => {
  const card = normalizeProductRules(rawCard);
  const bd = card.spending_breakdown || {};
  const totalMonthly = Object.values(bd).reduce((s: number, b: any) => s + (b?.savings || 0), 0);
  const totalYearly = Math.round(totalMonthly * 12);
  const fee = parseMoney(card.annual_fee);
  return {
    ...card,
    total_savings: Math.round(totalMonthly),
    total_savings_yearly: totalYearly,
    annual_fees: card.annual_fee,
    annual_fee_without_gst: String(Math.round(fee / 1.18)),
  };
});

export const RECOMMEND_CARDS_DATA = {
  total_cards_analyzed: fixtureData.total_cards_analyzed,
  savings: enriched,
};
