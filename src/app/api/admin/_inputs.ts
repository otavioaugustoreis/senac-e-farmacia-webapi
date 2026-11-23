import type { MedicineWithInsertInput } from "@/application/use-cases/admin";
import type { CategoryInput, CouponInput, PharmacyInput, PriceInput } from "@/application/ports";
import { ANVISA_INSERTS_URL } from "@/domain/package-insert";
import { DomainError } from "@/domain/errors";
import type { MedicineType } from "@/domain/medicine";
import { dateFromDay } from "@/infrastructure/mappers";

type Body = Record<string, unknown>;

const text = (v: unknown) => (v === null || v === undefined ? "" : String(v));

export function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  let t = text(v).trim();
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  return t === "" ? Number.NaN : Number(t);
}

const optionalId = (v: unknown) => {
  const n = toNumber(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

const idOrNull = (v: unknown) => optionalId(v) ?? null;

export const toMedicine = (c: Body): MedicineWithInsertInput => {
  const b = (c.packageInsert ?? null) as Body | null;
  return {
    id: optionalId(c.id),
    brandName: text(c.brandName),
    activeIngredient: text(c.activeIngredient),
    categoryId: idOrNull(c.categoryId),
    type: text(c.type) as MedicineType,
    manufacturer: text(c.manufacturer),
    presentation: text(c.presentation),
    imageUrl: text(c.imageUrl),
    imageCredit: text(c.imageCredit),
    imageSource: text(c.imageSource),
    packageInsert: b
      ? {
          usedFor: text(b.usedFor), contraindications: text(b.contraindications),
          sideEffects: text(b.sideEffects), warnings: text(b.warnings),
          anvisaLink: text(b.anvisaLink) || ANVISA_INSERTS_URL,
        }
      : undefined,
  };
};

export const toCategory = (c: Body): CategoryInput => ({ id: optionalId(c.id), name: text(c.name) });

export const toPharmacy = (c: Body): PharmacyInput => ({
  id: optionalId(c.id),
  name: text(c.name),
  address: text(c.address),
  phone: text(c.phone).trim() || null,
  isPartner: c.isPartner === true || c.isPartner === "true" || c.isPartner === "on",
  lat: toNumber(c.lat),
  lng: toNumber(c.lng),
});

export const toPrice = (c: Body): PriceInput => ({
  id: optionalId(c.id),
  medicineId: toNumber(c.medicineId),
  pharmacyId: toNumber(c.pharmacyId),
  amount: toNumber(c.amount),
});

export const toCoupon = (c: Body): CouponInput => {
  const validUntil = text(c.validUntil);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) throw new DomainError("Validade inválida");
  return {
    id: optionalId(c.id),
    pharmacyId: toNumber(c.pharmacyId),
    code: text(c.code),
    description: text(c.description),
    discount: text(c.discount),
    validUntil: dateFromDay(validUntil),
  };
};
