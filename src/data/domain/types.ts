// V2 domain types.
// These types define business units and identities used by the V2 engine.

export type Period = "monthly" | "quarterly" | "yearly";

export type RewardKind = "cashback" | "points" | "miles" | "voucher";

export type RateBasis = "percent" | "per_100" | "per_150";

export type CapScope = "bucket" | "card" | "shared";

export type CardAlias = string;

export type BucketId = string;

export type MerchantId = string;

export interface MoneyAmount {
  amount: number;
  period: Period;
}

export interface CapRule {
  amount: number;
  period: Period;
  scope: CapScope;
  sharedGroup?: string;
  valueKind?: "savings" | "points";
}

export interface RewardRule {
  bucket: BucketId;
  merchant?: MerchantId;
  rewardKind: RewardKind;
  rate: number;
  rateBasis: RateBasis;
  cap?: CapRule;
  conversionRate?: number;
}

export interface CardRuleSet {
  cardAlias: CardAlias;
  displayName: string;
  annualFee?: number;
  rules: RewardRule[];
  cardCap?: CapRule;
}

export interface SpendInput {
  bucket: BucketId;
  amount: number;
  period: Period;
  merchant?: MerchantId;
}

export interface TransactionInput {
  id: string;
  amount: number;
  merchant?: MerchantId;
  bucket?: BucketId;
  usedCardAlias?: CardAlias | "upi" | "unknown";
}

export interface RewardLine {
  cardAlias: CardAlias;
  bucket: BucketId;
  merchant?: MerchantId;
  grossSavings: number;
  cappedSavings: number;
  pointsEarned?: number;
  cappedPointsEarned?: number;
  capReached: boolean;
  period: Period;
  capValueKind?: "savings" | "points";
}

export interface CardSavingsSummary {
  cardAlias: CardAlias;
  grossSavings: number;
  netSavings: number;
  annualFee: number;
  period: "yearly";
}
