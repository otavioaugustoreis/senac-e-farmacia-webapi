import { isCouponActive, type Coupon } from "@/domain/coupon";
import type { Pharmacy } from "@/domain/pharmacy";
import type { Category, SearchResult } from "@/domain/medicine";
import { savingsPercent } from "@/domain/price";
import { normalizeText } from "@/domain/text";
import type { Repositories } from "../ports";

export type ShowcaseItem = SearchResult & { referencePrice: number | null; savingsPercent: number | null };

export interface Showcase {
  categories: Category[];
  lowestPrices: ShowcaseItem[];
  partnerPharmacies: Pharmacy[];
  coupons: Coupon[];
  stats: { medicines: number; pharmacies: number; averageSavingsPercent: number | null };
}

const SHOWCASE_LIMIT = 8;
const COUPON_LIMIT = 2;

export const buildShowcase = (repos: Pick<Repositories, "medicines" | "pharmacies" | "coupons" | "categories">) =>
  async (today: Date): Promise<Showcase> => {
    const [all, pharmacies, coupons, categories] = await Promise.all([
      repos.medicines.search(""),
      repos.pharmacies.list(),
      repos.coupons.list(),
      repos.categories.list(),
    ]);

    const referenceByIngredient = new Map<string, number>();
    for (const m of all) {
      if (m.type !== "referencia" || m.lowestPrice === null) continue;
      const ingredientKey = normalizeText(m.activeIngredient);
      const current = referenceByIngredient.get(ingredientKey);
      if (current === undefined || m.lowestPrice < current) referenceByIngredient.set(ingredientKey, m.lowestPrice);
    }

    const items: ShowcaseItem[] = all
      .filter((m) => m.type !== "referencia" && m.lowestPrice !== null)
      .map((m) => {
        const referencePrice = referenceByIngredient.get(normalizeText(m.activeIngredient)) ?? null;
        return { ...m, referencePrice, savingsPercent: savingsPercent(m.lowestPrice, referencePrice) };
      });

    const savings = items.map((i) => i.savingsPercent).filter((e): e is number => e !== null);
    const lowestPrices = [...items]
      .sort((a, b) => (b.savingsPercent ?? -1) - (a.savingsPercent ?? -1))
      .slice(0, SHOWCASE_LIMIT);

    return {
      categories,
      lowestPrices,
      partnerPharmacies: pharmacies.filter((f) => f.isPartner),
      coupons: coupons.filter((c) => isCouponActive(c, today)).slice(0, COUPON_LIMIT),
      stats: {
        medicines: all.length,
        pharmacies: pharmacies.length,
        averageSavingsPercent: savings.length ? Math.round(savings.reduce((s, e) => s + e, 0) / savings.length) : null,
      },
    };
  };
