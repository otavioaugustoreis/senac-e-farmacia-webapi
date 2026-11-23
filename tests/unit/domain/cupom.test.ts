import { describe, expect, it } from "vitest";
import { isCouponActive, type Coupon } from "@/domain/cupom";

const coupon = (validUntil: string): Coupon => ({
  id: 1, pharmacy: { id: 1, name: "F", address: "Rua A, 1" }, code: "X10", description: "", discount: "10%", validUntil: new Date(validUntil),
});
const today = new Date("2026-11-20T15:00:00-03:00");

describe("cupomVigente", () => {
  it("não considera vigente cupom que venceu ontem", () => {
    // Arrange
    const c = coupon("2026-11-19T00:00:00-03:00");
    // Act
    const result = isCouponActive(c, today);
    // Assert
    expect(result).toBe(false);
  });

  it("considera vigente cupom que vence hoje", () => {
    // Arrange
    const c = coupon("2026-11-20T00:00:00-03:00");
    // Act
    const result = isCouponActive(c, today);
    // Assert
    expect(result).toBe(true);
  });
});
