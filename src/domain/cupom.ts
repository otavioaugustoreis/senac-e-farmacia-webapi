import { DomainError } from "./erros";

export interface Cupom {
  id: number;
  farmacia: { id: number; nome: string; endereco: string };
  codigo: string;
  descricao: string;
  desconto: string;
  validade: Date;
}

const TZ = "America/Sao_Paulo";
const diaSP = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** Data no calendário de São Paulo, como "2026-11-20" (comparável como texto). */
export function diaEmSaoPaulo(d: Date): string {
  return diaSP.format(d);
}

export function cupomVigente(c: Pick<Cupom, "validade">, hoje: Date): boolean {
  return diaEmSaoPaulo(c.validade) >= diaEmSaoPaulo(hoje);
}

export function validarCupom(input: { codigo: string; desconto: string; validade: Date }): void {
  if (!input.codigo?.trim()) throw new DomainError("Informe o código do cupom");
  if (!input.desconto?.trim()) throw new DomainError("Informe o desconto");
  if (!(input.validade instanceof Date) || Number.isNaN(input.validade.getTime())) throw new DomainError("Validade inválida");
}
