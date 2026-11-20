import { describe, expect, it } from "vitest";
import { economiaPercentual, estaDesatualizado, menorPreco, ordenarPorValor, validarValor, type Preco } from "@/domain/preco";
import { DomainError } from "@/domain/erros";

const preco = (id: number, valor: number, atualizadoEm = new Date("2026-11-20T12:00:00Z")): Preco => ({
  id, medicamentoId: 1, farmacia: { id, nome: `F${id}` }, valor, atualizadoEm,
});

describe("menorPreco", () => {
  it("retorna null quando não há preços", () => {
    // Arrange
    const precos: Preco[] = [];
    // Act
    const resultado = menorPreco(precos);
    // Assert
    expect(resultado).toBeNull();
  });

  it("retorna o preço de menor valor", () => {
    // Arrange
    const precos = [preco(1, 10), preco(2, 7.5), preco(3, 9)];
    // Act
    const resultado = menorPreco(precos);
    // Assert
    expect(resultado?.id).toBe(2);
  });
});

describe("ordenarPorValor", () => {
  it("ordena do mais barato ao mais caro sem alterar a lista original", () => {
    // Arrange
    const precos = [preco(1, 10), preco(2, 7.5)];
    // Act
    const resultado = ordenarPorValor(precos);
    // Assert
    expect(resultado.map((p) => p.id)).toEqual([2, 1]);
    expect(precos.map((p) => p.id)).toEqual([1, 2]);
  });
});

describe("estaDesatualizado", () => {
  const hoje = new Date("2026-11-20T12:00:00Z");

  it("considera desatualizado um preço de 8 dias", () => {
    // Arrange
    const p = preco(1, 10, new Date("2026-11-12T12:00:00Z"));
    // Act
    const resultado = estaDesatualizado(p, hoje);
    // Assert
    expect(resultado).toBe(true);
  });

  it("considera atualizado um preço de exatamente 7 dias", () => {
    // Arrange
    const p = preco(1, 10, new Date("2026-11-13T12:00:00Z"));
    // Act
    const resultado = estaDesatualizado(p, hoje);
    // Assert
    expect(resultado).toBe(false);
  });
});

describe("validarValor", () => {
  it("rejeita preço zero", () => {
    // Arrange
    const valor = 0;
    // Act
    const acao = () => validarValor(valor);
    // Assert
    expect(acao).toThrow(DomainError);
    expect(acao).toThrow("O preço deve ser maior que zero");
  });

  it("rejeita valor que não é número finito", () => {
    // Arrange
    const valor = Number.NaN;
    // Act
    const acao = () => validarValor(valor);
    // Assert
    expect(acao).toThrow(DomainError);
  });
});

describe("economiaPercentual", () => {
  it("calcula 40% para R$ 6 contra referência de R$ 10", () => {
    // Arrange
    const [valor, referencia] = [6, 10];
    // Act
    const resultado = economiaPercentual(valor, referencia);
    // Assert
    expect(resultado).toBe(40);
  });

  it("retorna null quando a referência não é mais cara", () => {
    // Arrange
    const [valor, referencia] = [10, 10];
    // Act
    const resultado = economiaPercentual(valor, referencia);
    // Assert
    expect(resultado).toBeNull();
  });

  it("retorna null quando falta um dos valores", () => {
    // Arrange
    const [valor, referencia] = [null, 10];
    // Act
    const resultado = economiaPercentual(valor, referencia);
    // Assert
    expect(resultado).toBeNull();
  });
});
