"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Info, LocateFixed, MapPin, Phone, Search, X } from "lucide-react";
import type { NearbyResult } from "@/application/use-cases/nearby-pharmacies";
import { filterPharmacies, type NearbyPharmacy } from "@/domain/pharmacy";
import { formatKm } from "@/lib/format";
import { readSavedLocation, FAILURE_MESSAGES, requestLocation, type FailureReason } from "@/lib/browser-location";
import type { SavedLocation } from "@/lib/location-rules";

const pin = (tint: string) =>
  L.divIcon({
    className: "",
    html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${tint};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20],
  });

const PHARMACY_PIN = pin("#1f6342");
const PARTNER_PIN = pin("#f59e0b");
const YOU_PIN = L.divIcon({
  className: "",
  html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:#3a6fc4;border:3px solid #fff;box-shadow:0 0 0 6px rgba(58,111,196,.25)"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FitBounds({ origin, pharmacies, isFiltering }: { origin: { lat: number; lng: number }; pharmacies: NearbyPharmacy[]; isFiltering: boolean }) {
  const map = useMap();
  const keyName = `${origin.lat},${origin.lng}|${isFiltering}|${pharmacies.map((f) => f.id).join(",")}`;
  useEffect(() => {
    const target = pharmacies.slice(0, 5).map((f) => [f.lat, f.lng] as [number, number]);
    const points: [number, number][] = isFiltering && target.length > 0 ? target : [[origin.lat, origin.lng], ...target];
    if (points.length === 1) map.setView(points[0], 15);
    else map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a chave resume origem, filtro e ids
  }, [map, keyName]);
  return null;
}

type State =
  | { phase: "locating" }
  | { phase: "loading"; place: SavedLocation | null; failure: FailureReason | null }
  | { phase: "ready"; payload: NearbyResult; place: SavedLocation | null; failure: FailureReason | null }
  | { phase: "error" };

async function fetchNearby(place: SavedLocation | null): Promise<NearbyResult> {
  const qs = place ? `?lat=${place.lat}&lng=${place.lng}` : "";
  const r = await fetch(`/api/farmacias/proximas${qs}`);
  if (!r.ok) throw new Error("falha ao buscar farmácias");
  return r.json();
}

async function resolvePlace(askAgain: boolean): Promise<{ place: SavedLocation | null; failure: FailureReason | null }> {
  const saved = askAgain ? null : readSavedLocation();
  if (saved) return { place: saved, failure: null };
  const r = await requestLocation();
  return r.ok ? { place: r.place, failure: null } : { place: null, failure: r.reason };
}

export default function PharmacyMap() {
  const [state, setState] = useState<State>({ phase: "locating" });
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isActive = true;
    (async () => {
      const { place, failure } = await resolvePlace(attempt > 0);
      if (!isActive) return;
      setState({ phase: "loading", place, failure });
      try {
        const payload = await fetchNearby(place);
        if (isActive) setState({ phase: "ready", payload, place, failure });
      } catch {
        if (isActive) setState({ phase: "error" });
      }
    })();
    return () => { isActive = false; };
  }, [attempt]);

  const locate = useCallback(() => {
    setState({ phase: "locating" });
    setAttempt((t) => t + 1);
  }, []);

  if (state.phase === "error") {
    return <p className="rounded-2xl bg-red-50 p-6 text-red-700">Não foi possível carregar as farmácias. Tente novamente.</p>;
  }
  if (state.phase !== "ready") {
    return (
      <div className="grid h-[420px] place-items-center rounded-[var(--radius-card)] bg-mint-50 text-center text-muted">
        <p className="flex items-center gap-2">
          <LocateFixed className="size-5 animate-pulse text-brand-700" aria-hidden />
          {state.phase === "locating" ? "Pedindo sua localização ao navegador…" : "Procurando farmácias…"}
        </p>
      </div>
    );
  }

  const { payload, place, failure } = state;
  const { origin, pharmacies } = payload;
  const visible = filterPharmacies(pharmacies, query);
  const isFiltering = query.trim() !== "";
  const placeName = place?.city ?? "sua localização";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-mint-50 p-4 ring-1 ring-brand-600/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm">
          <Info className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
          <div>
            {origin.isDefault ? (
              <p>
                <strong>{failure ? FAILURE_MESSAGES[failure] : "Não usamos sua localização."}</strong> Mostrando farmácias perto da Av. Paulista, em São Paulo.
              </p>
            ) : payload.expanded ? (
              <p>
                <strong>Não há farmácias cadastradas a menos de 15 km de {placeName}.</strong>{" "}
                {pharmacies.length > 0
                  ? `As mais próximas ficam a partir de ${formatKm(pharmacies[0].distanceKm)}.`
                  : "Nenhuma farmácia encontrada na região."}
              </p>
            ) : (
              <p>Farmácias perto de <strong>{placeName}</strong>, da mais próxima para a mais distante.</p>
            )}
            <p className="mt-1 text-xs text-muted">Dados de demonstração: as farmácias cadastradas ficam na região central de São Paulo.</p>
          </div>
        </div>
        <button onClick={locate} className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-800 px-4 text-sm font-semibold text-white hover:bg-brand-700">
          <LocateFixed className="size-4" aria-hidden /> {origin.isDefault ? "Usar minha localização" : "Atualizar localização"}
        </button>
      </div>

      <div role="search" className="flex items-center gap-2 rounded-full bg-white px-4 ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-brand-600">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <input data-outer-ring type="search" value={query} onChange={(e) => setQuery(e.target.value)} enterKeyHint="search" autoComplete="off"
          placeholder="Buscar farmácia por nome ou bairro" aria-label="Buscar farmácia por nome ou bairro"
          className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted sm:text-sm [&::-webkit-search-cancel-button]:appearance-none" />
        {isFiltering && (
          <>
            <span className="shrink-0 text-xs text-muted" aria-live="polite">{visible.length} de {pharmacies.length}</span>
            <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca"
              className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-black/5">
              <X className="size-4" aria-hidden />
            </button>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="h-[55dvh] max-h-[480px] min-h-[300px] overflow-hidden rounded-[var(--radius-card)] ring-1 ring-black/5 lg:h-[560px] lg:max-h-none">
          <MapContainer center={[origin.lat, origin.lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds origin={origin} pharmacies={visible} isFiltering={isFiltering} />
            <Marker position={[origin.lat, origin.lng]} icon={YOU_PIN}>
              <Popup>{origin.isDefault ? "Av. Paulista (referência)" : `Você está aqui${place?.city ? ` · ${place.city}` : ""}`}</Popup>
            </Marker>
            {visible.map((f) => (
              <Marker key={f.id} position={[f.lat, f.lng]} icon={f.isPartner ? PARTNER_PIN : PHARMACY_PIN}>
                <Popup>
                  <strong>{f.name}</strong>
                  {f.isPartner && " · Parceira"}
                  <br />{f.address}
                  {f.phone && <><br />{f.phone}</>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <ul className="space-y-2 lg:max-h-[560px] lg:overflow-y-auto">
          {visible.length === 0 && (
            <li className="rounded-2xl bg-white p-4 text-sm text-muted ring-1 ring-black/5">
              {isFiltering ? <>Nenhuma farmácia com “{query.trim()}”. Tente outro nome ou bairro.</> : "Nenhuma farmácia encontrada."}
            </li>
          )}
          {visible.map((f) => (
            <li key={f.id} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{f.name}</p>
                <span className="shrink-0 rounded-full bg-mint-100 px-2 py-0.5 text-xs font-semibold text-brand-800">{formatKm(f.distanceKm)}</span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="size-3.5" aria-hidden /> {f.address}</p>
              {f.phone && <p className="flex items-center gap-1 text-sm text-muted"><Phone className="size-3.5" aria-hidden /> {f.phone}</p>}
              {f.isPartner && <span className="mt-2 inline-block rounded-full bg-cream px-2 py-0.5 text-xs font-semibold text-amber-800">Parceira · tem cupom</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
