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

const enriched = (fixtureData.recommendations || []).map((card: any) => {
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
