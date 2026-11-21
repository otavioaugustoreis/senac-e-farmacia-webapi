import { describe, expect, it } from "vitest";
import { cidadeDoEndereco, localSalvoValido, VALIDADE_LOCAL_MS } from "@/lib/localizacao-regras";

describe("cidadeDoEndereco", () => {
  it("usa a cidade quando existe", () => {
    // Arrange
    const endereco = { city: "Campinas", state: "São Paulo" };
    // Act
    const resultado = cidadeDoEndereco(endereco);
    // Assert
    expect(resultado).toBe("Campinas");
  });

  it("usa town ou município quando não há city", () => {
    // Arrange
    const endereco = { town: "Valinhos" };
    // Act
    const resultado = cidadeDoEndereco(endereco);
    // Assert
    expect(resultado).toBe("Valinhos");
  });

  it("devolve null sem dados de cidade", () => {
    // Arrange
    const endereco = { country: "Brasil" };
    // Act
    const resultado = cidadeDoEndereco(endereco);
    // Assert
    expect(resultado).toBeNull();
  });
});

describe("localSalvoValido", () => {
  const agora = 1_800_000_000_000;

  it("aceita local recente com coordenadas válidas", () => {
    // Arrange
    const salvo = { lat: -22.9, lng: -47.06, cidade: "Campinas", ts: agora - 60_000 };
    // Act
    const resultado = localSalvoValido(salvo, agora);
    // Assert
    expect(resultado).toBe(true);
  });

  it("recusa local mais velho que a validade", () => {
    // Arrange
    const salvo = { lat: -22.9, lng: -47.06, cidade: "Campinas", ts: agora - VALIDADE_LOCAL_MS - 1 };
    // Act
    const resultado = localSalvoValido(salvo, agora);
    // Assert
    expect(resultado).toBe(false);
  });

  it("recusa dado corrompido", () => {
    // Arrange
    const salvo = { lat: "x", lng: 1, ts: agora };
    // Act
    const resultado = localSalvoValido(salvo, agora);
    // Assert
    expect(resultado).toBe(false);
  });
});
