import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setContainerForTests } from "@/infrastructure/container";
import type { CurrentUser } from "@/domain/usuario";
import { GET as getMedicamentos } from "@/app/api/medicamentos/route";
import { GET as getMedicamento } from "@/app/api/medicamentos/[id]/route";
import { GET as getCategorias } from "@/app/api/categorias/route";
import { GET as getProximas } from "@/app/api/farmacias/proximas/route";
import { GET as getCupons } from "@/app/api/cupons/route";
import { POST as postReporte } from "@/app/api/reportes/route";
import { GET as getAdmin, POST as postAdmin } from "@/app/api/admin/[entidade]/route";
import { DELETE as deleteAdmin, PATCH as patchAdmin } from "@/app/api/admin/[entidade]/[id]/route";
import { admin, createFakes, coupon, emptyData, pharmacy, med, price, regularUser, type DashboardData } from "../../unit/application/fakes";

let payload: DashboardData;
let user: CurrentUser | null;

function scenario(): DashboardData {
  const d = emptyData();
  d.medicines = [med(1, "Novalgina", "Dipirona Sódica", "referencia"), med(2, "Dipirona EMS", "Dipirona Sódica", "generico")];
  d.pharmacies = [pharmacy(1)];
  d.prices = [price(10, 1, 1, 10), price(11, 2, 1, 6)];
  d.coupons = [coupon(1, 1, "2099-12-31T12:00:00Z")];
  return d;
}

const ctx = <T extends Record<string, string>>(params: T) => ({ params: Promise.resolve(params) });
const req = (url: string, init?: RequestInit) => new Request(`http://localhost${url}`, init);
const jsonRequest = (url: string, method: string, body: unknown) =>
  req(url, { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  payload = scenario();
  user = null;
  setContainerForTests(async () => ({ repos: createFakes(payload), currentUser: async () => user }));
});

afterEach(() => setContainerForTests(null));

describe("GET /api/medicamentos", () => {
  it("devolve 200 com os resultados da busca", async () => {
    // Arrange
    const request = req("/api/medicamentos?q=dipirona");
    // Act
    const response = await getMedicamentos(request);
    // Assert
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(2);
  });
});

describe("GET /api/medicamentos/:id", () => {
  it("devolve 404 com { erro } para id inexistente", async () => {
    // Arrange
    const request = req("/api/medicamentos/999");
    // Act
    const response = await getMedicamento(request, ctx({ id: "999" }));
    // Assert
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ errorMessage: "Medicamento não encontrado" });
  });

  it("devolve 400 para id não numérico", async () => {
    // Arrange
    const request = req("/api/medicamentos/abc");
    // Act
    const response = await getMedicamento(request, ctx({ id: "abc" }));
    // Assert
    expect(response.status).toBe(400);
  });

  it("devolve 200 com o detalhe", async () => {
    // Arrange
    const request = req("/api/medicamentos/1");
    // Act
    const response = await getMedicamento(request, ctx({ id: "1" }));
    // Assert
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.medicine.brandName).toBe("Novalgina");
    expect(body.alternatives).toHaveLength(1);
  });
});

describe("GET /api/categorias e /api/cupons", () => {
  it("devolve categorias e cupons vigentes", async () => {
    // Arrange
    const routes = [getCategorias, getCupons];
    // Act
    const [categories, coupons] = await Promise.all(routes.map((route) => route()));
    // Assert
    expect(categories.status).toBe(200);
    expect(await categories.json()).toHaveLength(1);
    expect(await coupons.json()).toHaveLength(1);
  });
});

describe("GET /api/farmacias/proximas", () => {
  it("usa o ponto padrão com lat inválida", async () => {
    // Arrange
    const request = req("/api/farmacias/proximas?lat=x");
    // Act
    const response = await getProximas(request);
    // Assert
    expect(response.status).toBe(200);
    expect((await response.json()).origin.isDefault).toBe(true);
  });

  it("usa a posição enviada quando válida", async () => {
    // Arrange
    const request = req("/api/farmacias/proximas?lat=-23.5&lng=-46.6");
    // Act
    const response = await getProximas(request);
    // Assert
    expect((await response.json()).origin).toEqual({ lat: -23.5, lng: -46.6, isDefault: false });
  });
});

describe("POST /api/reportes", () => {
  it("devolve 401 sem login", async () => {
    // Arrange
    const request = jsonRequest("/api/reportes", "POST", { priceId: 10, comment: "mudou" });
    // Act
    const response = await postReporte(request);
    // Assert
    expect(response.status).toBe(401);
  });

  it("devolve 201 para usuário logado", async () => {
    // Arrange
    user = regularUser;
    const request = jsonRequest("/api/reportes", "POST", { priceId: 10, comment: "mudou" });
    // Act
    const response = await postReporte(request);
    // Assert
    expect(response.status).toBe(201);
    expect(payload.reports).toHaveLength(1);
  });

  it("devolve 400 para JSON inválido", async () => {
    // Arrange
    user = regularUser;
    const request = req("/api/reportes", { method: "POST", body: "{" });
    // Act
    const response = await postReporte(request);
    // Assert
    expect(response.status).toBe(400);
  });
});

