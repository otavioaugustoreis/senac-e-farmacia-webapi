import { describe, expect, it } from "vitest";
import { destinoSeguro } from "@/lib/destino";

describe("destinoSeguro", () => {
  it("mantém caminho interno", () => {
    // Arrange
    const next = "/medicamento/1";
    // Act
    const resultado = destinoSeguro(next);
    // Assert
    expect(resultado).toBe("/medicamento/1");
  });

  it("troca URL externa pela página inicial", () => {
    // Arrange
    const next = "https://golpe.example";
    // Act
    const resultado = destinoSeguro(next);
    // Assert
    expect(resultado).toBe("/");
  });

  it("troca caminho com // (protocolo relativo) pela página inicial", () => {
    // Arrange
    const next = "//golpe.example";
    // Act
    const resultado = destinoSeguro(next);
    // Assert
    expect(resultado).toBe("/");
  });

  it("troca caminho com tabulação que o navegador transforma em // pela página inicial", () => {
    // Arrange
    const next = "/\t/evil.com";
    // Act
    const resultado = destinoSeguro(next);
    // Assert
    expect(resultado).toBe("/");
  });

  it("troca caminho com barra invertida pela página inicial", () => {
    // Arrange
    const next = "/\\evil.com";
    // Act
    const resultado = destinoSeguro(next);
    // Assert
    expect(resultado).toBe("/");
  });

  it("mantém caminho interno com parâmetros", () => {
    // Arrange
    const next = "/busca?q=dipirona";
    // Act
    const resultado = destinoSeguro(next);
    // Assert
    expect(resultado).toBe("/busca?q=dipirona");
  });

  it("troca valor ausente pela página inicial", () => {
    // Arrange
    const next = null;
    // Act
    const resultado = destinoSeguro(next);
    // Assert
    expect(resultado).toBe("/");
  });
});
