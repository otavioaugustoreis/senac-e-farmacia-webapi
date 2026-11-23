import { DomainError } from "./errors";

export interface PriceReport {
  id: number;
  priceId: number;
  medicine: string;
  pharmacy: string;
  amount: number;
  comment: string;
  createdAt: Date;
  resolved: boolean;
}

export const COMMENT_LIMIT = 500;

export function normalizeComment(c: string): string {
  const text = (c ?? "").trim();
  if (text.length > COMMENT_LIMIT) throw new DomainError("Comentário muito longo");
  return text;
}
