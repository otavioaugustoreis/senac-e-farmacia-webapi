import { coordenadasValidas, PONTO_PADRAO, type FarmaciaProxima } from "@/domain/farmacia";
import type { Repositorios } from "../ports";

export const RAIO_BUSCA_KM = 15;

export interface ResultadoProximas {
  origem: { lat: number; lng: number; padrao: boolean };
  farmacias: FarmaciaProxima[];
}

export const farmaciasProximas = (repos: Pick<Repositorios, "farmacias">) =>
  async (lat: unknown, lng: unknown): Promise<ResultadoProximas> => {
    const valida = coordenadasValidas(lat, lng);
    const origem = valida
      ? { lat: lat as number, lng: lng as number, padrao: false }
      : { ...PONTO_PADRAO, padrao: true };
    const farmacias = await repos.farmacias.proximas(origem.lat, origem.lng, RAIO_BUSCA_KM);
    return { origem, farmacias };
  };
