import { describe, expect, it } from "vitest";
import { cupomVigente, type Cupom } from "@/domain/cupom";

const cupom = (validade: string): Cupom => ({
  id: 1, farmacia: { id: 1, nome: "F" }, codigo: "X10", descricao: "", desconto: "10%", validade: new Date(validade),
});
const hoje = new Date("2026-11-20T15:00:00-03:00");

describe("cupomVigente", () => {
  it("não considera vigente cupom que venceu ontem", () => {
    // Arrange
    const c = cupom("2026-11-19T00:00:00-03:00");
    // Act
    const resultado = cupomVigente(c, hoje);
    // Assert
    expect(resultado).toBe(false);
  });

  it("considera vigente cupom que vence hoje", () => {
    // Arrange
    const c = cupom("2026-11-20T00:00:00-03:00");
    // Act
    const resultado = cupomVigente(c, hoje);
    // Assert
    expect(resultado).toBe(true);
  });
});
