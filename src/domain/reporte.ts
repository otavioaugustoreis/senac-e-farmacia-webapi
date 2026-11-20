import { DomainError } from "./erros";

export interface ReportePreco {
  id: number;
  precoId: number;
  medicamento: string;
  farmacia: string;
  valor: number;
  comentario: string;
  criadoEm: Date;
  resolvido: boolean;
}

export const LIMITE_COMENTARIO = 500;

export function normalizarComentario(c: string): string {
  const texto = (c ?? "").trim();
  if (texto.length > LIMITE_COMENTARIO) throw new DomainError("Comentário muito longo");
  return texto;
}
