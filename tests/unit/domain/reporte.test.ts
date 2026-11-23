import { describe, expect, it } from "vitest";
import { normalizeComment } from "@/domain/reporte";
import { DomainError } from "@/domain/erros";

describe("normalizarComentario", () => {
  it("remove espaços nas pontas", () => {
    // Arrange
    const comment = "  preço mudou  ";
    // Act
    const result = normalizeComment(comment);
    // Assert
    expect(result).toBe("preço mudou");
  });

  it("rejeita comentário com mais de 500 caracteres", () => {
    // Arrange
    const comment = "a".repeat(501);
    // Act
    const action = () => normalizeComment(comment);
    // Assert
    expect(action).toThrow(DomainError);
    expect(action).toThrow("Comentário muito longo");
  });
});
