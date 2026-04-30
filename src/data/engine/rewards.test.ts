import { describe, expect, it } from "vitest";
import type { CardRuleSet } from "../domain/types";
import { USER_CARDS } from "../simulation/inputs";
import { adaptUserCard } from "../integrations/mockAdapter";
import { adaptCardGeniusCard, excludeOwnedCardResponses } from "../integrations/cardGeniusAdapter";
import { calculateReward, calculateRewards, validateUniqueRewardRules } from "./rewards";
import { calculateCardSavings, excludeOwnedCards } from "./portfolio";
import { bestCardForSpend } from "./portfolio";
import { calculateTransactionOutcome } from "./transactions";
import { reconcileParts } from "./reconcile";

const axisLike: CardRuleSet = {
  cardAlias: "axis-flipkart",
  displayName: "Axis Flipkart",
  annualFee: 500,
  rules: [
    {
      bucket: "fashion",
      merchant: "myntra",
      rewardKind: "cashback",
      rate: 7.5,
      rateBasis: "percent",
      cap: { amount: 4000, period: "monthly", scope: "bucket" },
    },
    {
      bucket: "fashion",
      rewardKind: "cashback",
      rate: 1,
      rateBasis: "percent",
    },
  ],
};

const baseCard: CardRuleSet = {
  cardAlias: "base-card",
  displayName: "Base Card",
  rules: [{ bucket: "fashion", rewardKind: "cashback", rate: 1, rateBasis: "percent" }],
};

