import { describe, expect, it } from "vitest";
import { alternativesOf, validateMedicine, type Medicine } from "@/domain/medicine";
import { DomainError } from "@/domain/errors";

const med = (id: number, activeIngredient: string, type: Medicine["type"] = "generico"): Medicine => ({
  id, brandName: `M${id}`, activeIngredient, category: null, type, manufacturer: "X", presentation: "10 comprimidos", image: null,
});

describe("alternativesOf", () => {
  it("returns those with the same active ingredient ignoring accents and case, excluding itself", () => {
    // Arrange
    const target = med(1, "Dipirona Sódica", "referencia");
    const candidates = [target, med(2, "dipirona sodica"), med(3, "Paracetamol")];
    // Act
    const result = alternativesOf(target, candidates);
    // Assert
    expect(result.map((m) => m.id)).toEqual([2]);
  });
});

describe("validateMedicine", () => {
  it("requires a brand name", () => {
    // Arrange
    const input = { brandName: "  ", activeIngredient: "Dipirona", type: "generico" as const };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow(DomainError);
    expect(action).toThrow("Informe o nome comercial");
  });

  it("requires an active ingredient", () => {
    // Arrange
    const input = { brandName: "Novalgina", activeIngredient: "", type: "referencia" as const };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow("Informe o princípio ativo");
  });

  it("rejects a photo whose address is not https", () => {
    // Arrange
    const input = { brandName: "Novalgina", activeIngredient: "Dipirona", type: "referencia" as const, imageUrl: "http://site.com/foto.jpg" };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow("A foto precisa de um endereço https");
  });

  it("accepts an image served by the site itself", () => {
    // Arrange
    const input = { brandName: "Tylenol", activeIngredient: "Paracetamol", type: "referencia" as const, imageUrl: "/medicamentos/25-tylenol.svg" };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).not.toThrow();
  });

  it("rejects a path pointing to another site (//)", () => {
    // Arrange
    const input = { brandName: "Tylenol", activeIngredient: "Paracetamol", type: "referencia" as const, imageUrl: "//outro.site/x.svg" };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow(DomainError);
  });

  it("accepts a medicine without a photo", () => {
    // Arrange
    const input = { brandName: "Novalgina", activeIngredient: "Dipirona", type: "referencia" as const, imageUrl: "" };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).not.toThrow();
  });

  it("rejects an unknown type", () => {
    // Arrange
    const input = { brandName: "Novalgina", activeIngredient: "Dipirona", type: "importado" as never };
    // Act
    const action = () => validateMedicine(input);
    // Assert
    expect(action).toThrow("Tipo de medicamento inválido");
  });
});
