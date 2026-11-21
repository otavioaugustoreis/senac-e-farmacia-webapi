import { describe, expect, it } from "vitest";
import { alternativasDe, validarMedicamento, type Medicamento } from "@/domain/medicamento";
import { DomainError } from "@/domain/erros";

const med = (id: number, principioAtivo: string, tipo: Medicamento["tipo"] = "generico"): Medicamento => ({
  id, nomeComercial: `M${id}`, principioAtivo, categoria: null, tipo, fabricante: "X", apresentacao: "10 comprimidos", imagem: null,
});

describe("alternativasDe", () => {
  it("retorna os de mesmo princípio ativo ignorando acento e maiúsculas, excluindo o próprio", () => {
    // Arrange
    const alvo = med(1, "Dipirona Sódica", "referencia");
    const candidatos = [alvo, med(2, "dipirona sodica"), med(3, "Paracetamol")];
    // Act
    const resultado = alternativasDe(alvo, candidatos);
    // Assert
    expect(resultado.map((m) => m.id)).toEqual([2]);
  });
});

describe("validarMedicamento", () => {
  it("exige nome comercial", () => {
    // Arrange
    const input = { nomeComercial: "  ", principioAtivo: "Dipirona", tipo: "generico" as const };
    // Act
    const acao = () => validarMedicamento(input);
    // Assert
    expect(acao).toThrow(DomainError);
    expect(acao).toThrow("Informe o nome comercial");
  });

  it("exige princípio ativo", () => {
    // Arrange
    const input = { nomeComercial: "Novalgina", principioAtivo: "", tipo: "referencia" as const };
    // Act
    const acao = () => validarMedicamento(input);
    // Assert
    expect(acao).toThrow("Informe o princípio ativo");
  });

  it("rejeita foto com endereço que não é https", () => {
    // Arrange
    const input = { nomeComercial: "Novalgina", principioAtivo: "Dipirona", tipo: "referencia" as const, imagemUrl: "http://site.com/foto.jpg" };
    // Act
    const acao = () => validarMedicamento(input);
    // Assert
    expect(acao).toThrow("A foto precisa de um endereço https");
  });

  it("aceita medicamento sem foto", () => {
    // Arrange
    const input = { nomeComercial: "Novalgina", principioAtivo: "Dipirona", tipo: "referencia" as const, imagemUrl: "" };
    // Act
    const acao = () => validarMedicamento(input);
    // Assert
    expect(acao).not.toThrow();
  });

  it("rejeita tipo desconhecido", () => {
    // Arrange
    const input = { nomeComercial: "Novalgina", principioAtivo: "Dipirona", tipo: "importado" as never };
    // Act
    const acao = () => validarMedicamento(input);
    // Assert
    expect(acao).toThrow("Tipo de medicamento inválido");
  });
});
