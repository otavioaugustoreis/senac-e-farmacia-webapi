import { describe, expect, it } from "vitest";
import { cityFromAddress, isSavedLocationValid, LOCATION_TTL_MS } from "@/lib/localizacao-regras";

describe("cidadeDoEndereco", () => {
  it("usa a cidade quando existe", () => {
    // Arrange
    const address = { city: "Campinas", state: "São Paulo" };
    // Act
    const result = cityFromAddress(address);
    // Assert
    expect(result).toBe("Campinas");
  });

  it("usa town ou município quando não há city", () => {
    // Arrange
    const address = { town: "Valinhos" };
    // Act
    const result = cityFromAddress(address);
    // Assert
    expect(result).toBe("Valinhos");
  });

  it("devolve null sem dados de cidade", () => {
    // Arrange
    const address = { country: "Brasil" };
    // Act
    const result = cityFromAddress(address);
    // Assert
    expect(result).toBeNull();
  });
});

describe("localSalvoValido", () => {
  const now = 1_800_000_000_000;

  it("aceita local recente com coordenadas válidas", () => {
    // Arrange
    const saved = { lat: -22.9, lng: -47.06, city: "Campinas", ts: now - 60_000 };
    // Act
    const result = isSavedLocationValid(saved, now);
    // Assert
    expect(result).toBe(true);
  });

  it("recusa local mais velho que a validade", () => {
    // Arrange
    const saved = { lat: -22.9, lng: -47.06, city: "Campinas", ts: now - LOCATION_TTL_MS - 1 };
    // Act
    const result = isSavedLocationValid(saved, now);
    // Assert
    expect(result).toBe(false);
  });

  it("recusa dado corrompido", () => {
    // Arrange
    const saved = { lat: "x", lng: 1, ts: now };
    // Act
    const result = isSavedLocationValid(saved, now);
    // Assert
    expect(result).toBe(false);
  });
});
