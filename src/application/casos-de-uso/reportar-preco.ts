import { DomainError, UnauthenticatedError } from "@/domain/erros";
import { normalizeComment } from "@/domain/reporte";
import type { CurrentUser } from "@/domain/usuario";
import type { Repositories } from "../ports";

export const reportPrice = (repos: Pick<Repositories, "reports">) =>
  async (user: CurrentUser | null, priceId: number, comment: string): Promise<void> => {
    if (!user) throw new UnauthenticatedError("Faça login para reportar um preço");
    if (!Number.isInteger(priceId) || priceId <= 0) throw new DomainError("Preço inválido");
    await repos.reports.create({ priceId, userId: user.id, comment: normalizeComment(comment) });
  };
