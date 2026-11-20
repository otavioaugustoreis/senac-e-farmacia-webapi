import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { definirContainerParaTestes } from "@/infrastructure/container";
import type { UsuarioAtual } from "@/domain/usuario";
import { GET as getMedicamentos } from "@/app/api/medicamentos/route";
import { GET as getMedicamento } from "@/app/api/medicamentos/[id]/route";
import { GET as getCategorias } from "@/app/api/categorias/route";
import { GET as getProximas } from "@/app/api/farmacias/proximas/route";
import { GET as getCupons } from "@/app/api/cupons/route";
import { POST as postReporte } from "@/app/api/reportes/route";
import { GET as getAdmin, POST as postAdmin } from "@/app/api/admin/[entidade]/route";
import { DELETE as deleteAdmin, PATCH as patchAdmin } from "@/app/api/admin/[entidade]/[id]/route";
import { admin, criarFakes, cupom, dadosVazios, farmacia, med, preco, usuarioComum, type Dados } from "../../unit/application/fakes";

let dados: Dados;
let usuario: UsuarioAtual | null;

function cenario(): Dados {
  const d = dadosVazios();
  d.medicamentos = [med(1, "Novalgina", "Dipirona Sódica", "referencia"), med(2, "Dipirona EMS", "Dipirona Sódica", "generico")];
  d.farmacias = [farmacia(1)];
  d.precos = [preco(10, 1, 1, 10), preco(11, 2, 1, 6)];
  d.cupons = [cupom(1, 1, "2099-12-31T12:00:00Z")];
  return d;
}

const ctx = <T extends Record<string, string>>(params: T) => ({ params: Promise.resolve(params) });
const req = (url: string, init?: RequestInit) => new Request(`http://localhost${url}`, init);
const jsonReq = (url: string, method: string, corpo: unknown) =>
  req(url, { method, body: JSON.stringify(corpo), headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  dados = cenario();
  usuario = null;
  definirContainerParaTestes(async () => ({ repos: criarFakes(dados), usuarioAtual: async () => usuario }));
});

afterEach(() => definirContainerParaTestes(null));

describe("GET /api/medicamentos", () => {
  it("devolve 200 com os resultados da busca", async () => {
    // Arrange
    const request = req("/api/medicamentos?q=dipirona");
    // Act
    const resposta = await getMedicamentos(request);
    // Assert
    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toHaveLength(2);
  });
});

describe("GET /api/medicamentos/:id", () => {
  it("devolve 404 com { erro } para id inexistente", async () => {
    // Arrange
    const request = req("/api/medicamentos/999");
    // Act
    const resposta = await getMedicamento(request, ctx({ id: "999" }));
    // Assert
    expect(resposta.status).toBe(404);
    expect(await resposta.json()).toEqual({ erro: "Medicamento não encontrado" });
  });

  it("devolve 400 para id não numérico", async () => {
    // Arrange
    const request = req("/api/medicamentos/abc");
    // Act
    const resposta = await getMedicamento(request, ctx({ id: "abc" }));
    // Assert
    expect(resposta.status).toBe(400);
  });

  it("devolve 200 com o detalhe", async () => {
    // Arrange
    const request = req("/api/medicamentos/1");
    // Act
    const resposta = await getMedicamento(request, ctx({ id: "1" }));
    // Assert
    expect(resposta.status).toBe(200);
    const corpo = await resposta.json();
    expect(corpo.medicamento.nomeComercial).toBe("Novalgina");
    expect(corpo.alternativas).toHaveLength(1);
  });
});

describe("GET /api/categorias e /api/cupons", () => {
  it("devolve categorias e cupons vigentes", async () => {
    // Arrange
    const rotas = [getCategorias, getCupons];
    // Act
    const [categorias, cupons] = await Promise.all(rotas.map((rota) => rota()));
    // Assert
    expect(categorias.status).toBe(200);
    expect(await categorias.json()).toHaveLength(1);
    expect(await cupons.json()).toHaveLength(1);
  });
});

describe("GET /api/farmacias/proximas", () => {
  it("usa o ponto padrão com lat inválida", async () => {
    // Arrange
    const request = req("/api/farmacias/proximas?lat=x");
    // Act
    const resposta = await getProximas(request);
    // Assert
    expect(resposta.status).toBe(200);
    expect((await resposta.json()).origem.padrao).toBe(true);
  });

  it("usa a posição enviada quando válida", async () => {
    // Arrange
    const request = req("/api/farmacias/proximas?lat=-23.5&lng=-46.6");
    // Act
    const resposta = await getProximas(request);
    // Assert
    expect((await resposta.json()).origem).toEqual({ lat: -23.5, lng: -46.6, padrao: false });
  });
});

