import { validarCupom } from "@/domain/cupom";
import { DomainError, NaoAutenticadoError, ProibidoError } from "@/domain/erros";
import { validarFarmacia } from "@/domain/farmacia";
import { validarMedicamento } from "@/domain/medicamento";
import { validarValor } from "@/domain/preco";
import type { UsuarioAtual } from "@/domain/usuario";
import type { BulaInput, CategoriaInput, CupomInput, FarmaciaInput, MedicamentoInput, PrecoInput, Repositorios } from "../ports";

export function exigirAdmin(usuario: UsuarioAtual | null): asserts usuario is UsuarioAtual {
  if (!usuario) throw new NaoAutenticadoError();
  if (usuario.role !== "admin") throw new ProibidoError();
}

function exigirId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) throw new DomainError("Identificador inválido");
}

export type MedicamentoComBulaInput = MedicamentoInput & { bula?: BulaInput };

export function criarCasosAdmin(repos: Repositorios) {
  return {
    async listarMedicamentos(u: UsuarioAtual | null) {
      exigirAdmin(u);
      return repos.medicamentos.buscar("");
    },
    async obterBula(u: UsuarioAtual | null, medicamentoId: number) {
      exigirAdmin(u);
      return repos.bulas.obter(medicamentoId);
    },
    async salvarMedicamento(u: UsuarioAtual | null, input: MedicamentoComBulaInput): Promise<number> {
      exigirAdmin(u);
      validarMedicamento(input);
      const { bula, ...medicamento } = input;
      const id = await repos.medicamentos.salvar({ ...medicamento, nomeComercial: medicamento.nomeComercial.trim(), principioAtivo: medicamento.principioAtivo.trim() });
      if (bula) await repos.bulas.salvar({ ...bula, medicamentoId: id });
      return id;
    },
    async excluirMedicamento(u: UsuarioAtual | null, id: number) {
      exigirAdmin(u);
      exigirId(id);
      await repos.medicamentos.excluir(id);
    },

    async listarCategorias(u: UsuarioAtual | null) {
      exigirAdmin(u);
      return repos.categorias.listar();
    },
    async salvarCategoria(u: UsuarioAtual | null, input: CategoriaInput) {
      exigirAdmin(u);
      if (!input.nome?.trim()) throw new DomainError("Informe o nome da categoria");
      await repos.categorias.salvar({ ...input, nome: input.nome.trim() });
    },
    async excluirCategoria(u: UsuarioAtual | null, id: number) {
      exigirAdmin(u);
      exigirId(id);
      await repos.categorias.excluir(id);
    },

    async listarFarmacias(u: UsuarioAtual | null) {
      exigirAdmin(u);
      return repos.farmacias.listar();
    },
    async salvarFarmacia(u: UsuarioAtual | null, input: FarmaciaInput) {
      exigirAdmin(u);
      validarFarmacia(input);
      await repos.farmacias.salvar(input);
    },
    async excluirFarmacia(u: UsuarioAtual | null, id: number) {
      exigirAdmin(u);
      exigirId(id);
      await repos.farmacias.excluir(id);
    },

    async listarPrecos(u: UsuarioAtual | null) {
      exigirAdmin(u);
      return repos.precos.listarTodos();
    },
    async salvarPreco(u: UsuarioAtual | null, input: PrecoInput) {
      exigirAdmin(u);
      validarValor(input.valor);
      exigirId(input.medicamentoId);
      exigirId(input.farmaciaId);
      await repos.precos.salvar(input);
    },
    async excluirPreco(u: UsuarioAtual | null, id: number) {
      exigirAdmin(u);
      exigirId(id);
      await repos.precos.excluir(id);
    },

    async listarCupons(u: UsuarioAtual | null) {
      exigirAdmin(u);
      return repos.cupons.listar();
    },
    async salvarCupom(u: UsuarioAtual | null, input: CupomInput) {
      exigirAdmin(u);
      validarCupom(input);
      exigirId(input.farmaciaId);
      await repos.cupons.salvar({ ...input, codigo: input.codigo.trim().toUpperCase() });
    },
    async excluirCupom(u: UsuarioAtual | null, id: number) {
      exigirAdmin(u);
      exigirId(id);
      await repos.cupons.excluir(id);
    },

    async listarReportes(u: UsuarioAtual | null) {
      exigirAdmin(u);
      return repos.reportes.listar();
    },
    async resolverReporte(u: UsuarioAtual | null, id: number) {
      exigirAdmin(u);
      exigirId(id);
      await repos.reportes.resolver(id);
    },
  };
}

export type CasosAdmin = ReturnType<typeof criarCasosAdmin>;
