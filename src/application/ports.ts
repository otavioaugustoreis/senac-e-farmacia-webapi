import type { PackageInsert } from "@/domain/package-insert";
import type { Coupon } from "@/domain/coupon";
import type { Pharmacy, NearbyPharmacy } from "@/domain/pharmacy";
import type { Category, Medicine, SearchResult, MedicineType } from "@/domain/medicine";
import type { Price } from "@/domain/price";
import type { PriceReport } from "@/domain/report";

export interface MedicineInput {
  id?: number;
  brandName: string;
  activeIngredient: string;
  categoryId: number | null;
  type: MedicineType;
  manufacturer: string;
  presentation: string;
  imageUrl?: string | null;
  imageCredit?: string | null;
  imageSource?: string | null;
}

export type PackageInsertInput = Omit<PackageInsert, "medicineId">;

export interface PharmacyInput {
  id?: number;
  name: string;
  address: string;
  phone: string | null;
  isPartner: boolean;
  lat: number;
  lng: number;
}

export interface PriceInput {
  id?: number;
  medicineId: number;
  pharmacyId: number;
  amount: number;
}

export interface CouponInput {
  id?: number;
  pharmacyId: number;
  code: string;
  description: string;
  discount: string;
  validUntil: Date;
}

export interface CategoryInput {
  id?: number;
  name: string;
}

export type PriceWithMedicine = Price & { medicine: string };

export interface MedicineRepository {
  /** Busca por nome comercial ou princípio ativo (sem acento/maiúsculas). `q` vazio = todos. */
  search(q: string, categoryId?: number): Promise<SearchResult[]>;
  getById(id: number): Promise<Medicine | null>;
  listByActiveIngredient(activeIngredient: string): Promise<SearchResult[]>;
  save(m: MedicineInput): Promise<number>;
  remove(id: number): Promise<void>;
}

export interface PackageInsertRepository {
  get(medicineId: number): Promise<PackageInsert | null>;
  save(b: PackageInsert): Promise<void>;
}

export interface PriceRepository {
  listByMedicine(medicineId: number): Promise<Price[]>;
  listAll(): Promise<PriceWithMedicine[]>;
  save(p: PriceInput): Promise<void>;
  remove(id: number): Promise<void>;
}

export interface PharmacyRepository {
  nearby(lat: number, lng: number, radiusKm: number): Promise<NearbyPharmacy[]>;
  list(): Promise<Pharmacy[]>;
  save(f: PharmacyInput): Promise<void>;
  remove(id: number): Promise<void>;
}

export interface CouponRepository {
  list(): Promise<Coupon[]>;
  save(c: CouponInput): Promise<void>;
  remove(id: number): Promise<void>;
}

export interface CategoryRepository {
  list(): Promise<Category[]>;
  save(c: CategoryInput): Promise<void>;
  remove(id: number): Promise<void>;
}

export interface ReportRepository {
  create(r: { priceId: number; userId: string; comment: string }): Promise<void>;
  list(): Promise<PriceReport[]>;
  markResolved(id: number): Promise<void>;
}

export interface Repositories {
  medicines: MedicineRepository;
  packageInserts: PackageInsertRepository;
  prices: PriceRepository;
  pharmacies: PharmacyRepository;
  coupons: CouponRepository;
  categories: CategoryRepository;
  reports: ReportRepository;
}
