import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositories } from "@/application/ports";
import { createCategoryRepository } from "./category-repository";
import { createCouponRepository } from "./coupon-repository";
import { createMedicineRepository } from "./medicine-repository";
import { createPackageInsertRepository } from "./package-insert-repository";
import { createPharmacyRepository } from "./pharmacy-repository";
import { createPriceRepository } from "./price-repository";
import { createReportRepository } from "./report-repository";

export function createRepositories(db: SupabaseClient): Repositories {
  return {
    medicines: createMedicineRepository(db),
    packageInserts: createPackageInsertRepository(db),
    prices: createPriceRepository(db),
    pharmacies: createPharmacyRepository(db),
    coupons: createCouponRepository(db),
    categories: createCategoryRepository(db),
    reports: createReportRepository(db),
  };
}
