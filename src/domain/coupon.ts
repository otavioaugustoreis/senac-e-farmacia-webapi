import { DomainError } from "./errors";

export interface Coupon {
  id: number;
  pharmacy: { id: number; name: string; address: string };
  code: string;
  description: string;
  discount: string;
  validUntil: Date;
}

const TZ = "America/Sao_Paulo";
const saoPauloDayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

export function dayInSaoPaulo(d: Date): string {
  return saoPauloDayFormat.format(d);
}

export function isCouponActive(c: Pick<Coupon, "validUntil">, today: Date): boolean {
  return dayInSaoPaulo(c.validUntil) >= dayInSaoPaulo(today);
}

export function validateCoupon(input: { code: string; discount: string; validUntil: Date }): void {
  if (!input.code?.trim()) throw new DomainError("Informe o código do cupom");
  if (!input.discount?.trim()) throw new DomainError("Informe o desconto");
  if (!(input.validUntil instanceof Date) || Number.isNaN(input.validUntil.getTime())) throw new DomainError("Validade inválida");
}
