import { cupomVigente } from "@/domain/cupom";
import type { Repositorios } from "../ports";

export const listarCuponsVigentes = (repos: Pick<Repositorios, "cupons">) =>
  async (hoje: Date) => (await repos.cupons.listar()).filter((c) => cupomVigente(c, hoje));
