import { describe, expect, it } from "vitest";
import { dateFromDay, dayInSaoPaulo, isCouponActive, type Coupon } from "@/domain/coupon";

const coupon = (validUntil: string): Coupon => ({
  id: 1, pharmacy: { id: 1, name: "F", address: "Rua A, 1" }, code: "X10", description: "", discount: "10%", validUntil: new Date(validUntil),
});
const today = new Date("2026-11-20T15:00:00-03:00");

describe("isCouponActive", () => {
  it("does not treat a coupon that expired yesterday as active", () => {
    // Arrange
    const c = coupon("2026-11-19T00:00:00-03:00");
    // Act
    const result = isCouponActive(c, today);
    // Assert
    expect(result).toBe(false);
  });

  it("treats a coupon expiring today as active", () => {
    // Arrange
    const c = coupon("2026-11-20T00:00:00-03:00");
    // Act
    const result = isCouponActive(c, today);
    // Assert
    expect(result).toBe(true);
  });
});

describe("dateFromDay", () => {
  it("keeps the same calendar day in São Paulo", () => {
    // Arrange
    const day = "2026-11-20";
    // Act
    const date = dateFromDay(day);
    // Assert
    expect(dayInSaoPaulo(date)).toBe(day);
  });
});
