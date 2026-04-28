import { describe, expect, it } from "vitest";
import {
  selectBestCardBreakdownMetrics,
  selectBestCardsCombinedSavings,
  selectBestCardsListMetrics,
  selectOptimizeMetrics,
  selectPortfolioMetrics,
  selectSavingsBars,
  selectSpendAnalysisMetrics,
  selectSpendDistributionMetrics,
  selectSummaryMetrics,
  selectTransactionMetrics,
  selectCalculatorMetrics,
  calculateRewardsForInput,
} from "./metrics";
import { getTransactionScenario } from "./txnScenario";
import { getCardRewardForSpend, recommendResponse } from "./mockApi";

describe("canonical metrics invariants", () => {
  it("shares current, optimized, and ultimate savings totals across summary and optimize selectors", () => {
    const summary = selectSummaryMetrics();
    const bars = selectSavingsBars();
    const optimize = selectOptimizeMetrics();

    expect(bars.bar1).toBe(summary.currentSavings);
    expect(bars.bar2).toBe(summary.optimizedSavings);
    expect(bars.bar3).toBe(summary.ultimateSavings);
    expect(optimize.bars.bar1).toBe(summary.currentSavings);
    expect(optimize.bars.bar2).toBe(summary.optimizedSavings);
    expect(optimize.bars.bar3).toBe(summary.ultimateSavings);
  });

  it("reconciles spend distributions to the canonical annual spend total", () => {
    const total = selectSpendAnalysisMetrics().totalSpend;
    const withUltimate = selectSpendDistributionMetrics(true);
    const withoutUltimate = selectSpendDistributionMetrics(false);

    expect(withUltimate.reduce((sum, row) => sum + row.spend, 0)).toBe(total);
    expect(withoutUltimate.reduce((sum, row) => sum + row.spend, 0)).toBe(total);
  });

  it("reconciles portfolio per-card savings to spends plus milestones minus fees", () => {
    const portfolio = selectPortfolioMetrics();
    const cardSpendTotal = portfolio.cards.reduce((sum, row) => sum + row.spend, 0);

    expect(cardSpendTotal).toBe(portfolio.totalSpend);
    for (const card of portfolio.cards) {
      const b = card.breakdown;
      expect(b.savingsOnSpends + b.milestoneBenefits - b.annualFee).toBe(card.save);
    }
  });

  it("uses scenario outputs for per-transaction saved, missed, and market uplift", () => {
    const txns = selectTransactionMetrics().transactions;

    for (const txn of txns) {
      const scenario = getTransactionScenario(txn);
      expect(txn.saved || 0).toBe(scenario.actualSavings || 0);
      expect(txn.missed || 0).toBe(scenario.walletDelta || 0);
      expect(txn.marketUplift || 0).toBe(scenario.marketDelta || 0);
    }
  });

  it("defines best-card combined savings once and reuses the same value in table rows", () => {
    const cards = selectBestCardsListMetrics();
    expect(selectBestCardsCombinedSavings(2)).toBeGreaterThan(0);
    for (const card of cards.slice(0, 5)) {
      const row = selectBestCardBreakdownMetrics(card);
      expect(row.combined).toBe(row.thisCard + row.onAxisFlipkart + row.onHSBCTravelOne + row.onHSBCLivePlus);
    }
  });

  it("applies owned-card product rules including merchant-specific caps", () => {
    const calc = selectCalculatorMetrics();
    const axis = calc.cards.find((card: any) => card.name === "Axis Flipkart");
    expect(axis?.rates.Myntra).toBe(7.5);

    const axisMyntra = calculateRewardsForInput(10000, "Myntra", false).find((card: any) => card.name === "Axis Flipkart");
    expect(axisMyntra?.saved).toBe(750);

    const axisMyntraCapped = calculateRewardsForInput(100000, "Myntra", false).find((card: any) => card.name === "Axis Flipkart");
    expect(axisMyntraCapped?.saved).toBe(4000);
    expect(axisMyntraCapped?.maxCapReached).toBe(true);

    const travelFlight = getCardRewardForSpend(0, 100000, "flights_annual", "MakeMyTrip");
    expect(travelFlight.points_earned).toBe(1800);
    expect(travelFlight.savings).toBe(360);

    const axisFlight = getCardRewardForSpend(1, 100000, "flights_annual", "MakeMyTrip");
    expect(axisFlight.savings).toBe(4000);

    const liveGrocery = getCardRewardForSpend(2, 20000, "grocery_spends_online", "BigBasket");
    expect(liveGrocery.savings).toBe(1000);
  });

  it("keeps HDFC Diners Club Black Metal market-card rules from fixture plus supplied overrides", () => {
    const card = recommendResponse.savings.find((c: any) => /black metal/i.test(c.card_name || ""));
    expect(card).toBeTruthy();
    expect(String(card.card_max_cap)).toBe("75000");
    expect(card.spending_breakdown.grocery_spends_online.maxCap).toBe(2000);
    expect(card.spending_breakdown.school_fees.maxCap).toBe(2000);
    expect(card.spending_breakdown.electricity_bills.maxCap).toBe(2000);
    expect(card.spending_breakdown.dining_or_going_out.maxCap).toBe(1000);
    expect(card.spending_breakdown.flights_annual.maxCap).toBe(10000);
    expect(card.spending_breakdown.hotels_annual.maxCap).toBe(10000);
    expect(card.spending_breakdown.insurance_health_annual.maxCap).toBe(5000);
    expect(card.welcomeBenefits.some((b: any) => Number(b.cash_value || b.voucher_bonus || 0) === 25000)).toBe(true);
    expect(card.milestone_benefits.some((b: any) => Number(b.value || 0) === 10000 && Number(b.minSpend || b.minimum_spend || 0) === 400000)).toBe(true);
  });
});
