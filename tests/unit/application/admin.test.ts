import { describe, expect, it } from "vitest";
import { createAdminUseCases, requireAdmin } from "@/application/use-cases/admin";
import { DomainError, UnauthenticatedError, ForbiddenError } from "@/domain/errors";
import { admin, createFakes, emptyData, pharmacy, med, regularUser } from "./fakes";

function scenario() {
  const d = emptyData();
  d.medicines = [med(1, "Novalgina", "Dipirona Sódica", "referencia")];
  d.pharmacies = [pharmacy(1)];
  return d;
}

describe("requireAdmin", () => {
  it("throws UnauthenticatedError without a user", () => {
    // Arrange
    const user = null;
    // Act
    const action = () => requireAdmin(user);
    // Assert
    expect(action).toThrow(UnauthenticatedError);
  });

  it("throws ForbiddenError for a regular user", () => {
    // Arrange
    const user = regularUser;
    // Act
    const action = () => requireAdmin(user);
    // Assert
    expect(action).toThrow(ForbiddenError);
  });
});

describe("savePrice", () => {
  it("rejects a regular user", async () => {
    // Arrange
    const useCases = createAdminUseCases(createFakes(scenario()));
    // Act
    const action = useCases.savePrice(regularUser, { medicineId: 1, pharmacyId: 1, amount: 9 });
    // Assert
    await expect(action).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects a zero amount", async () => {
    // Arrange
    const useCases = createAdminUseCases(createFakes(scenario()));
    // Act
    const action = useCases.savePrice(admin, { medicineId: 1, pharmacyId: 1, amount: 0 });
    // Assert
    await expect(action).rejects.toBeInstanceOf(DomainError);
  });

  it("saves a valid admin price", async () => {
    // Arrange
    const payload = scenario();
    const useCases = createAdminUseCases(createFakes(payload));
    // Act
    await useCases.savePrice(admin, { medicineId: 1, pharmacyId: 1, amount: 9.9 });
    // Assert
    expect(payload.prices).toHaveLength(1);
    expect(payload.prices[0].amount).toBe(9.9);
  });
});

describe("saveMedicine", () => {
  it("saves the medicine and its package insert together", async () => {
    // Arrange
    const payload = scenario();
    const useCases = createAdminUseCases(createFakes(payload));
    const packageInsert = { usedFor: "Dor", contraindications: "", sideEffects: "", warnings: "", anvisaLink: "" };
    // Act
    const id = await useCases.saveMedicine(admin, {
      brandName: "Dorflex", activeIngredient: "Dipirona + Orfenadrina", categoryId: 1, type: "referencia", manufacturer: "Sanofi", presentation: "10 comprimidos", packageInsert,
    });
    // Assert
    expect(payload.medicines.some((m) => m.id === id && m.brandName === "Dorflex")).toBe(true);
    expect(payload.packageInserts.find((b) => b.medicineId === id)?.usedFor).toBe("Dor");
  });

  it("rejects a medicine without a name", async () => {
    // Arrange
    const useCases = createAdminUseCases(createFakes(scenario()));
    // Act
    const action = useCases.saveMedicine(admin, { brandName: "", activeIngredient: "X", categoryId: null, type: "generico", manufacturer: "", presentation: "" });
    // Assert
    await expect(action).rejects.toThrow("Informe o nome comercial");
  });
});

describe("savePharmacy", () => {
  it("rejects invalid coordinates", async () => {
    // Arrange
    const useCases = createAdminUseCases(createFakes(scenario()));
    // Act
    const action = useCases.savePharmacy(admin, { name: "Drogaria", address: "Rua A", phone: null, isPartner: false, lat: 999, lng: 0 });
    // Assert
    await expect(action).rejects.toThrow("Coordenadas inválidas");
  });
});

describe("resolveReport", () => {
  it("marks the report as resolved", async () => {
    // Arrange
    const payload = scenario();
    payload.reports = [{ id: 5, priceId: 1, userId: "u1", comment: "", medicine: "", pharmacy: "", amount: 1, createdAt: new Date(), resolved: false }];
    const useCases = createAdminUseCases(createFakes(payload));
    // Act
    await useCases.resolveReport(admin, 5);
    // Assert
    expect(payload.reports[0].resolved).toBe(true);
  });
});
