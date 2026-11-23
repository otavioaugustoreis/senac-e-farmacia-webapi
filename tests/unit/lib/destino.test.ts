import { describe, expect, it } from "vitest";
import { destinationAfterLogin, safeDestination } from "@/lib/destino";

describe("destinoAposLogin", () => {
  it("leva o admin para o painel quando não havia destino", () => {
    // Arrange
    const [next, role] = ["/", "admin" as const];
    // Act
    const result = destinationAfterLogin(next, role);
    // Assert
    expect(result).toBe("/admin");
  });

  it("respeita o destino pedido pelo admin", () => {
    // Arrange
    const [next, role] = ["/medicamento/4", "admin" as const];
    // Act
    const result = destinationAfterLogin(next, role);
    // Assert
    expect(result).toBe("/medicamento/4");
  });

  it("mantém usuário comum na página inicial", () => {
    // Arrange
    const [next, role] = [null, "user" as const];
    // Act
    const result = destinationAfterLogin(next, role);
    // Assert
    expect(result).toBe("/");
  });
});

describe("destinoSeguro", () => {
  it("mantém caminho interno", () => {
    // Arrange
    const next = "/medicamento/1";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/medicamento/1");
  });

  it("troca URL externa pela página inicial", () => {
    // Arrange
    const next = "https://golpe.example";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });

  it("troca caminho com // (protocolo relativo) pela página inicial", () => {
    // Arrange
    const next = "//golpe.example";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });

  it("troca caminho com tabulação que o navegador transforma em // pela página inicial", () => {
    // Arrange
    const next = "/\t/evil.com";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });

  it("troca caminho com barra invertida pela página inicial", () => {
    // Arrange
    const next = "/\\evil.com";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });

  it("mantém caminho interno com parâmetros", () => {
    // Arrange
    const next = "/busca?q=dipirona";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/busca?q=dipirona");
  });

  it("troca valor ausente pela página inicial", () => {
    // Arrange
    const next = null;
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });
});
