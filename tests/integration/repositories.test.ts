import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { createRepositories } from "@/infrastructure/repositories";
import { DEFAULT_POINT } from "@/domain/pharmacy";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const keyName = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Integração real contra o Supabase (somente leitura, como visitante anônimo).
describe.skipIf(!url || !keyName)("Supabase repositories (anonymous read)", () => {
  const repos = () => createRepositories(createClient(url!, keyName!, { auth: { persistSession: false } }));

  it("searches 'DIPIRONA' without accents and returns a numeric lowest price", async () => {
    // Arrange
    const { medicines } = repos();
    // Act
    const result = await medicines.search("DIPIRONA");
    // Assert
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some((m) => typeof m.lowestPrice === "number")).toBe(true);
    expect(result[0].category?.name).toBeTruthy();
  });

  it("finds by active ingredient ('losartana')", async () => {
    // Arrange
    const { medicines } = repos();
    // Act
    const result = await medicines.search("losartana");
    // Assert
    expect(result.some((m) => m.activeIngredient === "Losartana Potássica")).toBe(true);
  });

  it("filters by category", async () => {
    // Arrange
    const { medicines, categories } = repos();
    const [first] = await categories.list();
    // Act
    const result = await medicines.search("", first.id);
    // Assert
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((m) => m.category?.id === first.id)).toBe(true);
  });

  it("returns the team illustration for each medicine, in search and in detail", async () => {
    // Arrange
    const { medicines } = repos();
    // Act
    const [detail, search] = await Promise.all([medicines.getById(4), medicines.search("tylenol")]);
    // Assert
    expect(detail?.image?.url).toBe("/medicamentos/25-tylenol.svg");
    expect(detail?.image?.credit).toBe("Ilustração: equipe E-Farmácia");
    expect(search[0].image?.url).toBe(detail?.image?.url);
  });

  it("every catalog medicine has an image, including dipyrone", async () => {
    // Arrange
    const { medicines } = repos();
    // Act
    const [all, novalgina] = await Promise.all([medicines.search(""), medicines.getById(1)]);
    // Assert
    expect(all.every((m) => m.image?.url.startsWith("/medicamentos/"))).toBe(true);
    expect(novalgina?.image?.url).toBe("/medicamentos/22-novalgina.svg");
  });

  it("returns null for an unknown medicine", async () => {
    // Arrange
    const { medicines } = repos();
    // Act
    const result = await medicines.getById(999999);
    // Assert
    expect(result).toBeNull();
  });

  it("lists alternatives by the exact active ingredient", async () => {
    // Arrange
    const { medicines } = repos();
    // Act
    const result = await medicines.listByActiveIngredient("Ibuprofeno");
    // Assert
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.every((m) => m.activeIngredient === "Ibuprofeno")).toBe(true);
  });

  it("sorts nearby pharmacies by distance", async () => {
    // Arrange
    const { pharmacies } = repos();
    // Act
    const result = await pharmacies.nearby(DEFAULT_POINT.lat, DEFAULT_POINT.lng, 15);
    // Assert
    expect(result.length).toBeGreaterThan(0);
    const distances = result.map((f) => f.distanceKm);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
    expect(typeof result[0].lat).toBe("number");
  });

  it("converts price dates and amounts", async () => {
    // Arrange
    const { prices } = repos();
    // Act
    const result = await prices.listByMedicine(1);
    // Assert
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].updatedAt).toBeInstanceOf(Date);
    expect(typeof result[0].amount).toBe("number");
    expect(result[0].pharmacy.name).toBeTruthy();
  });

  it("reads package inserts and coupons with pharmacy and address", async () => {
    // Arrange
    const { packageInserts, coupons } = repos();
    // Act
    const [packageInsert, list] = await Promise.all([packageInserts.get(1), coupons.list()]);
    // Assert
    expect(packageInsert?.usedFor).toContain("dor");
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].validUntil).toBeInstanceOf(Date);
    expect(list[0].pharmacy.name).toBeTruthy();
    expect(list[0].pharmacy.address).toBeTruthy();
  });

  it("does not let an anonymous visitor save a price", async () => {
    // Arrange
    const { prices } = repos();
    // Act
    const action = prices.save({ medicineId: 1, pharmacyId: 1, amount: 1 });
    // Assert
    await expect(action).rejects.toThrow();
  });
});
