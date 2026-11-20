import { describe, expect, it } from "vitest";
import { criarCasosAdmin, exigirAdmin } from "@/application/casos-de-uso/admin";
import { DomainError, NaoAutenticadoError, ProibidoError } from "@/domain/erros";
import { admin, criarFakes, dadosVazios, farmacia, med, usuarioComum } from "./fakes";

function cenario() {
  const d = dadosVazios();
  d.medicamentos = [med(1, "Novalgina", "Dipirona Sódica", "referencia")];
  d.farmacias = [farmacia(1)];
  return d;
}

describe("exigirAdmin", () => {
  it("lança NaoAutenticadoError sem usuário", () => {
    // Arrange
    const usuario = null;
    // Act
    const acao = () => exigirAdmin(usuario);
    // Assert
    expect(acao).toThrow(NaoAutenticadoError);
  });

  it("lança ProibidoError para usuário comum", () => {
    // Arrange
    const usuario = usuarioComum;
    // Act
    const acao = () => exigirAdmin(usuario);
    // Assert
    expect(acao).toThrow(ProibidoError);
  });
});

describe("salvarPreco", () => {
  it("recusa usuário comum", async () => {
    // Arrange
    const casos = criarCasosAdmin(criarFakes(cenario()));
    // Act
    const acao = casos.salvarPreco(usuarioComum, { medicamentoId: 1, farmaciaId: 1, valor: 9 });
    // Assert
    await expect(acao).rejects.toBeInstanceOf(ProibidoError);
  });

  it("recusa valor zero", async () => {
    // Arrange
    const casos = criarCasosAdmin(criarFakes(cenario()));
    // Act
    const acao = casos.salvarPreco(admin, { medicamentoId: 1, farmaciaId: 1, valor: 0 });
    // Assert
    await expect(acao).rejects.toBeInstanceOf(DomainError);
  });

  it("grava preço válido do admin", async () => {
    // Arrange
    const dados = cenario();
    const casos = criarCasosAdmin(criarFakes(dados));
    // Act
    await casos.salvarPreco(admin, { medicamentoId: 1, farmaciaId: 1, valor: 9.9 });
    // Assert
    expect(dados.precos).toHaveLength(1);
    expect(dados.precos[0].valor).toBe(9.9);
  });
});

describe("salvarMedicamento", () => {
  it("grava medicamento e bula juntos", async () => {
    // Arrange
    const dados = cenario();
    const casos = criarCasosAdmin(criarFakes(dados));
    const bula = { paraQueServe: "Dor", contraindicacoes: "", efeitosColaterais: "", advertencias: "", linkAnvisa: "" };
    // Act
    const id = await casos.salvarMedicamento(admin, {
      nomeComercial: "Dorflex", principioAtivo: "Dipirona + Orfenadrina", categoriaId: 1, tipo: "referencia", fabricante: "Sanofi", apresentacao: "10 comprimidos", bula,
    });
    // Assert
    expect(dados.medicamentos.some((m) => m.id === id && m.nomeComercial === "Dorflex")).toBe(true);
    expect(dados.bulas.find((b) => b.medicamentoId === id)?.paraQueServe).toBe("Dor");
  });

  it("recusa medicamento sem nome", async () => {
    // Arrange
    const casos = criarCasosAdmin(criarFakes(cenario()));
    // Act
    const acao = casos.salvarMedicamento(admin, { nomeComercial: "", principioAtivo: "X", categoriaId: null, tipo: "generico", fabricante: "", apresentacao: "" });
    // Assert
    await expect(acao).rejects.toThrow("Informe o nome comercial");
  });
});

describe("salvarFarmacia", () => {
  it("recusa coordenadas inválidas", async () => {
    // Arrange
    const casos = criarCasosAdmin(criarFakes(cenario()));
    // Act
    const acao = casos.salvarFarmacia(admin, { nome: "Drogaria", endereco: "Rua A", telefone: null, parceira: false, lat: 999, lng: 0 });
    // Assert
    await expect(acao).rejects.toThrow("Coordenadas inválidas");
  });
});

describe("resolverReporte", () => {
  it("marca o reporte como resolvido", async () => {
    // Arrange
    const dados = cenario();
    dados.reportes = [{ id: 5, precoId: 1, userId: "u1", comentario: "", medicamento: "", farmacia: "", valor: 1, criadoEm: new Date(), resolvido: false }];
    const casos = criarCasosAdmin(criarFakes(dados));
    // Act
    await casos.resolverReporte(admin, 5);
    // Assert
    expect(dados.reportes[0].resolvido).toBe(true);
  });
});
