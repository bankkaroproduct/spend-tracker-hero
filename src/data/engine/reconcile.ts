// V2 reconciliation utilities.
// Use these helpers whenever rounded rows must sum to a headline total.

import { roundMoney } from "../domain/money";

export function reconcileParts<T extends Record<string, any>>(
  total: number,
  parts: T[],
  field: keyof T,
): T[] {
  const rounded = (parts || []).map((part) => ({
    ...part,
    [field]: roundMoney(Number(part[field]) || 0),
  }));
  if (!rounded.length) return rounded;

  const roundedTotal = roundMoney(total);
  const sum = rounded.reduce((acc, part) => acc + (Number(part[field]) || 0), 0);
  const drift = roundedTotal - sum;
  const targetIndex = rounded.reduce((bestIndex, part, index) => {
    const best = Math.abs(Number(rounded[bestIndex]?.[field]) || 0);
    const current = Math.abs(Number(part[field]) || 0);
    return current > best ? index : bestIndex;
  }, 0);
  rounded[targetIndex] = {
    ...rounded[targetIndex],
    [field]: roundMoney((Number(rounded[targetIndex][field]) || 0) + drift),
  };
  return rounded;
}

export function assertReconciled(label: string, total: number, parts: number[], tolerance = 1): boolean {
  const drift = Math.abs(roundMoney(total) - parts.reduce((sum, value) => sum + roundMoney(value), 0));
  if (drift > tolerance && typeof console !== "undefined") {
    console.warn(`[v2:reconcile] ${label} drift=${drift}`, { total, parts });
  }
  return drift <= tolerance;
}
