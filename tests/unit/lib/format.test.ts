import { describe, expect, it } from "vitest";
import { formatBRL, formatDate, formatKm } from "@/lib/format";

describe("formatBRL", () => {
  it("formats an amount in reais with a comma and a regular space", () => {
    // Arrange
    const amount = 12.9;
    // Act
    const result = formatBRL(amount);
    // Assert
    expect(result).toBe("R$ 12,90");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as dd/mm/yyyy in the São Paulo time zone", () => {
    // Arrange
    const iso = "2026-11-20T10:00:00Z";
    // Act
    const result = formatDate(iso);
    // Assert
    expect(result).toBe("20/11/2026");
  });
});

describe("formatKm", () => {
  it("formats distance with one decimal place", () => {
    // Arrange
    const km = 1.234;
    // Act
    const result = formatKm(km);
    // Assert
    expect(result).toBe("1,2 km");
  });
});
