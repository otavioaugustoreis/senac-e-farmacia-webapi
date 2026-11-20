import { DomainError } from "./erros";

export interface Preco {
  id: number;
  medicamentoId: number;
  farmacia: { id: number; nome: string };
  valor: number;
  atualizadoEm: Date;
}

const DIA_MS = 24 * 60 * 60 * 1000;
export const DIAS_PARA_DESATUALIZAR = 7;

export function menorPreco<T extends { valor: number }>(precos: T[]): T | null {
  return precos.reduce<T | null>((menor, p) => (menor === null || p.valor < menor.valor ? p : menor), null);
}

export function ordenarPorValor<T extends { valor: number }>(precos: T[]): T[] {
  return [...precos].sort((a, b) => a.valor - b.valor);
}

export function estaDesatualizado(p: Pick<Preco, "atualizadoEm">, hoje: Date, dias = DIAS_PARA_DESATUALIZAR): boolean {
  return hoje.getTime() - p.atualizadoEm.getTime() > dias * DIA_MS;
}

export function validarValor(valor: number): void {
  if (!Number.isFinite(valor) || valor <= 0) throw new DomainError("O preço deve ser maior que zero");
}

export function economiaPercentual(valor: number | null, referencia: number | null): number | null {
  if (valor === null || referencia === null || referencia <= valor) return null;
  return Math.round((1 - valor / referencia) * 100);
}
