import { describe, expect, it } from "vitest";
import { validCoordinates, filterPharmacies, DEFAULT_POINT, validatePharmacy } from "@/domain/farmacia";
import { DomainError } from "@/domain/erros";

describe("coordenadasValidas", () => {
  it("aceita o ponto padrão da Av. Paulista", () => {
    // Arrange
    const { lat, lng } = DEFAULT_POINT;
    // Act
    const result = validCoordinates(lat, lng);
    // Assert
    expect(result).toBe(true);
    expect(DEFAULT_POINT).toEqual({ lat: -23.5614, lng: -46.6559 });
  });

  it("rejeita texto no lugar de número", () => {
    // Arrange
    const [lat, lng] = ["abc", 1];
    // Act
    const result = validCoordinates(lat, lng);
    // Assert
    expect(result).toBe(false);
  });

  it("rejeita latitude fora do intervalo", () => {
    // Arrange
    const [lat, lng] = [91, 0];
    // Act
    const result = validCoordinates(lat, lng);
    // Assert
    expect(result).toBe(false);
  });
});

describe("validarFarmacia", () => {
  it("rejeita farmácia com coordenadas inválidas", () => {
    // Arrange
    const input = { name: "Drogaria", address: "Rua A, 1", lat: 200, lng: 0 };
    // Act
    const action = () => validatePharmacy(input);
    // Assert
    expect(action).toThrow(DomainError);
    expect(action).toThrow("Coordenadas inválidas");
  });
});

describe("filtrarFarmacias", () => {
  const list = [
    { name: "Farmácia Oscar Freire", address: "R. Oscar Freire, 900 — Jardim Paulista" },
    { name: "Drogaria Saúde Augusta", address: "R. Augusta, 1500 — Consolação" },
    { name: "Drogaria Frei Caneca", address: "R. Frei Caneca, 300 — Bela Vista" },
  ];

  it("devolve todas quando o termo está vazio", () => {
    // Arrange
    const query = "   ";
    // Act
    const result = filterPharmacies(list, query);
    // Assert
    expect(result).toHaveLength(3);
  });

  it("encontra pelo nome sem diferenciar acento nem maiúsculas", () => {
    // Arrange
    const query = "SAUDE";
    // Act
    const result = filterPharmacies(list, query);
    // Assert
    expect(result.map((f) => f.name)).toEqual(["Drogaria Saúde Augusta"]);
  });

  it("encontra pelo bairro do endereço", () => {
    // Arrange
    const query = "consolacao";
    // Act
    const result = filterPharmacies(list, query);
    // Assert
    expect(result.map((f) => f.name)).toEqual(["Drogaria Saúde Augusta"]);
  });

  it("exige todas as palavras do termo, em qualquer ordem", () => {
    // Arrange
    const query = "drogaria vista";
    // Act
    const result = filterPharmacies(list, query);
    // Assert
    expect(result.map((f) => f.name)).toEqual(["Drogaria Frei Caneca"]);
  });
});
