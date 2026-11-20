"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { MapPin, Phone } from "lucide-react";
import type { ResultadoProximas } from "@/application/casos-de-uso/farmacias-proximas";
import { formatKm } from "@/lib/format";

const TEMPO_LIMITE_MS = 5000;

const pino = (cor: string) =>
  L.divIcon({
    className: "",
    html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${cor};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20],
  });

const PINO_FARMACIA = pino("#1f6342");
const PINO_PARCEIRA = pino("#f59e0b");
const PINO_VOCE = L.divIcon({
  className: "",
  html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:#3a6fc4;border:3px solid #fff;box-shadow:0 0 0 6px rgba(58,111,196,.25)"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function obterPosicao(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    const desistir = setTimeout(() => resolve(null), TEMPO_LIMITE_MS);
    navigator.geolocation.getCurrentPosition(
      (p) => { clearTimeout(desistir); resolve({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => { clearTimeout(desistir); resolve(null); },
      { timeout: TEMPO_LIMITE_MS, maximumAge: 60_000 },
    );
  });
}

function Recentralizar({ lat, lng }: { lat: number; lng: number }) {
  const mapa = useMap();
  useEffect(() => { mapa.setView([lat, lng], 14); }, [mapa, lat, lng]);
  return null;
}

export default function MapaFarmacias() {
  const [dados, setDados] = useState<ResultadoProximas | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const pos = await obterPosicao();
      const qs = pos ? `?lat=${pos.lat}&lng=${pos.lng}` : "";
      try {
        const r = await fetch(`/api/farmacias/proximas${qs}`);
        if (!r.ok) throw new Error();
        if (ativo) setDados(await r.json());
      } catch {
        if (ativo) setErro(true);
      }
    })();
    return () => { ativo = false; };
  }, []);

  if (erro) return <p className="rounded-2xl bg-red-50 p-6 text-red-700">Não foi possível carregar as farmácias. Tente novamente.</p>;
  if (!dados) return <div className="grid h-[420px] place-items-center rounded-[var(--radius-card)] bg-menta-50 text-suave">Procurando farmácias perto de você…</div>;

  const { origem, farmacias } = dados;
  return (
    <div className="space-y-4">
      {origem.padrao && (
        <p className="rounded-full bg-creme px-4 py-2 text-sm text-amber-900">
          Não conseguimos sua localização. Mostrando farmácias perto da Av. Paulista.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="h-[420px] overflow-hidden rounded-[var(--radius-card)] ring-1 ring-black/5 lg:h-[560px]">
          <MapContainer center={[origem.lat, origem.lng]} zoom={14} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recentralizar lat={origem.lat} lng={origem.lng} />
            <Marker position={[origem.lat, origem.lng]} icon={PINO_VOCE}>
              <Popup>{origem.padrao ? "Av. Paulista" : "Você está aqui"}</Popup>
            </Marker>
            {farmacias.map((f) => (
              <Marker key={f.id} position={[f.lat, f.lng]} icon={f.parceira ? PINO_PARCEIRA : PINO_FARMACIA}>
                <Popup>
                  <strong>{f.nome}</strong>
                  {f.parceira && " · Parceira"}
                  <br />{f.endereco}
                  {f.telefone && <><br />{f.telefone}</>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <ul className="max-h-[560px] space-y-2 overflow-y-auto">
          {farmacias.length === 0 && <li className="rounded-2xl bg-white p-4 text-suave">Nenhuma farmácia num raio de 15 km.</li>}
          {farmacias.map((f) => (
            <li key={f.id} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{f.nome}</p>
                <span className="shrink-0 rounded-full bg-menta-100 px-2 py-0.5 text-xs font-semibold text-marca-800">{formatKm(f.distanciaKm)}</span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-suave"><MapPin className="size-3.5" aria-hidden /> {f.endereco}</p>
              {f.telefone && <p className="flex items-center gap-1 text-sm text-suave"><Phone className="size-3.5" aria-hidden /> {f.telefone}</p>}
              {f.parceira && <span className="mt-2 inline-block rounded-full bg-creme px-2 py-0.5 text-xs font-semibold text-amber-800">Parceira · tem cupom</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
