import { describe, expect, it } from "vitest";
import { buildDashboard } from "@/application/use-cases/build-dashboard";
import { ForbiddenError } from "@/domain/errors";
import { admin, createFakes, coupon, emptyData, pharmacy, med, price, regularUser } from "./fakes";

const today = new Date("2026-11-20T15:00:00Z");
const daysAgo = (n: number) => new Date(today.getTime() - n * 24 * 60 * 60 * 1000);

function scenario() {
  const d = emptyData();
  d.medicines = [
    { ...med(1, "Novalgina", "Dipirona", "referencia"), image: { url: "https://x/a.jpg", credit: "c", source: "f" } },
    med(2, "Dipirona EMS", "Dipirona", "generico"),
    med(3, "Sem Preço", "Loratadina", "similar"),
  ];
  d.pharmacies = [pharmacy(1), pharmacy(2, false)];
  d.prices = [
    price(10, 1, 1, 10, daysAgo(1)),
    price(11, 1, 2, 12, daysAgo(4)),
    price(12, 2, 1, 6, daysAgo(7)),
    price(13, 2, 2, 7, daysAgo(10)),
  ];
  d.coupons = [coupon(1, 1, "2026-12-31T12:00:00Z"), coupon(2, 1, "2026-11-01T12:00:00Z")];
  d.reports = [
    { id: 5, priceId: 10, userId: "u1", comment: "caro", medicine: "Novalgina", pharmacy: "F1", amount: 10, createdAt: daysAgo(1), resolved: false },
    { id: 6, priceId: 11, userId: "u1", comment: "", medicine: "Novalgina", pharmacy: "F2", amount: 12, createdAt: daysAgo(2), resolved: true },
  ];
  return d;
}

describe("buildDashboard", () => {
  it("is restricted to the administrator", async () => {
    // Arrange
    const dashboard = buildDashboard(createFakes(scenario()));
    // Act
    const action = dashboard(regularUser, today);
    // Assert
    await expect(action).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("computes totals for catalog, prices, pharmacies, coupons and reports", async () => {
    // Arrange
    const dashboard = buildDashboard(createFakes(scenario()));
    // Act
    const p = await dashboard(admin, today);
    // Assert
    expect(p.totals).toMatchObject({
      medicines: 3, withPhoto: 1, withoutPrice: 1, prices: 4, outdatedPrices: 1, freshPricesPct: 75,
      pharmacies: 2, partners: 1, activeCoupons: 1, expiredCoupons: 1, openReports: 1,
    });
  });

  it("groups prices by age and flags the outdated bucket", async () => {
    // Arrange
    const dashboard = buildDashboard(createFakes(scenario()));
    // Act
    const p = await dashboard(admin, today);
    // Assert
    expect(p.priceAge.map((f) => f.count)).toEqual([1, 1, 1, 1]);
    expect(p.priceAge[3]).toMatchObject({ bucket: "Mais de 7 dias", warning: true });
  });

  it("measures each pharmacy's coverage of the catalog", async () => {
    // Arrange
    const dashboard = buildDashboard(createFakes(scenario()));
    // Act
    const p = await dashboard(admin, today);
    // Assert
    expect(p.pharmacyCoverage[0]).toMatchObject({ count: 2, pct: 67 });
  });

  it("lists what needs attention: no price, old prices and open reports", async () => {
    // Arrange
    const dashboard = buildDashboard(createFakes(scenario()));
    // Act
    const p = await dashboard(admin, today);
    // Assert
    expect(p.withoutPrice.map((m) => m.id)).toEqual([3]);
    expect(p.oldest[0]).toMatchObject({ priceId: 13, days: 10 });
    expect(p.openReports.map((r) => r.id)).toEqual([5]);
  });
});
