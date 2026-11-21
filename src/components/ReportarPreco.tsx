"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag } from "lucide-react";

type Estado = "fechado" | "aberto" | "enviando" | "enviado";

export function ReportarPreco({ precoId, logado, voltarPara }: { precoId: number; logado: boolean; voltarPara: string }) {
  const [estado, setEstado] = useState<Estado>("fechado");
  const [erro, setErro] = useState<string | null>(null);

  if (!logado) {
    return (
      <Link href={`/entrar?next=${encodeURIComponent(voltarPara)}`} className="inline-flex min-h-9 items-center gap-1 text-xs text-suave underline hover:text-marca-700">
        <Flag className="size-3" aria-hidden /> Reportar preço incorreto
      </Link>
    );
  }
  if (estado === "enviado") return <span className="text-xs font-medium text-marca-700">Obrigado! Vamos verificar.</span>;
  if (estado === "fechado") {
    return (
      <button onClick={() => setEstado("aberto")} className="inline-flex min-h-9 items-center gap-1 text-xs text-suave underline hover:text-marca-700">
        <Flag className="size-3" aria-hidden /> Reportar preço incorreto
      </button>
    );
  }

  async function enviar(form: FormData) {
    setEstado("enviando");
    setErro(null);
    const resposta = await fetch("/api/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ precoId, comentario: String(form.get("comentario") ?? "") }),
    });
    if (resposta.ok) return setEstado("enviado");
    const corpo = await resposta.json().catch(() => ({}));
    setErro(corpo.erro ?? "Não foi possível enviar");
    setEstado("aberto");
  }

  return (
    <form action={enviar} className="flex w-full flex-col gap-2 sm:flex-row">
      <input name="comentario" maxLength={500} placeholder="O que está errado? (opcional)" aria-label="Comentário"
        className="min-w-0 flex-1 rounded-full border border-black/10 px-3 py-1.5 text-xs outline-none focus:border-marca-600" />
      <div className="flex gap-2">
        <button disabled={estado === "enviando"} className="rounded-full bg-marca-800 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          {estado === "enviando" ? "Enviando…" : "Enviar"}
        </button>
        <button type="button" onClick={() => setEstado("fechado")} className="text-xs text-suave underline">Cancelar</button>
      </div>
      {erro && <p role="alert" className="text-xs text-red-700">{erro}</p>}
    </form>
  );
}