describe("v2 reward engine", () => {
  it("applies merchant-specific rewards and caps", () => {
    const small = calculateReward(axisLike, { bucket: "fashion", merchant: "myntra", amount: 10000, period: "yearly" });
    expect(small.cappedSavings).toBe(750);
    expect(small.capReached).toBe(false);

    const large = calculateReward(axisLike, { bucket: "fashion", merchant: "myntra", amount: 1000000, period: "yearly" });
    expect(large.cappedSavings).toBe(48000);
    expect(large.capReached).toBe(true);
  });

  it("exposes gross, net, and annual fee separately", () => {
    const summary = calculateCardSavings(axisLike, [{ bucket: "fashion", merchant: "myntra", amount: 10000, period: "yearly" }]);
    expect(summary.grossSavings).toBe(750);
    expect(summary.annualFee).toBe(500);
    expect(summary.netSavings).toBe(250);
  });

  it("excludes owned cards from market recommendations", () => {
    expect(excludeOwnedCards([axisLike, baseCard], ["axis-flipkart"])).toEqual([baseCard]);
  });

  it("computes transaction missed savings proportionally to amount", () => {
    const outcome = calculateTransactionOutcome(
      { id: "txn_1", amount: 10000, bucket: "fashion", merchant: "myntra", usedCardAlias: "base-card" },
      [baseCard],
      [axisLike],
    );
    expect(outcome.saved).toBe(100);
    expect(outcome.missed).toBe(650);
    expect(outcome.bestCardAlias).toBe("axis-flipkart");
  });

  it("reconciles rounded parts to the headline total", () => {
    const parts = reconcileParts(100, [{ value: 33.4 }, { value: 33.4 }, { value: 33.4 }], "value");
    expect(parts.reduce((sum, part) => sum + part.value, 0)).toBe(100);
  });

  it("keeps fractional points/cashback values unrounded inside reward lines", () => {
    const pointsCard: CardRuleSet = {
      cardAlias: "points-card",
      displayName: "Points Card",
      rules: [{ bucket: "travel", rewardKind: "points", rate: 5, rateBasis: "per_150", conversionRate: 0.2 }],
    };
    const line = calculateReward(pointsCard, { bucket: "travel", amount: 249960, period: "yearly" });
    expect(line.pointsEarned).toBe(8332);
    expect(line.cappedSavings).toBeCloseTo(1666.4);
  });

  it("enforces shared monthly caps across accelerated buckets", () => {
    const livePlus: CardRuleSet = {
      cardAlias: "hsbc-live-plus",
      displayName: "HSBC Live+",
      rules: ["dining", "food", "grocery"].map((bucket) => ({
        bucket,
        rewardKind: "cashback" as const,
        rate: 10,
        rateBasis: "percent" as const,
        cap: { amount: 1000, period: "monthly" as const, scope: "shared" as const, sharedGroup: "live-plus-accelerated" },
      })),
    };
    const lines = calculateRewards(livePlus, [
      { bucket: "dining", amount: 120000, period: "yearly" },
      { bucket: "food", amount: 120000, period: "yearly" },
      { bucket: "grocery", amount: 120000, period: "yearly" },
    ]);
    expect(Math.round(lines.reduce((sum, line) => sum + line.cappedSavings, 0))).toBe(12000);
    expect(lines.every((line) => line.capReached)).toBe(true);
  });

  it("enforces card-level points caps after bucket rewards", () => {
    const dcb: CardRuleSet = {
      cardAlias: "hdfc-dcb-metal",
      displayName: "HDFC DCB Metal",
      cardCap: { amount: 75000, period: "yearly", scope: "card", valueKind: "points" },
      rules: [
        { bucket: "flights", rewardKind: "points", rate: 25, rateBasis: "per_150", conversionRate: 1 },
        { bucket: "hotels", rewardKind: "points", rate: 25, rateBasis: "per_150", conversionRate: 1 },
      ],
    };
    const lines = calculateRewards(dcb, [
      { bucket: "flights", amount: 300000, period: "yearly" },
      { bucket: "hotels", amount: 300000, period: "yearly" },
    ]);
    expect(Math.round(lines.reduce((sum, line) => sum + (line.cappedPointsEarned || 0), 0))).toBe(75000);
  });

  it("keeps card-level points cap savings consistent with conversion rate", () => {
    const card: CardRuleSet = {
      cardAlias: "points-cap-card",
      displayName: "Points Cap Card",
      cardCap: { amount: 1000, period: "yearly", scope: "card", valueKind: "points" },
      rules: [{ bucket: "travel", rewardKind: "points", rate: 10, rateBasis: "per_100", conversionRate: 0.2 }],
    };
    const [line] = calculateRewards(card, [{ bucket: "travel", amount: 20000, period: "yearly" }]);
    expect(Math.round(line.cappedPointsEarned || 0)).toBe(1000);
    expect(Math.round(line.cappedSavings)).toBe(200);
  });

  it("enforces shared points caps consistently", () => {
    const card: CardRuleSet = {
      cardAlias: "shared-points-card",
      displayName: "Shared Points Card",
      rules: ["dining", "food"].map((bucket) => ({
        bucket,
        rewardKind: "points" as const,
        rate: 10,
        rateBasis: "per_100" as const,
        conversionRate: 0.5,
        cap: { amount: 1000, period: "monthly" as const, scope: "shared" as const, sharedGroup: "shared-points", valueKind: "points" as const },
      })),
    };
    const lines = calculateRewards(card, [
      { bucket: "dining", amount: 120000, period: "yearly" },
      { bucket: "food", amount: 120000, period: "yearly" },
    ]);
    expect(Math.round(lines.reduce((sum, line) => sum + (line.cappedPointsEarned || 0), 0))).toBe(12000);
    expect(Math.round(lines.reduce((sum, line) => sum + line.cappedSavings, 0))).toBe(6000);
  });

  it("applies shared points caps proportionally before any per-bucket clamp", () => {
    const card: CardRuleSet = {
      cardAlias: "shared-points-asymmetric-card",
      displayName: "Shared Points Asymmetric Card",
      rules: ["dining", "food", "grocery"].map((bucket) => ({
        bucket,
        rewardKind: "points" as const,
        rate: 10,
        rateBasis: "per_100" as const,
        conversionRate: 0.5,
        cap: { amount: 1000, period: "monthly" as const, scope: "shared" as const, sharedGroup: "shared-points", valueKind: "points" as const },
      })),
    };
    const lines = calculateRewards(card, [
      { bucket: "dining", amount: 240000, period: "yearly" },
      { bucket: "food", amount: 120000, period: "yearly" },
      { bucket: "grocery", amount: 60000, period: "yearly" },
    ]);
    const cappedPoints = lines.map((line) => line.cappedPointsEarned || 0);
    expect(Math.round(cappedPoints.reduce((sum, value) => sum + value, 0))).toBe(12000);
    expect(Math.round(lines.reduce((sum, line) => sum + line.cappedSavings, 0))).toBe(6000);
    expect(cappedPoints[0]).toBeGreaterThan(cappedPoints[1]);
    expect(cappedPoints[1]).toBeGreaterThan(cappedPoints[2]);
  });

  it("throws on duplicate bucket/merchant rules", () => {
    const bad: CardRuleSet = {
      cardAlias: "bad-card",
      displayName: "Bad Card",
      rules: [
        { bucket: "fashion", rewardKind: "cashback", rate: 1, rateBasis: "percent" },
        { bucket: "fashion", rewardKind: "cashback", rate: 2, rateBasis: "percent" },
      ],
    };
    expect(() => validateUniqueRewardRules(bad)).toThrow(/duplicate reward rule/);
  });

  it("ranks one-off spend by gross reward, not annual fee net", () => {
    const premium: CardRuleSet = {
      cardAlias: "premium",
      displayName: "Premium",
      annualFee: 5000,
      rules: [{ bucket: "fashion", rewardKind: "cashback", rate: 10, rateBasis: "percent" }],
    };
    const free: CardRuleSet = {
      cardAlias: "free",
      displayName: "Free",
      annualFee: 0,
      rules: [{ bucket: "fashion", rewardKind: "cashback", rate: 1, rateBasis: "percent" }],
    };
    expect(bestCardForSpend([premium, free], { bucket: "fashion", amount: 100, period: "yearly" })?.cardAlias).toBe("premium");
  });

  it("translates USER_CARDS reward shapes into real rules", () => {
    const axis = adaptUserCard(USER_CARDS[1]);
    const line = calculateReward(axis, { bucket: "other_online_spends", merchant: "Myntra", amount: 10000, period: "yearly" });
    expect(line.cappedSavings).toBe(750);
    expect(axis.rules.length).toBeGreaterThan(0);
  });

  it("translates CardGenius spending_breakdown into rules and rejects missing breakdowns", () => {
    expect(() => adaptCardGeniusCard({ card_alias: "bad-card", card_name: "Bad Card" })).toThrow(/spending_breakdown/);
    const card = adaptCardGeniusCard({
      card_alias: "market-card",
      card_name: "Market Card",
      annual_fees: "₹1,000",
      spending_breakdown: {
        fashion: { spend: 10000, savings: 500, savings_type: "cashback", conv_rate: 1, maxCap: "Unlimited" },
      },
    });
    expect(card.annualFee).toBe(1000);
    expect(calculateReward(card, { bucket: "fashion", amount: 10000, period: "monthly" }).cappedSavings).toBe(6000);
  });

  it("detects CardGenius card cap kind from savings type", () => {
    const cashback = adaptCardGeniusCard({
      card_alias: "cashback-card",
      card_name: "Cashback Card",
      card_max_cap: "10000",
      spending_breakdown: {
        fashion: { spend: 10000, savings: 500, savings_type: "cashback", conv_rate: 1 },
      },
    });
    const points = adaptCardGeniusCard({
      card_alias: "points-card",
      card_name: "Points Card",
      card_max_cap: "10000",
      spending_breakdown: {
        travel: { spend: 10000, savings: 500, savings_type: "points", conv_rate: 0.2 },
      },
    });
    expect(cashback.cardCap?.valueKind).toBe("savings");
    expect(points.cardCap?.valueKind).toBe("points");
  });

  it("can exclude owned cards at the CardGenius adapter boundary", () => {
    const cards = [
      { card_alias: "axis-flipkart-credit-card" },
      { card_alias: "hdfc-diners-club-black-metal" },
    ];
    expect(excludeOwnedCardResponses(cards, ["axis-flipkart-credit-card"])).toEqual([
      { card_alias: "hdfc-diners-club-black-metal" },
    ]);
  });
});