describe("POST /api/reportes", () => {
  it("devolve 401 sem login", async () => {
    // Arrange
    const request = jsonReq("/api/reportes", "POST", { precoId: 10, comentario: "mudou" });
    // Act
    const resposta = await postReporte(request);
    // Assert
    expect(resposta.status).toBe(401);
  });

  it("devolve 201 para usuário logado", async () => {
    // Arrange
    usuario = usuarioComum;
    const request = jsonReq("/api/reportes", "POST", { precoId: 10, comentario: "mudou" });
    // Act
    const resposta = await postReporte(request);
    // Assert
    expect(resposta.status).toBe(201);
    expect(dados.reportes).toHaveLength(1);
  });

  it("devolve 400 para JSON inválido", async () => {
    // Arrange
    usuario = usuarioComum;
    const request = req("/api/reportes", { method: "POST", body: "{" });
    // Act
    const resposta = await postReporte(request);
    // Assert
    expect(resposta.status).toBe(400);
  });
});

describe("/api/admin", () => {
  it("devolve 401 sem login", async () => {
    // Arrange
    const request = req("/api/admin/precos");
    // Act
    const resposta = await getAdmin(request, ctx({ entidade: "precos" }));
    // Assert
    expect(resposta.status).toBe(401);
  });

  it("devolve 403 para usuário comum", async () => {
    // Arrange
    usuario = usuarioComum;
    const request = jsonReq("/api/admin/precos", "POST", { medicamentoId: 1, farmaciaId: 1, valor: 9 });
    // Act
    const resposta = await postAdmin(request, ctx({ entidade: "precos" }));
    // Assert
    expect(resposta.status).toBe(403);
  });

  it("devolve 400 para preço zero do admin", async () => {
    // Arrange
    usuario = admin;
    const request = jsonReq("/api/admin/precos", "POST", { medicamentoId: 1, farmaciaId: 1, valor: 0 });
    // Act
    const resposta = await postAdmin(request, ctx({ entidade: "precos" }));
    // Assert
    expect(resposta.status).toBe(400);
    expect((await resposta.json()).erro).toBe("O preço deve ser maior que zero");
  });

  it("grava preço válido do admin com 200", async () => {
    // Arrange
    usuario = admin;
    const request = jsonReq("/api/admin/precos", "POST", { medicamentoId: "2", farmaciaId: "1", valor: "7,49" });
    // Act
    const resposta = await postAdmin(request, ctx({ entidade: "precos" }));
    // Assert
    expect(resposta.status).toBe(200);
    expect(dados.precos.some((p) => p.medicamentoId === 2 && p.valor === 7.49)).toBe(true);
  });

  it("devolve 404 para entidade desconhecida", async () => {
    // Arrange
    usuario = admin;
    const request = req("/api/admin/usuarios");
    // Act
    const resposta = await getAdmin(request, ctx({ entidade: "usuarios" }));
    // Assert
    expect(resposta.status).toBe(404);
  });

  it("exclui com 204", async () => {
    // Arrange
    usuario = admin;
    const request = req("/api/admin/precos/10", { method: "DELETE" });
    // Act
    const resposta = await deleteAdmin(request, ctx({ entidade: "precos", id: "10" }));
    // Assert
    expect(resposta.status).toBe(204);
    expect(dados.precos.some((p) => p.id === 10)).toBe(false);
  });

  it("resolve reporte com PATCH 204", async () => {
    // Arrange
    usuario = admin;
    dados.reportes = [{ id: 5, precoId: 10, userId: "u1", comentario: "", medicamento: "", farmacia: "", valor: 1, criadoEm: new Date(), resolvido: false }];
    const request = req("/api/admin/reportes/5", { method: "PATCH" });
    // Act
    const resposta = await patchAdmin(request, ctx({ entidade: "reportes", id: "5" }));
    // Assert
    expect(resposta.status).toBe(204);
    expect(dados.reportes[0].resolvido).toBe(true);
  });

  it("cria cupom convertendo a validade 'aaaa-mm-dd'", async () => {
    // Arrange
    usuario = admin;
    const request = jsonReq("/api/admin/cupons", "POST", { farmaciaId: 1, codigo: "novo5", descricao: "", desconto: "5%", validade: "2026-12-31" });
    // Act
    const resposta = await postAdmin(request, ctx({ entidade: "cupons" }));
    // Assert
    expect(resposta.status).toBe(200);
    const criado = dados.cupons.find((c) => c.codigo === "NOVO5");
    expect(criado?.validade.toISOString().slice(0, 10)).toBe("2026-12-31");
  });
});
