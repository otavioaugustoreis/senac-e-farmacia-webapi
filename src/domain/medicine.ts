import { DomainError } from "./errors";
import { normalizeText } from "./text";

export const MEDICINE_TYPES = ["referencia", "generico", "similar"] as const;
export type MedicineType = (typeof MEDICINE_TYPES)[number];

export const TYPE_LABELS: Record<MedicineType, string> = {
  referencia: "Referência",
  generico: "Genérico",
  similar: "Similar",
};

export interface Category {
  id: number;
  name: string;
}

/** Foto real com licença livre; `credito` e `fonte` são obrigatórios para exibir. */
export interface MedicineImageInfo {
  url: string;
  credit: string;
  source: string;
}

export interface Medicine {
  id: number;
  brandName: string;
  activeIngredient: string;
  category: Category | null;
  type: MedicineType;
  manufacturer: string;
  presentation: string;
  image: MedicineImageInfo | null;
}

export interface SearchResult extends Medicine {
  lowestPrice: number | null;
}

export function alternativesOf<T extends Medicine>(target: Medicine, candidates: T[]): T[] {
  const ingredient = normalizeText(target.activeIngredient);
  return candidates.filter((m) => m.id !== target.id && normalizeText(m.activeIngredient) === ingredient);
}

export function validateMedicine(input: {
  brandName: string; activeIngredient: string; type: MedicineType; imageUrl?: string | null;
}): void {
  if (!input.brandName?.trim()) throw new DomainError("Informe o nome comercial");
  if (!input.activeIngredient?.trim()) throw new DomainError("Informe o princípio ativo");
  if (!MEDICINE_TYPES.includes(input.type)) throw new DomainError("Tipo de medicamento inválido");
  const url = input.imageUrl?.trim();
  if (url && !isImageAllowed(url)) throw new DomainError("A foto precisa de um endereço https");
}

/** Aceita https:// ou um arquivo do próprio site ("/medicamentos/x.svg"), nunca "//outro-site". */
export function isImageAllowed(url: string): boolean {
  return url.startsWith("https://") || (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\"));
}

/** Monta a imagem só quando há URL; sem crédito informado, aponta para a fonte. */
export function buildImage(url?: string | null, credit?: string | null, source?: string | null): MedicineImageInfo | null {
  if (!url?.trim()) return null;
  return { url: url.trim(), credit: credit?.trim() || "Imagem ilustrativa", source: source?.trim() || url.trim() };
}
