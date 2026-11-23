import { describe, expect, it } from "vitest";
import { normalizeComment } from "@/domain/report";
import { DomainError } from "@/domain/errors";

describe("normalizeComment", () => {
  it("trims surrounding spaces", () => {
    // Arrange
    const comment = "  preço mudou  ";
    // Act
    const result = normalizeComment(comment);
    // Assert
    expect(result).toBe("preço mudou");
  });

  it("rejects a comment longer than 500 characters", () => {
    // Arrange
    const comment = "a".repeat(501);
    // Act
    const action = () => normalizeComment(comment);
    // Assert
    expect(action).toThrow(DomainError);
    expect(action).toThrow("Comentário muito longo");
  });
});
