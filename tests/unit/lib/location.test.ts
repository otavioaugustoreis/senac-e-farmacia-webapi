import { describe, expect, it } from "vitest";
import { cityFromAddress, isSavedLocationValid, LOCATION_TTL_MS } from "@/lib/location-rules";

describe("cityFromAddress", () => {
  it("uses the city when present", () => {
    // Arrange
    const address = { city: "Campinas", state: "São Paulo" };
    // Act
    const result = cityFromAddress(address);
    // Assert
    expect(result).toBe("Campinas");
  });

  it("uses town or municipality when there is no city", () => {
    // Arrange
    const address = { town: "Valinhos" };
    // Act
    const result = cityFromAddress(address);
    // Assert
    expect(result).toBe("Valinhos");
  });

  it("returns null without city data", () => {
    // Arrange
    const address = { country: "Brasil" };
    // Act
    const result = cityFromAddress(address);
    // Assert
    expect(result).toBeNull();
  });
});

describe("isSavedLocationValid", () => {
  const now = 1_800_000_000_000;

  it("accepts a recent location with valid coordinates", () => {
    // Arrange
    const saved = { lat: -22.9, lng: -47.06, city: "Campinas", ts: now - 60_000 };
    // Act
    const result = isSavedLocationValid(saved, now);
    // Assert
    expect(result).toBe(true);
  });

  it("rejects a location older than its time to live", () => {
    // Arrange
    const saved = { lat: -22.9, lng: -47.06, city: "Campinas", ts: now - LOCATION_TTL_MS - 1 };
    // Act
    const result = isSavedLocationValid(saved, now);
    // Assert
    expect(result).toBe(false);
  });

  it("rejects corrupted data", () => {
    // Arrange
    const saved = { lat: "x", lng: 1, ts: now };
    // Act
    const result = isSavedLocationValid(saved, now);
    // Assert
    expect(result).toBe(false);
  });
});
