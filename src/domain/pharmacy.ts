import { normalizeText } from "./text";
import { DomainError } from "./errors";

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  isPartner: boolean;
  lat: number;
  lng: number;
}

export interface NearbyPharmacy extends Pharmacy {
  distanceKm: number;
}

export const DEFAULT_POINT = { lat: -23.5614, lng: -46.6559 } as const;

export function validCoordinates(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" && typeof lng === "number" &&
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  );
}

export function validatePharmacy(input: { name: string; address: string; lat: number; lng: number }): void {
  if (!input.name?.trim()) throw new DomainError("Informe o nome da farmácia");
  if (!input.address?.trim()) throw new DomainError("Informe o endereço");
  if (!validCoordinates(input.lat, input.lng)) throw new DomainError("Coordenadas inválidas");
}

export function filterPharmacies<T extends { name: string; address: string }>(pharmacies: T[], query: string): T[] {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return pharmacies;
  return pharmacies.filter((f) => {
    const target = normalizeText(`${f.name} ${f.address}`);
    return words.every((p) => target.includes(p));
  });
}
