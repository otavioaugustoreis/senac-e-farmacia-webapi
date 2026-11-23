import { describe, expect, it } from "vitest";
import { searchMedicines } from "@/application/casos-de-uso/buscar-medicamentos";
import { getMedicineDetail } from "@/application/casos-de-uso/detalhar-medicamento";
import { nearbyPharmacies } from "@/application/casos-de-uso/farmacias-proximas";
import { listActiveCoupons } from "@/application/casos-de-uso/listar-cupons-vigentes";
import { buildShowcase } from "@/application/casos-de-uso/montar-vitrine";
import { reportPrice } from "@/application/casos-de-uso/reportar-preco";
import { DEFAULT_HOW_TO_USE } from "@/domain/bula";
import { UnauthenticatedError, NotFoundError } from "@/domain/erros";
import { DEFAULT_POINT } from "@/domain/farmacia";
import { createFakes, coupon, emptyData, pharmacy, med, price, regularUser, type DashboardData } from "./fakes";

const today = new Date("2026-11-20T15:00:00Z");

function scenario(): DashboardData {
  const d = emptyData();
  d.medicines = [
    med(1, "Novalgina", "Dipirona Sódica", "referencia"),
    med(2, "Dipirona Sódica EMS", "dipirona sodica", "generico"),
    med(3, "Tylenol", "Paracetamol", "referencia"),
    med(4, "Sem Preço", "Loratadina", "similar"),
  ];
  d.pharmacies = [pharmacy(1), pharmacy(2, false)];
  d.prices = [
    price(10, 1, 1, 10),
    price(11, 1, 2, 12, new Date("2026-11-10T12:00:00Z")),
    price(12, 2, 1, 6),
    price(13, 3, 1, 20),
  ];
  d.coupons = [coupon(1, 1, "2026-12-31T12:00:00Z"), coupon(2, 1, "2026-11-01T12:00:00Z"), coupon(3, 2, "2026-12-31T12:00:00Z")];
  return d;
}

describe("buscarMedicamentos", () => {
  it("lista todos quando a busca tem só espaços", async () => {
    // Arrange
    const search = searchMedicines(createFakes(scenario()));
    // Act
    const result = await search("   ");
    // Assert
    expect(result).toHaveLength(4);
  });

  it("encontra pelo princípio ativo sem acento", async () => {
    // Arrange
    const search = searchMedicines(createFakes(scenario()));
    // Act
    const result = await search("DIPIRONA SODICA");
    // Assert
    expect(result.map((m) => m.id).sort()).toEqual([1, 2]);
  });
});

describe("detalharMedicamento", () => {
  it("lança NaoEncontradoError para id inexistente", async () => {
    // Arrange
    const getDetail = getMedicineDetail(createFakes(scenario()));
    // Act
    const action = getDetail(999, today);
    // Assert
    await expect(action).rejects.toBeInstanceOf(NotFoundError);
  });

  it("devolve lista vazia e menorPreco null para medicamento sem preço", async () => {
    // Arrange
    const getDetail = getMedicineDetail(createFakes(scenario()));
    // Act
    const result = await getDetail(4, today);
    // Assert
    expect(result.prices).toEqual([]);
    expect(result.lowestPrice).toBeNull();
    expect(result.howToUse).toBe(DEFAULT_HOW_TO_USE);
  });

  it("ordena preços, marca desatualizados e traz alternativas e cupons vigentes", async () => {
    // Arrange
    const getDetail = getMedicineDetail(createFakes(scenario()));
    // Act
    const result = await getDetail(1, today);
    // Assert
    expect(result.prices.map((p) => p.id)).toEqual([10, 11]);
    expect(result.prices.map((p) => p.outdated)).toEqual([false, true]);
    expect(result.lowestPrice?.amount).toBe(10);
    expect(result.alternatives.map((m) => m.id)).toEqual([2]);
    expect(result.coupons.map((c) => c.id).sort()).toEqual([1, 3]);
  });
});

describe("farmaciasProximas", () => {
  it("usa o ponto padrão quando as coordenadas são inválidas", async () => {
    // Arrange
    const nearby = nearbyPharmacies(createFakes(scenario()));
    // Act
    const result = await nearby("x", undefined);
    // Assert
    expect(result.origin).toEqual({ ...DEFAULT_POINT, isDefault: true });
    expect(result.pharmacies.length).toBeGreaterThan(0);
  });

  it("amplia o raio e avisa quando não há farmácias perto da posição real (ex.: Campinas)", async () => {
    // Arrange
    const nearby = nearbyPharmacies(createFakes(scenario()));
    const campinas = { lat: -22.9056, lng: -47.0608 };
    // Act
    const result = await nearby(campinas.lat, campinas.lng);
    // Assert
    expect(result.origin).toEqual({ ...campinas, isDefault: false });
    expect(result.expanded).toBe(true);
    expect(result.radiusKm).toBeGreaterThan(15);
    expect(result.pharmacies.length).toBeGreaterThan(0);
  });

  it("não amplia o raio quando há farmácias perto", async () => {
    // Arrange
    const nearby = nearbyPharmacies(createFakes(scenario()));
    // Act
    const result = await nearby(-23.56, -46.65);
    // Assert
    expect(result.expanded).toBe(false);
    expect(result.radiusKm).toBe(15);
  });

  it("usa a posição informada quando é válida", async () => {
    // Arrange
    const nearby = nearbyPharmacies(createFakes(scenario()));
    // Act
    const result = await nearby(-23.5, -46.6);
    // Assert
    expect(result.origin).toEqual({ lat: -23.5, lng: -46.6, isDefault: false });
  });
});

describe("listarCuponsVigentes", () => {
  it("não inclui cupons vencidos", async () => {
    // Arrange
    const list = listActiveCoupons(createFakes(scenario()));
    // Act
    const result = await list(today);
    // Assert
    expect(result.map((c) => c.id).sort()).toEqual([1, 3]);
  });
});

describe("montarVitrine", () => {
  it("calcula a economia do genérico contra a referência e ignora itens sem preço", async () => {
    // Arrange
    const showcase = buildShowcase(createFakes(scenario()));
    // Act
    const result = await showcase(today);
    // Assert
    expect(result.lowestPrices.map((m) => m.id)).toEqual([2]);
    expect(result.lowestPrices[0].referencePrice).toBe(10);
    expect(result.lowestPrices[0].savingsPercent).toBe(40);
  });

  it("resume números, parceiras e até dois cupons vigentes", async () => {
    // Arrange
    const showcase = buildShowcase(createFakes(scenario()));
    // Act
    const result = await showcase(today);
    // Assert
    expect(result.stats).toEqual({ medicines: 4, pharmacies: 2, averageSavingsPercent: 40 });
    expect(result.partnerPharmacies.map((f) => f.id)).toEqual([1]);
    expect(result.coupons.length).toBeLessThanOrEqual(2);
    expect(result.coupons.every((c) => c.id !== 2)).toBe(true);
  });
});

describe("reportarPreco", () => {
  it("exige usuário logado", async () => {
    // Arrange
    const report = reportPrice(createFakes(scenario()));
    // Act
    const action = report(null, 10, "mudou");
    // Assert
    await expect(action).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("grava o reporte com o comentário normalizado", async () => {
    // Arrange
    const payload = scenario();
    const report = reportPrice(createFakes(payload));
    // Act
    await report(regularUser, 10, "  preço mudou  ");
    // Assert
    expect(payload.reports).toHaveLength(1);
    expect(payload.reports[0]).toMatchObject({ priceId: 10, userId: "u1", comment: "preço mudou" });
  });
});
