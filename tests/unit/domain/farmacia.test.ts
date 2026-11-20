import { describe, expect, it } from "vitest";
import { coordenadasValidas, PONTO_PADRAO, validarFarmacia } from "@/domain/farmacia";
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
