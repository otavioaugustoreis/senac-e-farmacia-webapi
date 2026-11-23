import type { Repositories } from "@/application/ports";
import type { PackageInsert } from "@/domain/package-insert";
import type { Coupon } from "@/domain/coupon";
import type { Pharmacy } from "@/domain/pharmacy";
import type { Category, Medicine, SearchResult } from "@/domain/medicine";
import type { Price } from "@/domain/price";
import type { PriceReport } from "@/domain/report";
import type { CurrentUser } from "@/domain/user";
import { lowestPrice } from "@/domain/price";
import { normalizeText } from "@/domain/text";
import { buildImage } from "@/domain/medicine";

export interface DashboardData {
  categories: Category[];
  medicines: Medicine[];
  packageInserts: PackageInsert[];
  pharmacies: Pharmacy[];
  prices: Price[];
  coupons: Coupon[];
  reports: (PriceReport & { userId: string })[];
}

export const regularUser: CurrentUser = { id: "u1", email: "u@x.com", name: "Usuária", role: "user" };
export const admin: CurrentUser = { id: "a1", email: "user123@gmail.com", name: "Admin", role: "admin" };

export function med(id: number, name: string, activeIngredient: string, type: Medicine["type"]): Medicine {
  return { id, brandName: name, activeIngredient, category: { id: 1, name: "Analgésicos" }, type, manufacturer: "Lab", presentation: "10 comprimidos", image: null };
}

export function pharmacy(id: number, isPartner = true): Pharmacy {
  return { id, name: `Farmácia ${id}`, address: `Rua ${id}`, phone: null, isPartner, lat: -23.56 + id / 1000, lng: -46.65 };
}

export function price(id: number, medicineId: number, pharmacyId: number, amount: number, updatedAt = new Date("2026-11-19T12:00:00Z")): Price {
  return { id, medicineId, pharmacy: { id: pharmacyId, name: `Farmácia ${pharmacyId}` }, amount, updatedAt };
}

export function coupon(id: number, pharmacyId: number, validUntil: string): Coupon {
  return { id, pharmacy: { id: pharmacyId, name: `Farmácia ${pharmacyId}`, address: "Rua Exemplo, 100" }, code: `CUPOM${id}`, description: "", discount: "10%", validUntil: new Date(validUntil) };
}

export function emptyData(): DashboardData {
  return { categories: [{ id: 1, name: "Analgésicos" }], medicines: [], packageInserts: [], pharmacies: [], prices: [], coupons: [], reports: [] };
}

/** Repositórios em memória para testar casos de uso sem banco. */
export function createFakes(d: DashboardData): Repositories {
  const result = (m: Medicine): SearchResult => ({
    ...m,
    lowestPrice: lowestPrice(d.prices.filter((p) => p.medicineId === m.id))?.amount ?? null,
  });
  let nextId = 1000;

  return {
    medicines: {
      async search(q, categoryId) {
        const query = normalizeText(q);
        return d.medicines
          .filter((m) => !query || normalizeText(m.brandName).includes(query) || normalizeText(m.activeIngredient).includes(query))
          .filter((m) => categoryId === undefined || m.category?.id === categoryId)
          .map(result);
      },
      async getById(id) {
        return d.medicines.find((m) => m.id === id) ?? null;
      },
      async listByActiveIngredient(p) {
        return d.medicines.filter((m) => normalizeText(m.activeIngredient) === normalizeText(p)).map(result);
      },
      async save(input) {
        const id = input.id ?? ++nextId;
        const category = d.categories.find((c) => c.id === input.categoryId) ?? null;
        const newItem: Medicine = { id, brandName: input.brandName, activeIngredient: input.activeIngredient, category, type: input.type, manufacturer: input.manufacturer, presentation: input.presentation, image: buildImage(input.imageUrl, input.imageCredit, input.imageSource) };
        d.medicines = [...d.medicines.filter((m) => m.id !== id), newItem];
        return id;
      },
      async remove(id) {
        d.medicines = d.medicines.filter((m) => m.id !== id);
      },
    },
    packageInserts: {
      async get(id) {
        return d.packageInserts.find((b) => b.medicineId === id) ?? null;
      },
      async save(b) {
        d.packageInserts = [...d.packageInserts.filter((x) => x.medicineId !== b.medicineId), b];
      },
    },
    prices: {
      async listByMedicine(id) {
        return d.prices.filter((p) => p.medicineId === id);
      },
      async listAll() {
        return d.prices.map((p) => ({ ...p, medicine: d.medicines.find((m) => m.id === p.medicineId)?.brandName ?? "" }));
      },
      async save(input) {
        const id = input.id ?? ++nextId;
        const f = d.pharmacies.find((x) => x.id === input.pharmacyId);
        d.prices = [...d.prices.filter((p) => p.id !== id), { id, medicineId: input.medicineId, pharmacy: { id: input.pharmacyId, name: f?.name ?? "" }, amount: input.amount, updatedAt: new Date() }];
      },
      async remove(id) {
        d.prices = d.prices.filter((p) => p.id !== id);
      },
    },
    pharmacies: {
      async nearby(lat, lng, radiusKm) {
        return d.pharmacies
          .map((f) => ({ ...f, distanceKm: Math.hypot(f.lat - lat, f.lng - lng) * 111 }))
          .filter((f) => f.distanceKm <= radiusKm)
          .sort((a, b) => a.distanceKm - b.distanceKm);
      },
      async list() {
        return d.pharmacies;
      },
      async save(input) {
        const id = input.id ?? ++nextId;
        d.pharmacies = [...d.pharmacies.filter((f) => f.id !== id), { ...input, id }];
      },
      async remove(id) {
        d.pharmacies = d.pharmacies.filter((f) => f.id !== id);
      },
    },
    coupons: {
      async list() {
        return d.coupons;
      },
      async save(input) {
        const id = input.id ?? ++nextId;
        d.coupons = [...d.coupons.filter((c) => c.id !== id), { id, pharmacy: { id: input.pharmacyId, name: "", address: "" }, code: input.code, description: input.description, discount: input.discount, validUntil: input.validUntil }];
      },
      async remove(id) {
        d.coupons = d.coupons.filter((c) => c.id !== id);
      },
    },
    categories: {
      async list() {
        return d.categories;
      },
      async save(input) {
        const id = input.id ?? ++nextId;
        d.categories = [...d.categories.filter((c) => c.id !== id), { id, name: input.name }];
      },
      async remove(id) {
        d.categories = d.categories.filter((c) => c.id !== id);
      },
    },
    reports: {
      async create(r) {
        const p = d.prices.find((x) => x.id === r.priceId);
        d.reports.push({ id: ++nextId, priceId: r.priceId, userId: r.userId, comment: r.comment, medicine: "", pharmacy: p?.pharmacy.name ?? "", amount: p?.amount ?? 0, createdAt: new Date(), resolved: false });
      },
      async list() {
        return d.reports;
      },
      async markResolved(id) {
        d.reports = d.reports.map((r) => (r.id === id ? { ...r, resolved: true } : r));
      },
    },
  };
}
