import { describe, expect, it } from "vitest";
import { buildDashboard } from "@/application/casos-de-uso/montar-painel";
import { ForbiddenError } from "@/domain/erros";
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

describe("montarPainel", () => {
  it("é exclusivo do administrador", async () => {
    // Arrange
    const dashboard = buildDashboard(createFakes(scenario()));
    // Act
    const action = dashboard(regularUser, today);
    // Assert
    await expect(action).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("calcula os totais do catálogo, preços, farmácias, cupons e reportes", async () => {
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

  it("agrupa os preços por idade e marca a faixa desatualizada", async () => {
    // Arrange
    const dashboard = buildDashboard(createFakes(scenario()));
    // Act
    const p = await dashboard(admin, today);
    // Assert
    expect(p.priceAge.map((f) => f.count)).toEqual([1, 1, 1, 1]);
    expect(p.priceAge[3]).toMatchObject({ bucket: "Mais de 7 dias", warning: true });
  });

  it("mede a cobertura de cada farmácia sobre o catálogo", async () => {
    // Arrange
    const dashboard = buildDashboard(createFakes(scenario()));
    // Act
    const p = await dashboard(admin, today);
    // Assert
    expect(p.pharmacyCoverage[0]).toMatchObject({ count: 2, pct: 67 });
  });

  it("lista o que precisa de atenção: sem preço, preços antigos e reportes abertos", async () => {
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
