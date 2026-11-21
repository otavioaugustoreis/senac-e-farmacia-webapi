import type { Repositorios } from "@/application/ports";
import type { Bula } from "@/domain/bula";
import type { Cupom } from "@/domain/cupom";
import type { Farmacia } from "@/domain/farmacia";
import type { Categoria, Medicamento, ResultadoBusca } from "@/domain/medicamento";
import type { Preco } from "@/domain/preco";
import type { ReportePreco } from "@/domain/reporte";
import type { UsuarioAtual } from "@/domain/usuario";
import { menorPreco } from "@/domain/preco";
import { normalizarTexto } from "@/domain/texto";
import { montarImagem } from "@/domain/medicamento";

export interface Dados {
  categorias: Categoria[];
  medicamentos: Medicamento[];
  bulas: Bula[];
  farmacias: Farmacia[];
  precos: Preco[];
  cupons: Cupom[];
  reportes: (ReportePreco & { userId: string })[];
}

export const usuarioComum: UsuarioAtual = { id: "u1", email: "u@x.com", nome: "Usuária", role: "user" };
export const admin: UsuarioAtual = { id: "a1", email: "user123@gmail.com", nome: "Admin", role: "admin" };

export function med(id: number, nome: string, principioAtivo: string, tipo: Medicamento["tipo"]): Medicamento {
  return { id, nomeComercial: nome, principioAtivo, categoria: { id: 1, nome: "Analgésicos" }, tipo, fabricante: "Lab", apresentacao: "10 comprimidos", imagem: null };
}

export function farmacia(id: number, parceira = true): Farmacia {
  return { id, nome: `Farmácia ${id}`, endereco: `Rua ${id}`, telefone: null, parceira, lat: -23.56 + id / 1000, lng: -46.65 };
}

export function preco(id: number, medicamentoId: number, farmaciaId: number, valor: number, atualizadoEm = new Date("2026-11-19T12:00:00Z")): Preco {
  return { id, medicamentoId, farmacia: { id: farmaciaId, nome: `Farmácia ${farmaciaId}` }, valor, atualizadoEm };
}

export function cupom(id: number, farmaciaId: number, validade: string): Cupom {
  return { id, farmacia: { id: farmaciaId, nome: `Farmácia ${farmaciaId}` }, codigo: `CUPOM${id}`, descricao: "", desconto: "10%", validade: new Date(validade) };
}

export function dadosVazios(): Dados {
  return { categorias: [{ id: 1, nome: "Analgésicos" }], medicamentos: [], bulas: [], farmacias: [], precos: [], cupons: [], reportes: [] };
}

/** Repositórios em memória para testar casos de uso sem banco. */
export function criarFakes(d: Dados): Repositorios {
  const resultado = (m: Medicamento): ResultadoBusca => ({
    ...m,
    menorPreco: menorPreco(d.precos.filter((p) => p.medicamentoId === m.id))?.valor ?? null,
  });
  let proximoId = 1000;

  return {
    medicamentos: {
      async buscar(q, categoriaId) {
        const termo = normalizarTexto(q);
        return d.medicamentos
          .filter((m) => !termo || normalizarTexto(m.nomeComercial).includes(termo) || normalizarTexto(m.principioAtivo).includes(termo))
          .filter((m) => categoriaId === undefined || m.categoria?.id === categoriaId)
          .map(resultado);
      },
      async obterPorId(id) {
        return d.medicamentos.find((m) => m.id === id) ?? null;
      },
      async listarPorPrincipioAtivo(p) {
        return d.medicamentos.filter((m) => normalizarTexto(m.principioAtivo) === normalizarTexto(p)).map(resultado);
      },
      async salvar(input) {
        const id = input.id ?? ++proximoId;
        const categoria = d.categorias.find((c) => c.id === input.categoriaId) ?? null;
        const novo: Medicamento = { id, nomeComercial: input.nomeComercial, principioAtivo: input.principioAtivo, categoria, tipo: input.tipo, fabricante: input.fabricante, apresentacao: input.apresentacao, imagem: montarImagem(input.imagemUrl, input.imagemCredito, input.imagemFonte) };
        d.medicamentos = [...d.medicamentos.filter((m) => m.id !== id), novo];
        return id;
      },
      async excluir(id) {
        d.medicamentos = d.medicamentos.filter((m) => m.id !== id);
      },
    },
    bulas: {
      async obter(id) {
        return d.bulas.find((b) => b.medicamentoId === id) ?? null;
      },
      async salvar(b) {
        d.bulas = [...d.bulas.filter((x) => x.medicamentoId !== b.medicamentoId), b];
      },
    },
    precos: {
      async listarPorMedicamento(id) {
        return d.precos.filter((p) => p.medicamentoId === id);
      },
      async listarTodos() {
        return d.precos.map((p) => ({ ...p, medicamento: d.medicamentos.find((m) => m.id === p.medicamentoId)?.nomeComercial ?? "" }));
      },
      async salvar(input) {
        const id = input.id ?? ++proximoId;
        const f = d.farmacias.find((x) => x.id === input.farmaciaId);
        d.precos = [...d.precos.filter((p) => p.id !== id), { id, medicamentoId: input.medicamentoId, farmacia: { id: input.farmaciaId, nome: f?.nome ?? "" }, valor: input.valor, atualizadoEm: new Date() }];
      },
      async excluir(id) {
        d.precos = d.precos.filter((p) => p.id !== id);
      },
    },
    farmacias: {
      async proximas(lat, lng) {
        return d.farmacias
          .map((f) => ({ ...f, distanciaKm: Math.hypot(f.lat - lat, f.lng - lng) * 111 }))
          .sort((a, b) => a.distanciaKm - b.distanciaKm);
      },
      async listar() {
        return d.farmacias;
      },
      async salvar(input) {
        const id = input.id ?? ++proximoId;
        d.farmacias = [...d.farmacias.filter((f) => f.id !== id), { ...input, id }];
      },
      async excluir(id) {
        d.farmacias = d.farmacias.filter((f) => f.id !== id);
      },
    },
    cupons: {
      async listar() {
        return d.cupons;
      },
      async salvar(input) {
        const id = input.id ?? ++proximoId;
        d.cupons = [...d.cupons.filter((c) => c.id !== id), { id, farmacia: { id: input.farmaciaId, nome: "" }, codigo: input.codigo, descricao: input.descricao, desconto: input.desconto, validade: input.validade }];
      },
      async excluir(id) {
        d.cupons = d.cupons.filter((c) => c.id !== id);
      },
    },
    categorias: {
      async listar() {
        return d.categorias;
      },
      async salvar(input) {
        const id = input.id ?? ++proximoId;
        d.categorias = [...d.categorias.filter((c) => c.id !== id), { id, nome: input.nome }];
      },
      async excluir(id) {
        d.categorias = d.categorias.filter((c) => c.id !== id);
      },
    },
    reportes: {
      async criar(r) {
        const p = d.precos.find((x) => x.id === r.precoId);
        d.reportes.push({ id: ++proximoId, precoId: r.precoId, userId: r.userId, comentario: r.comentario, medicamento: "", farmacia: p?.farmacia.nome ?? "", valor: p?.valor ?? 0, criadoEm: new Date(), resolvido: false });
      },
      async listar() {
        return d.reportes;
      },
      async resolver(id) {
        d.reportes = d.reportes.map((r) => (r.id === id ? { ...r, resolvido: true } : r));
      },
    },
  };
}
