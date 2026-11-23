import { validateCoupon } from "@/domain/cupom";
import { DomainError, UnauthenticatedError, ForbiddenError } from "@/domain/erros";
import { validatePharmacy } from "@/domain/farmacia";
import { validateMedicine } from "@/domain/medicamento";
import { validateAmount } from "@/domain/preco";
import type { CurrentUser } from "@/domain/usuario";
import type { PackageInsertInput, CategoryInput, CouponInput, PharmacyInput, MedicineInput, PriceInput, Repositories } from "../ports";

export function requireAdmin(user: CurrentUser | null): asserts user is CurrentUser {
  if (!user) throw new UnauthenticatedError();
  if (user.role !== "admin") throw new ForbiddenError();
}

function requireId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) throw new DomainError("Identificador inválido");
}

export type MedicineWithInsertInput = MedicineInput & { packageInsert?: PackageInsertInput };

export function createAdminUseCases(repos: Repositories) {
  return {
    async listMedicines(u: CurrentUser | null) {
      requireAdmin(u);
      return repos.medicines.search("");
    },
    async getPackageInsert(u: CurrentUser | null, medicineId: number) {
      requireAdmin(u);
      return repos.packageInserts.get(medicineId);
    },
    async saveMedicine(u: CurrentUser | null, input: MedicineWithInsertInput): Promise<number> {
      requireAdmin(u);
      validateMedicine(input);
      const { packageInsert, ...medicine } = input;
      const id = await repos.medicines.save({ ...medicine, brandName: medicine.brandName.trim(), activeIngredient: medicine.activeIngredient.trim() });
      if (packageInsert) await repos.packageInserts.save({ ...packageInsert, medicineId: id });
      return id;
    },
    async deleteMedicine(u: CurrentUser | null, id: number) {
      requireAdmin(u);
      requireId(id);
      await repos.medicines.remove(id);
    },

    async listCategories(u: CurrentUser | null) {
      requireAdmin(u);
      return repos.categories.list();
    },
    async saveCategory(u: CurrentUser | null, input: CategoryInput) {
      requireAdmin(u);
      if (!input.name?.trim()) throw new DomainError("Informe o nome da categoria");
      await repos.categories.save({ ...input, name: input.name.trim() });
    },
    async deleteCategory(u: CurrentUser | null, id: number) {
      requireAdmin(u);
      requireId(id);
      await repos.categories.remove(id);
    },

    async listPharmacies(u: CurrentUser | null) {
      requireAdmin(u);
      return repos.pharmacies.list();
    },
    async savePharmacy(u: CurrentUser | null, input: PharmacyInput) {
      requireAdmin(u);
      validatePharmacy(input);
      await repos.pharmacies.save(input);
    },
    async deletePharmacy(u: CurrentUser | null, id: number) {
      requireAdmin(u);
      requireId(id);
      await repos.pharmacies.remove(id);
    },

    async listPrices(u: CurrentUser | null) {
      requireAdmin(u);
      return repos.prices.listAll();
    },
    async savePrice(u: CurrentUser | null, input: PriceInput) {
      requireAdmin(u);
      validateAmount(input.amount);
      requireId(input.medicineId);
      requireId(input.pharmacyId);
      await repos.prices.save(input);
    },
    async deletePrice(u: CurrentUser | null, id: number) {
      requireAdmin(u);
      requireId(id);
      await repos.prices.remove(id);
    },

    async listCoupons(u: CurrentUser | null) {
      requireAdmin(u);
      return repos.coupons.list();
    },
    async saveCoupon(u: CurrentUser | null, input: CouponInput) {
      requireAdmin(u);
      validateCoupon(input);
      requireId(input.pharmacyId);
      await repos.coupons.save({ ...input, code: input.code.trim().toUpperCase() });
    },
    async deleteCoupon(u: CurrentUser | null, id: number) {
      requireAdmin(u);
      requireId(id);
      await repos.coupons.remove(id);
    },

    async listReports(u: CurrentUser | null) {
      requireAdmin(u);
      return repos.reports.list();
    },
    async resolveReport(u: CurrentUser | null, id: number) {
      requireAdmin(u);
      requireId(id);
      await repos.reports.markResolved(id);
    },
  };
}

export type AdminUseCases = ReturnType<typeof createAdminUseCases>;
