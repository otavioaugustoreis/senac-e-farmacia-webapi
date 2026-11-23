import { describe, expect, it } from "vitest";
import { destinationAfterLogin, safeDestination } from "@/lib/destination";

describe("destinationAfterLogin", () => {
  it("sends the admin to the dashboard when there was no destination", () => {
    // Arrange
    const [next, role] = ["/", "admin" as const];
    // Act
    const result = destinationAfterLogin(next, role);
    // Assert
    expect(result).toBe("/admin");
  });

  it("honors the destination requested by the admin", () => {
    // Arrange
    const [next, role] = ["/medicamento/4", "admin" as const];
    // Act
    const result = destinationAfterLogin(next, role);
    // Assert
    expect(result).toBe("/medicamento/4");
  });

  it("keeps a regular user on the home page", () => {
    // Arrange
    const [next, role] = [null, "user" as const];
    // Act
    const result = destinationAfterLogin(next, role);
    // Assert
    expect(result).toBe("/");
  });
});

describe("safeDestination", () => {
  it("keeps an internal path", () => {
    // Arrange
    const next = "/medicamento/1";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/medicamento/1");
  });

  it("replaces an external URL with the home page", () => {
    // Arrange
    const next = "https://golpe.example";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });

  it("replaces a // (protocol-relative) path with the home page", () => {
    // Arrange
    const next = "//golpe.example";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });

  it("replaces a path with a tab the browser turns into // with the home page", () => {
    // Arrange
    const next = "/\t/evil.com";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });

  it("replaces a path with a backslash with the home page", () => {
    // Arrange
    const next = "/\\evil.com";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });

  it("keeps an internal path with parameters", () => {
    // Arrange
    const next = "/busca?q=dipirona";
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/busca?q=dipirona");
  });

  it("replaces a missing value with the home page", () => {
    // Arrange
    const next = null;
    // Act
    const result = safeDestination(next);
    // Assert
    expect(result).toBe("/");
  });
});
