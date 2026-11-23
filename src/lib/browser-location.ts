"use client";

import { useSyncExternalStore } from "react";
import { cityFromAddress, isSavedLocationValid, type SavedLocation } from "./location-rules";

const STORAGE_KEY = "e-farmacia:local";
const EVENT_NAME = "e-farmacia:local";
const TIMEOUT_MS = 15_000;

export type FailureReason = "denied" | "unavailable" | "timeout" | "unsupported";
export type LocationResult = { ok: true; place: SavedLocation } | { ok: false; reason: FailureReason };

export const FAILURE_MESSAGES: Record<FailureReason, string> = {
  denied: "Você não permitiu o acesso à localização.",
  unavailable: "Seu dispositivo não informou a localização.",
  timeout: "A localização demorou demais para responder.",
  unsupported: "Este navegador não oferece localização.",
};

export function readSavedLocation(): SavedLocation | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return isSavedLocationValid(saved, Date.now()) ? saved : null;
  } catch {
    return null;
  }
}

function save(place: SavedLocation) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
  window.dispatchEvent(new Event(EVENT_NAME));
}

async function discoverCity(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=pt-BR&lat=${lat}&lon=${lng}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    return cityFromAddress((await r.json()).address);
  } catch {
    return null;
  }
}

function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: TIMEOUT_MS, maximumAge: 5 * 60_000 }),
  );
}

export async function requestLocation(): Promise<LocationResult> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return { ok: false, reason: "unsupported" };
  try {
    const p = await currentPosition();
    const lat = p.coords.latitude;
    const lng = p.coords.longitude;
    const place: SavedLocation = { lat, lng, city: await discoverCity(lat, lng), ts: Date.now() };
    save(place);
    return { ok: true, place };
  } catch (e) {
    const code = (e as GeolocationPositionError)?.code;
    return { ok: false, reason: code === 1 ? "denied" : code === 3 ? "timeout" : "unavailable" };
  }
}

let rawCache: string | null = null;
let localCache: SavedLocation | null = null;

function instant(): SavedLocation | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== rawCache) {
    rawCache = raw;
    localCache = readSavedLocation();
  }
  return localCache;
}

function subscribe(notice: () => void) {
  window.addEventListener(EVENT_NAME, notice);
  window.addEventListener("storage", notice);
  return () => {
    window.removeEventListener(EVENT_NAME, notice);
    window.removeEventListener("storage", notice);
  };
}

export function useSavedLocation(): SavedLocation | null {
  return useSyncExternalStore(subscribe, instant, () => null);
}
