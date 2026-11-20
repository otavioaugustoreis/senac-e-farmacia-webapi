import { DomainError } from "./erros";

export interface Farmacia {
  id: number;
  nome: string;
  endereco: string;
  telefone: string | null;
  parceira: boolean;
  lat: number;
  lng: number;
}

export interface FarmaciaProxima extends Farmacia {
  distanciaKm: number;
}

/** Av. Paulista — usado quando a localização do usuário não está disponível. */
export const PONTO_PADRAO = { lat: -23.5614, lng: -46.6559 } as const;

export function coordenadasValidas(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" && typeof lng === "number" &&
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  );
}

export function validarFarmacia(input: { nome: string; endereco: string; lat: number; lng: number }): void {
  if (!input.nome?.trim()) throw new DomainError("Informe o nome da farmácia");
  if (!input.endereco?.trim()) throw new DomainError("Informe o endereço");
  if (!coordenadasValidas(input.lat, input.lng)) throw new DomainError("Coordenadas inválidas");
}
