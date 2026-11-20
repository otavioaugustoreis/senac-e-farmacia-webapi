import { COMO_USAR_PADRAO, type Bula } from "@/domain/bula";
import { cupomVigente, type Cupom } from "@/domain/cupom";
import { NaoEncontradoError } from "@/domain/erros";
import { alternativasDe, type Medicamento, type ResultadoBusca } from "@/domain/medicamento";
import { estaDesatualizado, menorPreco, ordenarPorValor, type Preco } from "@/domain/preco";
import type { Repositorios } from "../ports";

export interface DetalheMedicamento {
  medicamento: Medicamento;
  bula: Bula | null;
  comoUsar: string;
  precos: (Preco & { desatualizado: boolean })[];
  menorPreco: Preco | null;
  alternativas: ResultadoBusca[];
  cupons: Cupom[];
}

export const detalharMedicamento = (repos: Pick<Repositorios, "medicamentos" | "bulas" | "precos" | "cupons">) =>
  async (id: number, hoje: Date): Promise<DetalheMedicamento> => {
    const medicamento = await repos.medicamentos.obterPorId(id);
    if (!medicamento) throw new NaoEncontradoError("Medicamento não encontrado");

    const [bula, precosBrutos, mesmoPrincipio, cupons] = await Promise.all([
      repos.bulas.obter(id),
      repos.precos.listarPorMedicamento(id),
      repos.medicamentos.listarPorPrincipioAtivo(medicamento.principioAtivo),
      repos.cupons.listar(),
    ]);

    const precos = ordenarPorValor(precosBrutos).map((p) => ({ ...p, desatualizado: estaDesatualizado(p, hoje) }));
    const farmaciasComPreco = new Set(precos.map((p) => p.farmacia.id));

    return {
      medicamento,
      bula,
      comoUsar: COMO_USAR_PADRAO,
      precos,
      menorPreco: menorPreco(precosBrutos),
      alternativas: alternativasDe(medicamento, mesmoPrincipio),
      cupons: cupons.filter((c) => farmaciasComPreco.has(c.farmacia.id) && cupomVigente(c, hoje)),
    };
  };
