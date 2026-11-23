import { isCouponActive } from "@/domain/cupom";
import type { Repositories } from "../ports";

export const listActiveCoupons = (repos: Pick<Repositories, "coupons">) =>
  async (today: Date) => (await repos.coupons.list()).filter((c) => isCouponActive(c, today));
