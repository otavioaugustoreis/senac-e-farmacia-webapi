import { describe, expect, it } from "vitest";
import { savingsPercent, isOutdated, lowestPrice, sortByValue, validateAmount, type Price } from "@/domain/price";
import { DomainError } from "@/domain/errors";

const price = (id: number, amount: number, updatedAt = new Date("2026-11-20T12:00:00Z")): Price => ({
  id, medicineId: 1, pharmacy: { id, name: `F${id}` }, amount, updatedAt,
});

describe("lowestPrice", () => {
  it("returns null when there are no prices", () => {
    // Arrange
    const prices: Price[] = [];
    // Act
    const result = lowestPrice(prices);
    // Assert
    expect(result).toBeNull();
  });

  it("returns the lowest price", () => {
    // Arrange
    const prices = [price(1, 10), price(2, 7.5), price(3, 9)];
    // Act
    const result = lowestPrice(prices);
    // Assert
    expect(result?.id).toBe(2);
  });
});

describe("sortByValue", () => {
  it("sorts from cheapest to most expensive without changing the original list", () => {
    // Arrange
    const prices = [price(1, 10), price(2, 7.5)];
    // Act
    const result = sortByValue(prices);
    // Assert
    expect(result.map((p) => p.id)).toEqual([2, 1]);
    expect(prices.map((p) => p.id)).toEqual([1, 2]);
  });
});

describe("isOutdated", () => {
  const today = new Date("2026-11-20T12:00:00Z");

  it("treats an 8-day-old price as outdated", () => {
    // Arrange
    const p = price(1, 10, new Date("2026-11-12T12:00:00Z"));
    // Act
    const result = isOutdated(p, today);
    // Assert
    expect(result).toBe(true);
  });

  it("treats a price exactly 7 days old as up to date", () => {
    // Arrange
    const p = price(1, 10, new Date("2026-11-13T12:00:00Z"));
    // Act
    const result = isOutdated(p, today);
    // Assert
    expect(result).toBe(false);
  });
});

describe("validateAmount", () => {
  it("rejects a zero price", () => {
    // Arrange
    const amount = 0;
    // Act
    const action = () => validateAmount(amount);
    // Assert
    expect(action).toThrow(DomainError);
    expect(action).toThrow("O preço deve ser maior que zero");
  });

  it("rejects an amount that is not a finite number", () => {
    // Arrange
    const amount = Number.NaN;
    // Act
    const action = () => validateAmount(amount);
    // Assert
    expect(action).toThrow(DomainError);
  });
});

describe("savingsPercent", () => {
  it("returns 40% for R$ 6 against a R$ 10 reference", () => {
    // Arrange
    const [amount, reference] = [6, 10];
    // Act
    const result = savingsPercent(amount, reference);
    // Assert
    expect(result).toBe(40);
  });

  it("returns null when the reference is not more expensive", () => {
    // Arrange
    const [amount, reference] = [10, 10];
    // Act
    const result = savingsPercent(amount, reference);
    // Assert
    expect(result).toBeNull();
  });

  it("returns null when one of the amounts is missing", () => {
    // Arrange
    const [amount, reference] = [null, 10];
    // Act
    const result = savingsPercent(amount, reference);
    // Assert
    expect(result).toBeNull();
  });
});
