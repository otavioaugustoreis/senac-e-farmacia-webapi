"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LocateFixed, MapPin } from "lucide-react";
import { obterLocalizacao, useLocalSalvo } from "@/lib/localizacao-navegador";

/** "Perto de você" do cabeçalho: mostra a cidade real ou pede a localização. */
export function LocalizacaoAtual() {
  const local = useLocalSalvo();
  const [estado, setEstado] = useState<"ocioso" | "buscando" | "falhou">("ocioso");

  const conteudo = (icone: React.ReactNode, titulo: string, valor: string) => (
    <>
      <span className="grid size-10 place-items-center rounded-full ring-1 ring-white/30">{icone}</span>
      <span className="text-left leading-tight">
        <span className="block text-xs text-white/70">{titulo}</span>
        <span className="flex max-w-[8.5rem] items-center gap-1 truncate font-semibold">{valor} <ChevronDown className="size-3.5 shrink-0" aria-hidden /></span>
      </span>
    </>
  );

  if (local) {
    return (
      <Link href="/farmacias" className="hidden items-center gap-2 rounded-full pr-2 hover:bg-white/5 md:flex" title="Ver farmácias perto de você">
        {conteudo(<MapPin className="size-4" aria-hidden />, "Perto de você", local.cidade ?? "Sua localização")}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        setEstado("buscando");
        const r = await obterLocalizacao();
        setEstado(r.ok ? "ocioso" : "falhou");
      }}
      className="hidden items-center gap-2 rounded-full pr-2 hover:bg-white/5 md:flex"
      title="Usar minha localização"
    >
      {conteudo(
        <LocateFixed className={`size-4 ${estado === "buscando" ? "animate-pulse" : ""}`} aria-hidden />,
        estado === "falhou" ? "Localização bloqueada" : "Perto de você",
        estado === "buscando" ? "Localizando…" : estado === "falhou" ? "Tentar de novo" : "Definir local",
      )}
    </button>
  );
}
