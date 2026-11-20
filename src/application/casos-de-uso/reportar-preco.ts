import { DomainError, NaoAutenticadoError } from "@/domain/erros";
import { normalizarComentario } from "@/domain/reporte";
import type { UsuarioAtual } from "@/domain/usuario";
import type { Repositorios } from "../ports";

export const reportarPreco = (repos: Pick<Repositorios, "reportes">) =>
  async (usuario: UsuarioAtual | null, precoId: number, comentario: string): Promise<void> => {
    if (!usuario) throw new NaoAutenticadoError("Faça login para reportar um preço");
    if (!Number.isInteger(precoId) || precoId <= 0) throw new DomainError("Preço inválido");
    await repos.reportes.criar({ precoId, userId: usuario.id, comentario: normalizarComentario(comentario) });
  };
