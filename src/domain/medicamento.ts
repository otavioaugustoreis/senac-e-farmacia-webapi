import { DomainError } from "./erros";
import { normalizarTexto } from "./texto";

export const TIPOS_MEDICAMENTO = ["referencia", "generico", "similar"] as const;
export type TipoMedicamento = (typeof TIPOS_MEDICAMENTO)[number];

export const ROTULO_TIPO: Record<TipoMedicamento, string> = {
  referencia: "Referência",
  generico: "Genérico",
  similar: "Similar",
};

export interface Categoria {
  id: number;
  nome: string;
}

export interface Medicamento {
  id: number;
  nomeComercial: string;
  principioAtivo: string;
  categoria: Categoria | null;
  tipo: TipoMedicamento;
  fabricante: string;
  apresentacao: string;
}

export interface ResultadoBusca extends Medicamento {
  menorPreco: number | null;
}

export function alternativasDe<T extends Medicamento>(alvo: Medicamento, candidatos: T[]): T[] {
  const principio = normalizarTexto(alvo.principioAtivo);
  return candidatos.filter((m) => m.id !== alvo.id && normalizarTexto(m.principioAtivo) === principio);
}

export function validarMedicamento(input: { nomeComercial: string; principioAtivo: string; tipo: TipoMedicamento }): void {
  if (!input.nomeComercial?.trim()) throw new DomainError("Informe o nome comercial");
  if (!input.principioAtivo?.trim()) throw new DomainError("Informe o princípio ativo");
  if (!TIPOS_MEDICAMENTO.includes(input.tipo)) throw new DomainError("Tipo de medicamento inválido");
}
