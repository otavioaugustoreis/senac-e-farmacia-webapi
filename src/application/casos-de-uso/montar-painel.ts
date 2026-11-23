import { isCouponActive } from "@/domain/cupom";
import { isOutdated } from "@/domain/preco";
import type { PriceReport } from "@/domain/reporte";
import type { CurrentUser } from "@/domain/usuario";
import type { Repositories } from "../ports";
import { requireAdmin } from "./admin";
import { buildShowcase, type ShowcaseItem } from "./montar-vitrine";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface Dashboard {
  totals: {
    medicines: number; withPhoto: number; withoutPrice: number;
    prices: number; outdatedPrices: number; freshPricesPct: number;
    pharmacies: number; partners: number;
    activeCoupons: number; expiredCoupons: number;
    openReports: number; categories: number; averageSavingsPct: number | null;
  };
  priceAge: { bucket: string; count: number; warning: boolean }[];
  pharmacyCoverage: { id: number; name: string; isPartner: boolean; count: number; pct: number }[];
  byCategory: { name: string; count: number }[];
  withoutPrice: { id: number; name: string }[];
  oldest: { priceId: number; medicine: string; pharmacy: string; days: number }[];
  openReports: PriceReport[];
  topSavings: ShowcaseItem[];
}

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

/** Dados do dashboard administrativo (indicadores do documento do produto incluídos). */
export const buildDashboard = (repos: Repositories) =>
  async (user: CurrentUser | null, today: Date): Promise<Dashboard> => {
    requireAdmin(user);

    const [medicines, prices, pharmacies, coupons, reports, categories, showcase] = await Promise.all([
      repos.medicines.search(""),
      repos.prices.listAll(),
      repos.pharmacies.list(),
      repos.coupons.list(),
      repos.reports.list(),
      repos.categories.list(),
      buildShowcase(repos)(today),
    ]);

    const age = (d: Date) => Math.floor((today.getTime() - d.getTime()) / DAY_MS);
    const outdatedCount = prices.filter((p) => isOutdated(p, today));
    const active = coupons.filter((c) => isCouponActive(c, today));
    const openItems = reports.filter((r) => !r.resolved).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const withoutPrice = medicines.filter((m) => m.lowestPrice === null);

    const buckets = [
      { bucket: "0 a 2 dias", count: 0, warning: false, max: 2 },
      { bucket: "3 a 5 dias", count: 0, warning: false, max: 5 },
      { bucket: "6 a 7 dias", count: 0, warning: false, max: 7 },
      { bucket: "Mais de 7 dias", count: 0, warning: true, max: Infinity },
    ];
    for (const p of prices) {
      if (isOutdated(p, today)) buckets[3].count++;
      else buckets.find((f) => age(p.updatedAt) <= f.max)!.count++;
    }

    const medicinesByPharmacy = new Map<number, Set<number>>();
    for (const p of prices) {
      if (!medicinesByPharmacy.has(p.pharmacy.id)) medicinesByPharmacy.set(p.pharmacy.id, new Set());
      medicinesByPharmacy.get(p.pharmacy.id)!.add(p.medicineId);
    }

    const byCategory = new Map<string, number>();
    for (const m of medicines) {
      const name = m.category?.name ?? "Sem categoria";
      byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
    }

    return {
      totals: {
        medicines: medicines.length,
        withPhoto: medicines.filter((m) => m.image).length,
        withoutPrice: withoutPrice.length,
        prices: prices.length,
        outdatedPrices: outdatedCount.length,
        freshPricesPct: pct(prices.length - outdatedCount.length, prices.length),
        pharmacies: pharmacies.length,
        partners: pharmacies.filter((f) => f.isPartner).length,
        activeCoupons: active.length,
        expiredCoupons: coupons.length - active.length,
        openReports: openItems.length,
        categories: categories.length,
        averageSavingsPct: showcase.stats.averageSavingsPercent,
      },
      priceAge: buckets.map(({ bucket, count, warning }) => ({ bucket, count, warning })),
      pharmacyCoverage: pharmacies
        .map((f) => {
          const count = medicinesByPharmacy.get(f.id)?.size ?? 0;
          return { id: f.id, name: f.name, isPartner: f.isPartner, count, pct: pct(count, medicines.length) };
        })
        .sort((a, b) => b.count - a.count),
      byCategory: [...byCategory].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      withoutPrice: withoutPrice.map((m) => ({ id: m.id, name: m.brandName })),
      oldest: outdatedCount
        .map((p) => ({ priceId: p.id, medicine: p.medicine, pharmacy: p.pharmacy.name, days: age(p.updatedAt) }))
        .sort((a, b) => b.days - a.days)
        .slice(0, 5),
      openReports: openItems.slice(0, 5),
      topSavings: showcase.lowestPrices.slice(0, 5),
    };
  };
