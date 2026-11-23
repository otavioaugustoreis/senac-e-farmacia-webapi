import { validCoordinates } from "@/domain/farmacia";

export interface SavedLocation {
  lat: number;
  lng: number;
  city: string | null;
  ts: number;
}

/** A posição salva vale por 30 minutos; depois pedimos de novo ao navegador. */
export const LOCATION_TTL_MS = 30 * 60 * 1000;

/** Nome da cidade a partir do endereço do OpenStreetMap (Nominatim). */
export function cityFromAddress(address: Record<string, unknown> | null | undefined): string | null {
  if (!address) return null;
  for (const keyName of ["city", "town", "village", "municipality", "city_district", "county"]) {
    const amount = address[keyName];
    if (typeof amount === "string" && amount.trim()) return amount.trim();
  }
  return null;
}

export function isSavedLocationValid(saved: unknown, now: number): saved is SavedLocation {
  if (!saved || typeof saved !== "object") return false;
  const s = saved as Partial<SavedLocation>;
  return validCoordinates(s.lat, s.lng) && typeof s.ts === "number" && now - s.ts <= LOCATION_TTL_MS;
}
