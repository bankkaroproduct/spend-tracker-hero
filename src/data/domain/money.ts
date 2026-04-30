// V2 money and unit helpers.
// All rupee rounding, Indian formatting, and period conversion belongs here.

import type { Period } from "./types";

export function roundMoney(value: number): number {
  return Math.round(Number(value) || 0);
}

export function formatINR(value: number): string {
  return `₹${roundMoney(value).toLocaleString("en-IN")}`;
}

export function toMonthly(value: number, from: Period): number {
  if (from === "monthly") return Number(value) || 0;
  if (from === "quarterly") return (Number(value) || 0) / 3;
  return (Number(value) || 0) / 12;
}

export function toYearly(value: number, from: Period): number {
  if (from === "yearly") return roundMoney(value);
  if (from === "quarterly") return roundMoney((Number(value) || 0) * 4);
  return roundMoney((Number(value) || 0) * 12);
}

export function convertPeriod(value: number, from: Period, to: Period): number {
  if (from === to) return Number(value) || 0;
  const monthly = toMonthly(value, from);
  if (to === "monthly") return monthly;
  if (to === "quarterly") return monthly * 3;
  return roundMoney(monthly * 12);
}

