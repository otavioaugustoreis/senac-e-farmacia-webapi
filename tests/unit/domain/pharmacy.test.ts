import { describe, expect, it } from "vitest";
import { validCoordinates, filterPharmacies, DEFAULT_POINT, validatePharmacy } from "@/domain/pharmacy";
import { DomainError } from "@/domain/errors";

describe("validCoordinates", () => {
  it("accepts the default point on Av. Paulista", () => {
    // Arrange
    const { lat, lng } = DEFAULT_POINT;
    // Act
    const result = validCoordinates(lat, lng);
    // Assert
    expect(result).toBe(true);
    expect(DEFAULT_POINT).toEqual({ lat: -23.5614, lng: -46.6559 });
  });

  it("rejects text instead of a number", () => {
    // Arrange
    const [lat, lng] = ["abc", 1];
    // Act
    const result = validCoordinates(lat, lng);
    // Assert
    expect(result).toBe(false);
  });

  it("rejects a latitude out of range", () => {
    // Arrange
    const [lat, lng] = [91, 0];
    // Act
    const result = validCoordinates(lat, lng);
    // Assert
    expect(result).toBe(false);
  });
});

describe("validatePharmacy", () => {
  it("rejects a pharmacy with invalid coordinates", () => {
    // Arrange
    const input = { name: "Drogaria", address: "Rua A, 1", lat: 200, lng: 0 };
    // Act
    const action = () => validatePharmacy(input);
    // Assert
    expect(action).toThrow(DomainError);
    expect(action).toThrow("Coordenadas inválidas");
  });
});

describe("filterPharmacies", () => {
  const list = [
    { name: "Farmácia Oscar Freire", address: "R. Oscar Freire, 900 — Jardim Paulista" },
    { name: "Drogaria Saúde Augusta", address: "R. Augusta, 1500 — Consolação" },
    { name: "Drogaria Frei Caneca", address: "R. Frei Caneca, 300 — Bela Vista" },
  ];

  it("returns all when the query is empty", () => {
    // Arrange
    const query = "   ";
    // Act
    const result = filterPharmacies(list, query);
    // Assert
    expect(result).toHaveLength(3);
  });

  it("finds by name ignoring accents and case", () => {
    // Arrange
    const query = "SAUDE";
    // Act
    const result = filterPharmacies(list, query);
    // Assert
    expect(result.map((f) => f.name)).toEqual(["Drogaria Saúde Augusta"]);
  });

  it("finds by the neighborhood in the address", () => {
    // Arrange
    const query = "consolacao";
    // Act
    const result = filterPharmacies(list, query);
    // Assert
    expect(result.map((f) => f.name)).toEqual(["Drogaria Saúde Augusta"]);
  });

  it("requires every word of the query, in any order", () => {
    // Arrange
    const query = "drogaria vista";
    // Act
    const result = filterPharmacies(list, query);
    // Assert
    expect(result.map((f) => f.name)).toEqual(["Drogaria Frei Caneca"]);
  });
});
