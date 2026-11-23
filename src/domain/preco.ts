import { DomainError } from "./erros";

export interface Price {
  id: number;
  medicineId: number;
  pharmacy: { id: number; name: string };
  amount: number;
  updatedAt: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
export const DAYS_UNTIL_OUTDATED = 7;

export function lowestPrice<T extends { amount: number }>(prices: T[]): T | null {
  return prices.reduce<T | null>((lowest, p) => (lowest === null || p.amount < lowest.amount ? p : lowest), null);
}

export function sortByValue<T extends { amount: number }>(prices: T[]): T[] {
  return [...prices].sort((a, b) => a.amount - b.amount);
}

export function isOutdated(p: Pick<Price, "updatedAt">, today: Date, days = DAYS_UNTIL_OUTDATED): boolean {
  return today.getTime() - p.updatedAt.getTime() > days * DAY_MS;
}

export function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) throw new DomainError("O preço deve ser maior que zero");
}

export function savingsPercent(amount: number | null, reference: number | null): number | null {
  if (amount === null || reference === null || reference <= amount) return null;
  return Math.round((1 - amount / reference) * 100);
}
