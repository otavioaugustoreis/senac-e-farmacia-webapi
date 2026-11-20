import { cupomVigente, type Cupom } from "@/domain/cupom";
import type { Farmacia } from "@/domain/farmacia";
import type { Categoria, ResultadoBusca } from "@/domain/medicamento";
import { economiaPercentual } from "@/domain/preco";
import { normalizarTexto } from "@/domain/texto";
import type { Repositorios } from "../ports";

export type ItemVitrine = ResultadoBusca & { precoReferencia: number | null; economiaPercentual: number | null };

export interface Vitrine {
  categorias: Categoria[];
  menoresPrecos: ItemVitrine[];
  farmaciasParceiras: Farmacia[];
  cupons: Cupom[];
  numeros: { medicamentos: number; farmacias: number; economiaMediaPercentual: number | null };
}

const LIMITE_VITRINE = 8;
const LIMITE_CUPONS = 2;

export const montarVitrine = (repos: Pick<Repositorios, "medicamentos" | "farmacias" | "cupons" | "categorias">) =>
  async (hoje: Date): Promise<Vitrine> => {
    const [todos, farmacias, cupons, categorias] = await Promise.all([
      repos.medicamentos.buscar(""),
      repos.farmacias.listar(),
      repos.cupons.listar(),
      repos.categorias.listar(),
    ]);

    const referenciaPorPrincipio = new Map<string, number>();
    for (const m of todos) {
      if (m.tipo !== "referencia" || m.menorPreco === null) continue;
      const chave = normalizarTexto(m.principioAtivo);
      const atual = referenciaPorPrincipio.get(chave);
      if (atual === undefined || m.menorPreco < atual) referenciaPorPrincipio.set(chave, m.menorPreco);
    }

    const itens: ItemVitrine[] = todos
      .filter((m) => m.tipo !== "referencia" && m.menorPreco !== null)
      .map((m) => {
        const precoReferencia = referenciaPorPrincipio.get(normalizarTexto(m.principioAtivo)) ?? null;
        return { ...m, precoReferencia, economiaPercentual: economiaPercentual(m.menorPreco, precoReferencia) };
      });

    const economias = itens.map((i) => i.economiaPercentual).filter((e): e is number => e !== null);
    const menoresPrecos = [...itens]
      .sort((a, b) => (b.economiaPercentual ?? -1) - (a.economiaPercentual ?? -1))
      .slice(0, LIMITE_VITRINE);

    return {
      categorias,
      menoresPrecos,
      farmaciasParceiras: farmacias.filter((f) => f.parceira),
      cupons: cupons.filter((c) => cupomVigente(c, hoje)).slice(0, LIMITE_CUPONS),
      numeros: {
        medicamentos: todos.length,
        farmacias: farmacias.length,
        economiaMediaPercentual: economias.length ? Math.round(economias.reduce((s, e) => s + e, 0) / economias.length) : null,
      },
    };
  };
