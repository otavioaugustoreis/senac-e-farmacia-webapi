"use client";

import { useSyncExternalStore } from "react";
import { cidadeDoEndereco, localSalvoValido, type LocalSalvo } from "./localizacao-regras";

/*
 * Localização do usuário, compartilhada entre o cabeçalho e o mapa.
 * Fica só no navegador (localStorage). O nome da cidade vem do OpenStreetMap (Nominatim).
 */

const CHAVE = "e-farmacia:local";
const EVENTO = "e-farmacia:local";
const TEMPO_LIMITE_MS = 15_000;

export type MotivoFalha = "negada" | "indisponivel" | "tempo" | "sem-suporte";
export type ResultadoLocal = { ok: true; local: LocalSalvo } | { ok: false; motivo: MotivoFalha };

export const MENSAGEM_FALHA: Record<MotivoFalha, string> = {
  negada: "Você não permitiu o acesso à localização.",
  indisponivel: "Seu dispositivo não informou a localização.",
  tempo: "A localização demorou demais para responder.",
  "sem-suporte": "Este navegador não oferece localização.",
};

export function lerLocalSalvo(): LocalSalvo | null {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    return localSalvoValido(salvo, Date.now()) ? salvo : null;
  } catch {
    return null;
  }
}

function salvar(local: LocalSalvo) {
  localStorage.setItem(CHAVE, JSON.stringify(local));
  window.dispatchEvent(new Event(EVENTO));
}

async function descobrirCidade(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=pt-BR&lat=${lat}&lon=${lng}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    return cidadeDoEndereco((await r.json()).address);
  } catch {
    return null;
  }
}

function posicaoAtual(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: TEMPO_LIMITE_MS, maximumAge: 5 * 60_000 }),
  );
}

/** Pede a posição ao navegador, descobre a cidade e avisa os componentes interessados. */
export async function obterLocalizacao(): Promise<ResultadoLocal> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return { ok: false, motivo: "sem-suporte" };
  try {
    const p = await posicaoAtual();
    const lat = p.coords.latitude;
    const lng = p.coords.longitude;
    const local: LocalSalvo = { lat, lng, cidade: await descobrirCidade(lat, lng), ts: Date.now() };
    salvar(local);
    return { ok: true, local };
  } catch (e) {
    const codigo = (e as GeolocationPositionError)?.code;
    return { ok: false, motivo: codigo === 1 ? "negada" : codigo === 3 ? "tempo" : "indisponivel" };
  }
}

let cacheBruto: string | null = null;
let cacheLocal: LocalSalvo | null = null;

function instantaneo(): LocalSalvo | null {
  const bruto = localStorage.getItem(CHAVE);
  if (bruto !== cacheBruto) {
    cacheBruto = bruto;
    cacheLocal = lerLocalSalvo();
  }
  return cacheLocal;
}

function assinar(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO, aviso);
    window.removeEventListener("storage", aviso);
  };
}

/** Local salvo, atualizado quando o usuário define a localização em qualquer parte do site. */
export function useLocalSalvo(): LocalSalvo | null {
  return useSyncExternalStore(assinar, instantaneo, () => null);
}
