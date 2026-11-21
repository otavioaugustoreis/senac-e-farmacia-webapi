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

/** Foto real com licença livre; `credito` e `fonte` são obrigatórios para exibir. */
export interface ImagemMedicamento {
  url: string;
  credito: string;
  fonte: string;
}

export interface Medicamento {
  id: number;
  nomeComercial: string;
  principioAtivo: string;
  categoria: Categoria | null;
  tipo: TipoMedicamento;
  fabricante: string;
  apresentacao: string;
  imagem: ImagemMedicamento | null;
}

export interface ResultadoBusca extends Medicamento {
  menorPreco: number | null;
}

export function alternativasDe<T extends Medicamento>(alvo: Medicamento, candidatos: T[]): T[] {
  const principio = normalizarTexto(alvo.principioAtivo);
  return candidatos.filter((m) => m.id !== alvo.id && normalizarTexto(m.principioAtivo) === principio);
}

export function validarMedicamento(input: {
  nomeComercial: string; principioAtivo: string; tipo: TipoMedicamento; imagemUrl?: string | null;
}): void {
  if (!input.nomeComercial?.trim()) throw new DomainError("Informe o nome comercial");
  if (!input.principioAtivo?.trim()) throw new DomainError("Informe o princípio ativo");
  if (!TIPOS_MEDICAMENTO.includes(input.tipo)) throw new DomainError("Tipo de medicamento inválido");
  const url = input.imagemUrl?.trim();
  if (url && !imagemPermitida(url)) throw new DomainError("A foto precisa de um endereço https");
}

/** Aceita https:// ou um arquivo do próprio site ("/medicamentos/x.svg"), nunca "//outro-site". */
export function imagemPermitida(url: string): boolean {
  return url.startsWith("https://") || (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\"));
}

/** Monta a imagem só quando há URL; sem crédito informado, aponta para a fonte. */
export function montarImagem(url?: string | null, credito?: string | null, fonte?: string | null): ImagemMedicamento | null {
  if (!url?.trim()) return null;
  return { url: url.trim(), credito: credito?.trim() || "Imagem ilustrativa", fonte: fonte?.trim() || url.trim() };
}
