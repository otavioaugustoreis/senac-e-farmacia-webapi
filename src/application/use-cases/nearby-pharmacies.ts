import { validCoordinates, DEFAULT_POINT, type NearbyPharmacy } from "@/domain/pharmacy";
import type { Repositories } from "../ports";

export const SEARCH_RADIUS_KM = 15;
export const EXPANDED_RADIUS_KM = 300;

export interface NearbyResult {
  origin: { lat: number; lng: number; isDefault: boolean };
  pharmacies: NearbyPharmacy[];
  radiusKm: number;
  expanded: boolean;
}

export const nearbyPharmacies = (repos: Pick<Repositories, "pharmacies">) =>
  async (lat: unknown, lng: unknown): Promise<NearbyResult> => {
    const isValid = validCoordinates(lat, lng);
    const origin = isValid
      ? { lat: lat as number, lng: lng as number, isDefault: false }
      : { ...DEFAULT_POINT, isDefault: true };

    const near = await repos.pharmacies.nearby(origin.lat, origin.lng, SEARCH_RADIUS_KM);
    if (near.length > 0) return { origin, pharmacies: near, radiusKm: SEARCH_RADIUS_KM, expanded: false };

    const far = await repos.pharmacies.nearby(origin.lat, origin.lng, EXPANDED_RADIUS_KM);
    return { origin, pharmacies: far, radiusKm: EXPANDED_RADIUS_KM, expanded: true };
  };
