"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Info, LocateFixed, MapPin, Phone, Search, X } from "lucide-react";
import type { ResultadoProximas } from "@/application/casos-de-uso/farmacias-proximas";
import { filtrarFarmacias, type FarmaciaProxima } from "@/domain/farmacia";
import { formatKm } from "@/lib/format";
import { lerLocalSalvo, MENSAGEM_FALHA, obterLocalizacao, type MotivoFalha } from "@/lib/localizacao-navegador";
import type { LocalSalvo } from "@/lib/localizacao-regras";

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

/** Enquadra a origem e as farmácias (ex.: Campinas e São Paulo no mesmo mapa); com filtro, só o resultado. */
function Enquadrar({ origem, farmacias, filtrando }: { origem: { lat: number; lng: number }; farmacias: FarmaciaProxima[]; filtrando: boolean }) {
  const mapa = useMap();
  const chave = `${origem.lat},${origem.lng}|${filtrando}|${farmacias.map((f) => f.id).join(",")}`;
  useEffect(() => {
    const alvo = farmacias.slice(0, 5).map((f) => [f.lat, f.lng] as [number, number]);
    const pontos: [number, number][] = filtrando && alvo.length > 0 ? alvo : [[origem.lat, origem.lng], ...alvo];
    if (pontos.length === 1) mapa.setView(pontos[0], 15);
    else mapa.fitBounds(pontos, { padding: [40, 40], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a chave resume origem, filtro e ids
  }, [mapa, chave]);
  return null;
}

type Estado =
  | { fase: "localizando" }
  | { fase: "carregando"; local: LocalSalvo | null; falha: MotivoFalha | null }
  | { fase: "pronto"; dados: ResultadoProximas; local: LocalSalvo | null; falha: MotivoFalha | null }
  | { fase: "erro" };

async function buscarProximas(local: LocalSalvo | null): Promise<ResultadoProximas> {
  const qs = local ? `?lat=${local.lat}&lng=${local.lng}` : "";
  const r = await fetch(`/api/farmacias/proximas${qs}`);
  if (!r.ok) throw new Error("falha ao buscar farmácias");
  return r.json();
}

/** Usa a posição já confirmada (cabeçalho ou visita anterior); senão pede ao navegador. */
async function resolverLocal(pedirDeNovo: boolean): Promise<{ local: LocalSalvo | null; falha: MotivoFalha | null }> {
  const salvo = pedirDeNovo ? null : lerLocalSalvo();
  if (salvo) return { local: salvo, falha: null };
  const r = await obterLocalizacao();
  return r.ok ? { local: r.local, falha: null } : { local: null, falha: r.motivo };
}

export default function MapaFarmacias() {
  const [estado, setEstado] = useState<Estado>({ fase: "localizando" });
  const [tentativa, setTentativa] = useState(0);
  const [termo, setTermo] = useState("");

  useEffect(() => {
    let ativo = true;
    (async () => {
      const { local, falha } = await resolverLocal(tentativa > 0);
      if (!ativo) return;
      setEstado({ fase: "carregando", local, falha });
      try {
        const dados = await buscarProximas(local);
        if (ativo) setEstado({ fase: "pronto", dados, local, falha });
      } catch {
        if (ativo) setEstado({ fase: "erro" });
      }
    })();
    return () => { ativo = false; };
  }, [tentativa]);

  const localizar = useCallback(() => {
    setEstado({ fase: "localizando" });
    setTentativa((t) => t + 1);
  }, []);

  if (estado.fase === "erro") {
    return <p className="rounded-2xl bg-red-50 p-6 text-red-700">Não foi possível carregar as farmácias. Tente novamente.</p>;
  }
  if (estado.fase !== "pronto") {
    return (
      <div className="grid h-[420px] place-items-center rounded-[var(--radius-card)] bg-menta-50 text-center text-suave">
        <p className="flex items-center gap-2">
          <LocateFixed className="size-5 animate-pulse text-marca-700" aria-hidden />
          {estado.fase === "localizando" ? "Pedindo sua localização ao navegador…" : "Procurando farmácias…"}
        </p>
      </div>
    );
  }

  const { dados, local, falha } = estado;
  const { origem, farmacias } = dados;
  const visiveis = filtrarFarmacias(farmacias, termo);
  const filtrando = termo.trim() !== "";
  const lugar = local?.cidade ?? "sua localização";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-menta-50 p-4 ring-1 ring-marca-600/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm">
          <Info className="mt-0.5 size-5 shrink-0 text-marca-700" aria-hidden />
          <div>
            {origem.padrao ? (
              <p>
                <strong>{falha ? MENSAGEM_FALHA[falha] : "Não usamos sua localização."}</strong> Mostrando farmácias perto da Av. Paulista, em São Paulo.
              </p>
            ) : dados.ampliado ? (
              <p>
                <strong>Não há farmácias cadastradas a menos de 15 km de {lugar}.</strong>{" "}
                {farmacias.length > 0
                  ? `As mais próximas ficam a partir de ${formatKm(farmacias[0].distanciaKm)}.`
                  : "Nenhuma farmácia encontrada na região."}
              </p>
            ) : (
              <p>Farmácias perto de <strong>{lugar}</strong>, da mais próxima para a mais distante.</p>
            )}
            <p className="mt-1 text-xs text-suave">Dados de demonstração: as farmácias cadastradas ficam na região central de São Paulo.</p>
          </div>
        </div>
        <button onClick={localizar} className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-marca-800 px-4 text-sm font-semibold text-white hover:bg-marca-700">
          <LocateFixed className="size-4" aria-hidden /> {origem.padrao ? "Usar minha localização" : "Atualizar localização"}
        </button>
      </div>

      <div role="search" className="flex items-center gap-2 rounded-full bg-white px-4 ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-marca-600">
        <Search className="size-4 shrink-0 text-suave" aria-hidden />
        <input data-anel-externo type="search" value={termo} onChange={(e) => setTermo(e.target.value)} enterKeyHint="search" autoComplete="off"
          placeholder="Buscar farmácia por nome ou bairro" aria-label="Buscar farmácia por nome ou bairro"
          className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-suave sm:text-sm [&::-webkit-search-cancel-button]:appearance-none" />
        {filtrando && (
          <>
            <span className="shrink-0 text-xs text-suave" aria-live="polite">{visiveis.length} de {farmacias.length}</span>
            <button type="button" onClick={() => setTermo("")} aria-label="Limpar busca"
              className="grid size-8 shrink-0 place-items-center rounded-full text-suave hover:bg-black/5">
              <X className="size-4" aria-hidden />
            </button>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="h-[55dvh] max-h-[480px] min-h-[300px] overflow-hidden rounded-[var(--radius-card)] ring-1 ring-black/5 lg:h-[560px] lg:max-h-none">
          <MapContainer center={[origem.lat, origem.lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Enquadrar origem={origem} farmacias={visiveis} filtrando={filtrando} />
            <Marker position={[origem.lat, origem.lng]} icon={PINO_VOCE}>
              <Popup>{origem.padrao ? "Av. Paulista (referência)" : `Você está aqui${local?.cidade ? ` · ${local.cidade}` : ""}`}</Popup>
            </Marker>
            {visiveis.map((f) => (
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
        <ul className="space-y-2 lg:max-h-[560px] lg:overflow-y-auto">
          {visiveis.length === 0 && (
            <li className="rounded-2xl bg-white p-4 text-sm text-suave ring-1 ring-black/5">
              {filtrando ? <>Nenhuma farmácia com “{termo.trim()}”. Tente outro nome ou bairro.</> : "Nenhuma farmácia encontrada."}
            </li>
          )}
          {visiveis.map((f) => (
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
