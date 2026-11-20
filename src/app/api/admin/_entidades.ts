import { criarCasosAdmin, exigirAdmin, type CasosAdmin } from "@/application/casos-de-uso/admin";
import { NaoEncontradoError } from "@/domain/erros";
import type { UsuarioAtual } from "@/domain/usuario";
import { obterContainer } from "@/infrastructure/container";
import { paraCategoria, paraCupom, paraFarmacia, paraMedicamento, paraPreco } from "./_entradas";

type U = UsuarioAtual | null;
type Corpo = Record<string, unknown>;

interface OperacoesEntidade {
  listar: (u: U) => Promise<unknown>;
  salvar?: (u: U, corpo: Corpo) => Promise<unknown>;
  excluir?: (u: U, id: number) => Promise<void>;
  obter?: (u: U, id: number) => Promise<unknown>;
  resolver?: (u: U, id: number) => Promise<void>;
}

function operacoes(c: CasosAdmin): Record<string, OperacoesEntidade> {
  return {
    medicamentos: {
      listar: c.listarMedicamentos,
      salvar: async (u, corpo) => ({ id: await c.salvarMedicamento(u, paraMedicamento(corpo)) }),
      excluir: c.excluirMedicamento,
      obter: async (u, id) => ({ bula: await c.obterBula(u, id) }),
    },
    categorias: { listar: c.listarCategorias, salvar: (u, corpo) => c.salvarCategoria(u, paraCategoria(corpo)), excluir: c.excluirCategoria },
    farmacias: { listar: c.listarFarmacias, salvar: (u, corpo) => c.salvarFarmacia(u, paraFarmacia(corpo)), excluir: c.excluirFarmacia },
    precos: { listar: c.listarPrecos, salvar: (u, corpo) => c.salvarPreco(u, paraPreco(corpo)), excluir: c.excluirPreco },
    cupons: { listar: c.listarCupons, salvar: (u, corpo) => c.salvarCupom(u, paraCupom(corpo)), excluir: c.excluirCupom },
    reportes: { listar: c.listarReportes, resolver: c.resolverReporte },
  };
}

/**
 * Confirma que é admin (401/403) antes de olhar a entidade ou o corpo;
 * depois resolve a entidade da URL (desconhecida → 404).
 */
export async function prepararAdmin(entidade: string) {
  const { repos, usuarioAtual } = await obterContainer();
  const usuario = await usuarioAtual();
  exigirAdmin(usuario);
  const ops = operacoes(criarCasosAdmin(repos))[entidade];
  if (!ops) throw new NaoEncontradoError("Recurso não encontrado");
  return { ops, usuario };
}

export function exigirOperacao<T>(op: T | undefined): T {
  if (!op) throw new NaoEncontradoError("Operação não disponível");
  return op;
}
