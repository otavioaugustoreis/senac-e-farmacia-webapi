"use client";

import dynamic from "next/dynamic";

// Leaflet usa `window`: o mapa só é carregado no navegador.
const PharmacyMap = dynamic(() => import("./PharmacyMap"), {
  ssr: false,
  loading: () => <div className="grid h-[420px] place-items-center rounded-[var(--radius-card)] bg-mint-50 text-muted">Carregando mapa…</div>,
});

export function PharmacyMapClient() {
  return <PharmacyMap />;
}
