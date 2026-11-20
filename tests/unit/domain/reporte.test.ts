import { describe, expect, it } from "vitest";
import { normalizarComentario } from "@/domain/reporte";
import { DomainError } from "@/domain/erros";

describe("normalizarComentario", () => {
  it("remove espaços nas pontas", () => {
    // Arrange
    const comentario = "  preço mudou  ";
    // Act
    const resultado = normalizarComentario(comentario);
    // Assert
    expect(resultado).toBe("preço mudou");
  });

  it("rejeita comentário com mais de 500 caracteres", () => {
    // Arrange
    const comentario = "a".repeat(501);
    // Act
    const acao = () => normalizarComentario(comentario);
    // Assert
    expect(acao).toThrow(DomainError);
    expect(acao).toThrow("Comentário muito longo");
  });
});
