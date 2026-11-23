"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LocateFixed, MapPin } from "lucide-react";
import { requestLocation, useSavedLocation } from "@/lib/localizacao-navegador";

/** "Perto de você" do cabeçalho: mostra a cidade real ou pede a localização. */
export function CurrentLocation() {
  const place = useSavedLocation();
  const [state, setState] = useState<"idle" | "searching" | "failed">("idle");

  const content = (icone: React.ReactNode, title: string, amount: string) => (
    <>
      <span className="grid size-10 place-items-center rounded-full ring-1 ring-white/30">{icone}</span>
      <span className="text-left leading-tight">
        <span className="block text-xs text-white/70">{title}</span>
        <span className="flex max-w-[8.5rem] items-center gap-1 truncate font-semibold">{amount} <ChevronDown className="size-3.5 shrink-0" aria-hidden /></span>
      </span>
    </>
  );

  if (place) {
    return (
      <Link href="/farmacias" className="hidden items-center gap-2 rounded-full pr-2 hover:bg-white/5 md:flex" title="Ver farmácias perto de você">
        {content(<MapPin className="size-4" aria-hidden />, "Perto de você", place.city ?? "Sua localização")}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        setState("searching");
        const r = await requestLocation();
        setState(r.ok ? "idle" : "failed");
      }}
      className="hidden items-center gap-2 rounded-full pr-2 hover:bg-white/5 md:flex"
      title="Usar minha localização"
    >
      {content(
        <LocateFixed className={`size-4 ${state === "searching" ? "animate-pulse" : ""}`} aria-hidden />,
        state === "failed" ? "Localização bloqueada" : "Perto de você",
        state === "searching" ? "Localizando…" : state === "failed" ? "Tentar de novo" : "Definir local",
      )}
    </button>
  );
}
