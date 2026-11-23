import { createAdminUseCases, requireAdmin, type AdminUseCases } from "@/application/casos-de-uso/admin";
import { NotFoundError } from "@/domain/erros";
import type { CurrentUser } from "@/domain/usuario";
import { getContainer } from "@/infrastructure/container";
import { toCategory, toCoupon, toPharmacy, toMedicine, toPrice } from "./_entradas";

type U = CurrentUser | null;
type Body = Record<string, unknown>;

interface EntityOperations {
  list: (u: U) => Promise<unknown>;
  save?: (u: U, body: Body) => Promise<unknown>;
  remove?: (u: U, id: number) => Promise<void>;
  get?: (u: U, id: number) => Promise<unknown>;
  markResolved?: (u: U, id: number) => Promise<void>;
}

function operations(c: AdminUseCases): Record<string, EntityOperations> {
  return {
    medicamentos: {
      list: c.listMedicines,
      save: async (u, body) => ({ id: await c.saveMedicine(u, toMedicine(body)) }),
      remove: c.deleteMedicine,
      get: async (u, id) => ({ packageInsert: await c.getPackageInsert(u, id) }),
    },
    categorias: { list: c.listCategories, save: (u, body) => c.saveCategory(u, toCategory(body)), remove: c.deleteCategory },
    farmacias: { list: c.listPharmacies, save: (u, body) => c.savePharmacy(u, toPharmacy(body)), remove: c.deletePharmacy },
    precos: { list: c.listPrices, save: (u, body) => c.savePrice(u, toPrice(body)), remove: c.deletePrice },
    cupons: { list: c.listCoupons, save: (u, body) => c.saveCoupon(u, toCoupon(body)), remove: c.deleteCoupon },
    reportes: { list: c.listReports, markResolved: c.resolveReport },
  };
}

/**
 * Confirma que é admin (401/403) antes de olhar a entidade ou o corpo;
 * depois resolve a entidade da URL (desconhecida → 404).
 */
export async function prepareAdmin(entity: string) {
  const { repos, currentUser } = await getContainer();
  const user = await currentUser();
  requireAdmin(user);
  const ops = operations(createAdminUseCases(repos))[entity];
  if (!ops) throw new NotFoundError("Recurso não encontrado");
  return { ops, user };
}

export function requireOperation<T>(op: T | undefined): T {
  if (!op) throw new NotFoundError("Operação não disponível");
  return op;
}
