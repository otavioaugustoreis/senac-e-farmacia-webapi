import { describe, expect, it } from "vitest";
import { coordenadasValidas, filtrarFarmacias, PONTO_PADRAO, validarFarmacia } from "@/domain/farmacia";
import { DomainError } from "@/domain/erros";

describe("coordenadasValidas", () => {
  it("aceita o ponto padrão da Av. Paulista", () => {
    // Arrange
    const { lat, lng } = PONTO_PADRAO;
    // Act
    const resultado = coordenadasValidas(lat, lng);
    // Assert
    expect(resultado).toBe(true);
    expect(PONTO_PADRAO).toEqual({ lat: -23.5614, lng: -46.6559 });
  });

  it("rejeita texto no lugar de número", () => {
    // Arrange
    const [lat, lng] = ["abc", 1];
    // Act
    const resultado = coordenadasValidas(lat, lng);
    // Assert
    expect(resultado).toBe(false);
  });

  it("rejeita latitude fora do intervalo", () => {
    // Arrange
    const [lat, lng] = [91, 0];
    // Act
    const resultado = coordenadasValidas(lat, lng);
    // Assert
    expect(resultado).toBe(false);
  });
});

describe("validarFarmacia", () => {
  it("rejeita farmácia com coordenadas inválidas", () => {
    // Arrange
    const input = { nome: "Drogaria", endereco: "Rua A, 1", lat: 200, lng: 0 };
    // Act
    const acao = () => validarFarmacia(input);
    // Assert
    expect(acao).toThrow(DomainError);
    expect(acao).toThrow("Coordenadas inválidas");
  });
});

describe("filtrarFarmacias", () => {
  const lista = [
    { nome: "Farmácia Oscar Freire", endereco: "R. Oscar Freire, 900 — Jardim Paulista" },
    { nome: "Drogaria Saúde Augusta", endereco: "R. Augusta, 1500 — Consolação" },
    { nome: "Drogaria Frei Caneca", endereco: "R. Frei Caneca, 300 — Bela Vista" },
  ];

  it("devolve todas quando o termo está vazio", () => {
    // Arrange
    const termo = "   ";
    // Act
    const resultado = filtrarFarmacias(lista, termo);
    // Assert
    expect(resultado).toHaveLength(3);
  });

  it("encontra pelo nome sem diferenciar acento nem maiúsculas", () => {
    // Arrange
    const termo = "SAUDE";
    // Act
    const resultado = filtrarFarmacias(lista, termo);
    // Assert
    expect(resultado.map((f) => f.nome)).toEqual(["Drogaria Saúde Augusta"]);
  });

  it("encontra pelo bairro do endereço", () => {
    // Arrange
    const termo = "consolacao";
    // Act
    const resultado = filtrarFarmacias(lista, termo);
    // Assert
    expect(resultado.map((f) => f.nome)).toEqual(["Drogaria Saúde Augusta"]);
  });

  it("exige todas as palavras do termo, em qualquer ordem", () => {
    // Arrange
    const termo = "drogaria vista";
    // Act
    const resultado = filtrarFarmacias(lista, termo);
    // Assert
    expect(resultado.map((f) => f.nome)).toEqual(["Drogaria Frei Caneca"]);
  });
});
