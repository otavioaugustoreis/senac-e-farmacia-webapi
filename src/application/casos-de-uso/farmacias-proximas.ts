import { coordenadasValidas, PONTO_PADRAO, type FarmaciaProxima } from "@/domain/farmacia";
import type { Repositorios } from "../ports";

export const RAIO_BUSCA_KM = 15;
/** Sem nada por perto (ex.: usuário em outra cidade), procura as mais próximas num raio maior. */
export const RAIO_AMPLIADO_KM = 300;

export interface ResultadoProximas {
  origem: { lat: number; lng: number; padrao: boolean };
  farmacias: FarmaciaProxima[];
  raioKm: number;
  ampliado: boolean;
}

export const farmaciasProximas = (repos: Pick<Repositorios, "farmacias">) =>
  async (lat: unknown, lng: unknown): Promise<ResultadoProximas> => {
    const valida = coordenadasValidas(lat, lng);
    const origem = valida
      ? { lat: lat as number, lng: lng as number, padrao: false }
      : { ...PONTO_PADRAO, padrao: true };

    const perto = await repos.farmacias.proximas(origem.lat, origem.lng, RAIO_BUSCA_KM);
    if (perto.length > 0) return { origem, farmacias: perto, raioKm: RAIO_BUSCA_KM, ampliado: false };

    const longe = await repos.farmacias.proximas(origem.lat, origem.lng, RAIO_AMPLIADO_KM);
    return { origem, farmacias: longe, raioKm: RAIO_AMPLIADO_KM, ampliado: true };
  };
