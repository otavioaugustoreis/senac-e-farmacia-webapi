import { describe, expect, it } from "vitest";
import { formatBRL, formatData, formatKm } from "@/lib/format";

describe("formatBRL", () => {
  it("formata valor em reais com vírgula e espaço comum", () => {
    // Arrange
    const valor = 12.9;
    // Act
    const resultado = formatBRL(valor);
    // Assert
    expect(resultado).toBe("R$ 12,90");
  });
});

describe("formatData", () => {
  it("formata data ISO como dd/mm/aaaa no fuso de São Paulo", () => {
    // Arrange
    const iso = "2026-11-20T10:00:00Z";
    // Act
    const resultado = formatData(iso);
    // Assert
    expect(resultado).toBe("20/11/2026");
  });
});

describe("formatKm", () => {
  it("formata distância com uma casa decimal", () => {
    // Arrange
    const km = 1.234;
    // Act
    const resultado = formatKm(km);
    // Assert
    expect(resultado).toBe("1,2 km");
  });
});
