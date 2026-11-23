import { describe, expect, it } from "vitest";
import { alternativesOf, validateMedicine, type Medicine } from "@/domain/medicamento";
import { DomainError } from "@/domain/erros";

const med = (id: number, activeIngredient: string, type: Medicine["type"] = "generico"): Medicine => ({
  id, brandName: `M${id}`, activeIngredient, category: null, type, manufacturer: "X", presentation: "10 comprimidos", image: null,
});

describe("alternativasDe", () => {
  it("retorna os de mesmo princípio ativo ignorando acento e maiúsculas, excluindo o próprio", () => {
    // Arrange
    const target = med(1, "Dipirona Sódica", "referencia");
    const candidates = [target, med(2, "dipirona sodica"), med(3, "Paracetamol")];
    // Act
    const result = alternativesOf(target, candidates);
    // Assert
    expect(result.map((m) => m.id)).toEqual([2]);
  });
});

describe("validarMedicamento", () => {
  it("exige nome comercial", () => {
    // Arrange
    const input = { brandName: "  ", activeIngredient: "Dipirona", type: "generico" as const };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow(DomainError);
    expect(action).toThrow("Informe o nome comercial");
  });

  it("exige princípio ativo", () => {
    // Arrange
    const input = { brandName: "Novalgina", activeIngredient: "", type: "referencia" as const };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow("Informe o princípio ativo");
  });

  it("rejeita foto com endereço que não é https", () => {
    // Arrange
    const input = { brandName: "Novalgina", activeIngredient: "Dipirona", type: "referencia" as const, imageUrl: "http://site.com/foto.jpg" };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow("A foto precisa de um endereço https");
  });

  it("aceita imagem servida pelo próprio site", () => {
    // Arrange
    const input = { brandName: "Tylenol", activeIngredient: "Paracetamol", type: "referencia" as const, imageUrl: "/medicamentos/25-tylenol.svg" };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).not.toThrow();
  });

  it("rejeita caminho que aponta para outro site (//)", () => {
    // Arrange
    const input = { brandName: "Tylenol", activeIngredient: "Paracetamol", type: "referencia" as const, imageUrl: "//outro.site/x.svg" };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow(DomainError);
  });

  it("aceita medicamento sem foto", () => {
    // Arrange
    const input = { brandName: "Novalgina", activeIngredient: "Dipirona", type: "referencia" as const, imageUrl: "" };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).not.toThrow();
  });

  it("rejeita tipo desconhecido", () => {
    // Arrange
    const input = { brandName: "Novalgina", activeIngredient: "Dipirona", type: "importado" as never };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow("Tipo de medicamento inválido");
  });
});
