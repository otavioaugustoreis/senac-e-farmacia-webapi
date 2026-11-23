import { DEFAULT_HOW_TO_USE, type PackageInsert } from "@/domain/bula";
import { isCouponActive, type Coupon } from "@/domain/cupom";
import { NotFoundError } from "@/domain/erros";
import { alternativesOf, type Medicine, type SearchResult } from "@/domain/medicamento";
import { isOutdated, lowestPrice, sortByValue, type Price } from "@/domain/preco";
import type { Repositories } from "../ports";

export interface MedicineDetail {
  medicine: Medicine;
  packageInsert: PackageInsert | null;
  howToUse: string;
  prices: (Price & { outdated: boolean })[];
  lowestPrice: Price | null;
  alternatives: SearchResult[];
  coupons: Coupon[];
}

export const getMedicineDetail = (repos: Pick<Repositories, "medicines" | "packageInserts" | "prices" | "coupons">) =>
  async (id: number, today: Date): Promise<MedicineDetail> => {
    const medicine = await repos.medicines.getById(id);
    if (!medicine) throw new NotFoundError("Medicamento não encontrado");

    const [packageInsert, rawPrices, sameIngredient, coupons] = await Promise.all([
      repos.packageInserts.get(id),
      repos.prices.listByMedicine(id),
      repos.medicines.listByActiveIngredient(medicine.activeIngredient),
      repos.coupons.list(),
    ]);

    const prices = sortByValue(rawPrices).map((p) => ({ ...p, outdated: isOutdated(p, today) }));
    const pharmaciesWithPrice = new Set(prices.map((p) => p.pharmacy.id));

    return {
      medicine,
      packageInsert,
      howToUse: DEFAULT_HOW_TO_USE,
      prices,
      lowestPrice: lowestPrice(rawPrices),
      alternatives: alternativesOf(medicine, sameIngredient),
      coupons: coupons.filter((c) => pharmaciesWithPrice.has(c.pharmacy.id) && isCouponActive(c, today)),
    };
  };