describe("/api/admin", () => {
  it("devolve 401 sem login", async () => {
    // Arrange
    const request = req("/api/admin/precos");
    // Act
    const response = await getAdmin(request, ctx({ entity: "precos" }));
    // Assert
    expect(response.status).toBe(401);
  });

  it("devolve 403 para usuário comum", async () => {
    // Arrange
    user = regularUser;
    const request = jsonRequest("/api/admin/precos", "POST", { medicineId: 1, pharmacyId: 1, amount: 9 });
    // Act
    const response = await postAdmin(request, ctx({ entity: "precos" }));
    // Assert
    expect(response.status).toBe(403);
  });

  it("devolve 401 ao criar cupom sem login (antes de validar o corpo)", async () => {
    // Arrange
    const request = jsonRequest("/api/admin/cupons", "POST", {});
    // Act
    const response = await postAdmin(request, ctx({ entity: "cupons" }));
    // Assert
    expect(response.status).toBe(401);
  });

  it("devolve 403 ao criar cupom como usuário comum", async () => {
    // Arrange
    user = regularUser;
    const request = jsonRequest("/api/admin/cupons", "POST", { pharmacyId: 1, code: "X", discount: "5%", validUntil: "2026-12-31" });
    // Act
    const response = await postAdmin(request, ctx({ entity: "cupons" }));
    // Assert
    expect(response.status).toBe(403);
  });

  it("devolve 403 para operação não suportada por usuário comum", async () => {
    // Arrange
    user = regularUser;
    const request = req("/api/admin/reportes/1", { method: "DELETE" });
    // Act
    const response = await deleteAdmin(request, ctx({ entity: "reportes", id: "1" }));
    // Assert
    expect(response.status).toBe(403);
  });

  it("devolve 400 para preço zero do admin", async () => {
    // Arrange
    user = admin;
    const request = jsonRequest("/api/admin/precos", "POST", { medicineId: 1, pharmacyId: 1, amount: 0 });
    // Act
    const response = await postAdmin(request, ctx({ entity: "precos" }));
    // Assert
    expect(response.status).toBe(400);
    expect((await response.json()).errorMessage).toBe("O preço deve ser maior que zero");
  });

  it("grava preço válido do admin com 200", async () => {
    // Arrange
    user = admin;
    const request = jsonRequest("/api/admin/precos", "POST", { medicineId: "2", pharmacyId: "1", amount: "7,49" });
    // Act
    const response = await postAdmin(request, ctx({ entity: "precos" }));
    // Assert
    expect(response.status).toBe(200);
    expect(payload.prices.some((p) => p.medicineId === 2 && p.amount === 7.49)).toBe(true);
  });

  it("devolve 404 para entidade desconhecida", async () => {
    // Arrange
    user = admin;
    const request = req("/api/admin/usuarios");
    // Act
    const response = await getAdmin(request, ctx({ entity: "usuarios" }));
    // Assert
    expect(response.status).toBe(404);
  });

  it("exclui com 204", async () => {
    // Arrange
    user = admin;
    const request = req("/api/admin/precos/10", { method: "DELETE" });
    // Act
    const response = await deleteAdmin(request, ctx({ entity: "precos", id: "10" }));
    // Assert
    expect(response.status).toBe(204);
    expect(payload.prices.some((p) => p.id === 10)).toBe(false);
  });

  it("resolve reporte com PATCH 204", async () => {
    // Arrange
    user = admin;
    payload.reports = [{ id: 5, priceId: 10, userId: "u1", comment: "", medicine: "", pharmacy: "", amount: 1, createdAt: new Date(), resolved: false }];
    const request = req("/api/admin/reportes/5", { method: "PATCH" });
    // Act
    const response = await patchAdmin(request, ctx({ entity: "reportes", id: "5" }));
    // Assert
    expect(response.status).toBe(204);
    expect(payload.reports[0].resolved).toBe(true);
  });

  it("cria cupom convertendo a validade 'aaaa-mm-dd'", async () => {
    // Arrange
    user = admin;
    const request = jsonRequest("/api/admin/cupons", "POST", { pharmacyId: 1, code: "novo5", description: "", discount: "5%", validUntil: "2026-12-31" });
    // Act
    const response = await postAdmin(request, ctx({ entity: "cupons" }));
    // Assert
    expect(response.status).toBe(200);
    const created = payload.coupons.find((c) => c.code === "NOVO5");
    expect(created?.validUntil.toISOString().slice(0, 10)).toBe("2026-12-31");
  });
});
