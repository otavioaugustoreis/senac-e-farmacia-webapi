import type { Repositories } from "../ports";

export const searchMedicines = (repos: Pick<Repositories, "medicines">) =>
  (q: string, categoryId?: number) => repos.medicines.search((q ?? "").trim(), categoryId);

export const listCategories = (repos: Pick<Repositories, "categories">) =>
  () => repos.categories.list();
