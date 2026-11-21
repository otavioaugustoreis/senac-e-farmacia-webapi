import { cupomVigente } from "@/domain/cupom";
import { estaDesatualizado } from "@/domain/preco";
import type { ReportePreco } from "@/domain/reporte";
import type { UsuarioAtual } from "@/domain/usuario";
import type { Repositorios } from "../ports";
import { exigirAdmin } from "./admin";
import { montarVitrine, type ItemVitrine } from "./montar-vitrine";

const DIA_MS = 24 * 60 * 60 * 1000;

export interface Painel {
  totais: {
    medicamentos: number; comFoto: number; semPreco: number;
    precos: number; precosDesatualizados: number; precosAtualizadosPct: number;
    farmacias: number; parceiras: number;
    cuponsVigentes: number; cuponsVencidos: number;
    reportesAbertos: number; categorias: number; economiaMediaPct: number | null;
  };
  idadePrecos: { faixa: string; qtd: number; alerta: boolean }[];
  coberturaFarmacias: { id: number; nome: string; parceira: boolean; qtd: number; pct: number }[];
  porCategoria: { nome: string; qtd: number }[];
  semPreco: { id: number; nome: string }[];
  maisAntigos: { precoId: number; medicamento: string; farmacia: string; dias: number }[];
  reportesAbertos: ReportePreco[];
  maioresEconomias: ItemVitrine[];
}

const pct = (parte: number, total: number) => (total ? Math.round((parte / total) * 100) : 0);

/** Dados do dashboard administrativo (indicadores do documento do produto incluídos). */
export const montarPainel = (repos: Repositorios) =>
  async (usuario: UsuarioAtual | null, hoje: Date): Promise<Painel> => {
    exigirAdmin(usuario);

    const [medicamentos, precos, farmacias, cupons, reportes, categorias, vitrine] = await Promise.all([
      repos.medicamentos.buscar(""),
      repos.precos.listarTodos(),
      repos.farmacias.listar(),
      repos.cupons.listar(),
      repos.reportes.listar(),
      repos.categorias.listar(),
      montarVitrine(repos)(hoje),
    ]);

    const idade = (d: Date) => Math.floor((hoje.getTime() - d.getTime()) / DIA_MS);
    const desatualizados = precos.filter((p) => estaDesatualizado(p, hoje));
    const vigentes = cupons.filter((c) => cupomVigente(c, hoje));
    const abertos = reportes.filter((r) => !r.resolvido).sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    const semPreco = medicamentos.filter((m) => m.menorPreco === null);

    const faixas = [
      { faixa: "0 a 2 dias", qtd: 0, alerta: false, max: 2 },
      { faixa: "3 a 5 dias", qtd: 0, alerta: false, max: 5 },
      { faixa: "6 a 7 dias", qtd: 0, alerta: false, max: 7 },
      { faixa: "Mais de 7 dias", qtd: 0, alerta: true, max: Infinity },
    ];
    for (const p of precos) {
      if (estaDesatualizado(p, hoje)) faixas[3].qtd++;
      else faixas.find((f) => idade(p.atualizadoEm) <= f.max)!.qtd++;
    }

    const medicamentosPorFarmacia = new Map<number, Set<number>>();
    for (const p of precos) {
      if (!medicamentosPorFarmacia.has(p.farmacia.id)) medicamentosPorFarmacia.set(p.farmacia.id, new Set());
      medicamentosPorFarmacia.get(p.farmacia.id)!.add(p.medicamentoId);
    }

    const porCategoria = new Map<string, number>();
    for (const m of medicamentos) {
      const nome = m.categoria?.nome ?? "Sem categoria";
      porCategoria.set(nome, (porCategoria.get(nome) ?? 0) + 1);
    }

    return {
      totais: {
        medicamentos: medicamentos.length,
        comFoto: medicamentos.filter((m) => m.imagem).length,
        semPreco: semPreco.length,
        precos: precos.length,
        precosDesatualizados: desatualizados.length,
        precosAtualizadosPct: pct(precos.length - desatualizados.length, precos.length),
        farmacias: farmacias.length,
        parceiras: farmacias.filter((f) => f.parceira).length,
        cuponsVigentes: vigentes.length,
        cuponsVencidos: cupons.length - vigentes.length,
        reportesAbertos: abertos.length,
        categorias: categorias.length,
        economiaMediaPct: vitrine.numeros.economiaMediaPercentual,
      },
      idadePrecos: faixas.map(({ faixa, qtd, alerta }) => ({ faixa, qtd, alerta })),
      coberturaFarmacias: farmacias
        .map((f) => {
          const qtd = medicamentosPorFarmacia.get(f.id)?.size ?? 0;
          return { id: f.id, nome: f.nome, parceira: f.parceira, qtd, pct: pct(qtd, medicamentos.length) };
        })
        .sort((a, b) => b.qtd - a.qtd),
      porCategoria: [...porCategoria].map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd),
      semPreco: semPreco.map((m) => ({ id: m.id, nome: m.nomeComercial })),
      maisAntigos: desatualizados
        .map((p) => ({ precoId: p.id, medicamento: p.medicamento, farmacia: p.farmacia.nome, dias: idade(p.atualizadoEm) }))
        .sort((a, b) => b.dias - a.dias)
        .slice(0, 5),
      reportesAbertos: abertos.slice(0, 5),
      maioresEconomias: vitrine.menoresPrecos.slice(0, 5),
    };
  };
