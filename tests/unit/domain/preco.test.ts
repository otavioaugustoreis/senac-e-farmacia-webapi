import { describe, expect, it } from "vitest";
import { savingsPercent, isOutdated, lowestPrice, sortByValue, validateAmount, type Price } from "@/domain/preco";
import { DomainError } from "@/domain/erros";

const price = (id: number, amount: number, updatedAt = new Date("2026-11-20T12:00:00Z")): Price => ({
  id, medicineId: 1, pharmacy: { id, name: `F${id}` }, amount, updatedAt,
});

describe("menorPreco", () => {
  it("retorna null quando não há preços", () => {
    // Arrange
    const prices: Price[] = [];
    // Act
    const result = lowestPrice(prices);
    // Assert
    expect(result).toBeNull();
  });

  it("retorna o preço de menor valor", () => {
    // Arrange
    const prices = [price(1, 10), price(2, 7.5), price(3, 9)];
    // Act
    const result = lowestPrice(prices);
    // Assert
    expect(result?.id).toBe(2);
  });
});

describe("ordenarPorValor", () => {
  it("ordena do mais barato ao mais caro sem alterar a lista original", () => {
    // Arrange
    const prices = [price(1, 10), price(2, 7.5)];
    // Act
    const result = sortByValue(prices);
    // Assert
    expect(result.map((p) => p.id)).toEqual([2, 1]);
    expect(prices.map((p) => p.id)).toEqual([1, 2]);
  });
});

describe("estaDesatualizado", () => {
  const today = new Date("2026-11-20T12:00:00Z");

  it("considera desatualizado um preço de 8 dias", () => {
    // Arrange
    const p = price(1, 10, new Date("2026-11-12T12:00:00Z"));
    // Act
    const result = isOutdated(p, today);
    // Assert
    expect(result).toBe(true);
  });

  it("considera atualizado um preço de exatamente 7 dias", () => {
    // Arrange
    const p = price(1, 10, new Date("2026-11-13T12:00:00Z"));
    // Act
    const result = isOutdated(p, today);
    // Assert
    expect(result).toBe(false);
  });
});

describe("validarValor", () => {
  it("rejeita preço zero", () => {
    // Arrange
    const amount = 0;
    // Act
    const action = () => validateAmount(amount);
    // Assert
    expect(action).toThrow(DomainError);
    expect(action).toThrow("O preço deve ser maior que zero");
  });

  it("rejeita valor que não é número finito", () => {
    // Arrange
    const amount = Number.NaN;
    // Act
    const action = () => validateAmount(amount);
    // Assert
    expect(action).toThrow(DomainError);
  });
});

describe("economiaPercentual", () => {
  it("calcula 40% para R$ 6 contra referência de R$ 10", () => {
    // Arrange
    const [amount, reference] = [6, 10];
    // Act
    const result = savingsPercent(amount, reference);
    // Assert
    expect(result).toBe(40);
  });

  it("retorna null quando a referência não é mais cara", () => {
    // Arrange
    const [amount, reference] = [10, 10];
    // Act
    const result = savingsPercent(amount, reference);
    // Assert
    expect(result).toBeNull();
  });

  it("retorna null quando falta um dos valores", () => {
    // Arrange
    const [amount, reference] = [null, 10];
    // Act
    const result = savingsPercent(amount, reference);
    // Assert
    expect(result).toBeNull();
  });
});
