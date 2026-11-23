import { validCoordinates } from "@/domain/pharmacy";

export interface SavedLocation {
  lat: number;
  lng: number;
  city: string | null;
  ts: number;
}

export const LOCATION_TTL_MS = 30 * 60 * 1000;

export function cityFromAddress(address: Record<string, unknown> | null | undefined): string | null {
  if (!address) return null;
  for (const key of ["city", "town", "village", "municipality", "city_district", "county"]) {
    const value = address[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function isSavedLocationValid(saved: unknown, now: number): saved is SavedLocation {
  if (!saved || typeof saved !== "object") return false;
  const s = saved as Partial<SavedLocation>;
  return validCoordinates(s.lat, s.lng) && typeof s.ts === "number" && now - s.ts <= LOCATION_TTL_MS;
}
