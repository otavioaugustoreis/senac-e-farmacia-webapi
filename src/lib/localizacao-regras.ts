import { coordenadasValidas } from "@/domain/farmacia";

export interface LocalSalvo {
  lat: number;
  lng: number;
  cidade: string | null;
  ts: number;
}

/** A posição salva vale por 30 minutos; depois pedimos de novo ao navegador. */
export const VALIDADE_LOCAL_MS = 30 * 60 * 1000;

/** Nome da cidade a partir do endereço do OpenStreetMap (Nominatim). */
export function cidadeDoEndereco(endereco: Record<string, unknown> | null | undefined): string | null {
  if (!endereco) return null;
  for (const chave of ["city", "town", "village", "municipality", "city_district", "county"]) {
    const valor = endereco[chave];
    if (typeof valor === "string" && valor.trim()) return valor.trim();
  }
  return null;
}

export function localSalvoValido(salvo: unknown, agora: number): salvo is LocalSalvo {
  if (!salvo || typeof salvo !== "object") return false;
  const s = salvo as Partial<LocalSalvo>;
  return coordenadasValidas(s.lat, s.lng) && typeof s.ts === "number" && agora - s.ts <= VALIDADE_LOCAL_MS;
}
