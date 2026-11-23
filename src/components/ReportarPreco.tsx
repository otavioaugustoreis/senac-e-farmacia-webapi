"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag } from "lucide-react";

type State = "closed" | "open" | "sending" | "sent";

export function ReportPriceButton({ priceId, isLoggedIn, returnTo }: { priceId: number; isLoggedIn: boolean; returnTo: string }) {
  const [state, setState] = useState<State>("closed");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  if (!isLoggedIn) {
    return (
      <Link href={`/entrar?next=${encodeURIComponent(returnTo)}`} className="inline-flex min-h-9 items-center gap-1 text-xs text-suave underline hover:text-marca-700">
        <Flag className="size-3" aria-hidden /> Reportar preço incorreto
      </Link>
    );
  }
  if (state === "sent") return <span className="text-xs font-medium text-marca-700">Obrigado! Vamos verificar.</span>;
  if (state === "closed") {
    return (
      <button onClick={() => setState("open")} className="inline-flex min-h-9 items-center gap-1 text-xs text-suave underline hover:text-marca-700">
        <Flag className="size-3" aria-hidden /> Reportar preço incorreto
      </button>
    );
  }

  async function submit() {
    setState("sending");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, comment }),
      });
      if (response.ok) return setState("sent");
      const body = await response.json().catch(() => ({}));
      setErrorMessage(body.errorMessage ?? "Não foi possível enviar");
    } catch {
      setErrorMessage("Sem conexão. Verifique a internet e tente de novo.");
    }
    setState("open");
  }

  return (
    <form action={submit} className="flex w-full flex-col gap-2 sm:flex-row">
      <input name="comentario" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="O que está errado? (opcional)" aria-label="Comentário"
        className="min-w-0 flex-1 rounded-full border border-black/10 px-3 py-1.5 text-xs outline-none focus:border-marca-600" />
      <div className="flex gap-2">
        <button disabled={state === "sending"} className="rounded-full bg-marca-800 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          {state === "sending" ? "Enviando…" : "Enviar"}
        </button>
        <button type="button" onClick={() => setState("closed")} className="text-xs text-suave underline">Cancelar</button>
      </div>
      {errorMessage && <p role="alert" className="text-xs text-red-700">{errorMessage}</p>}
    </form>
  );
}
