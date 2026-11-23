"use client";

import Link from "next/link";
import { RotateCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-[var(--radius-card)] bg-white p-10 text-center ring-1 ring-black/5">
      <p className="text-4xl" aria-hidden>💊</p>
      <h1 className="mt-3 text-xl font-semibold text-brand-900">Algo deu errado por aqui</h1>
      <p className="mt-1 text-sm text-muted">Não conseguimos carregar esta página agora. Confira a internet e tente de novo em instantes.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900">
          <RotateCw className="size-4" aria-hidden /> Tentar de novo
        </button>
        <Link href="/" className="rounded-full px-5 py-2.5 text-sm font-semibold text-brand-800 ring-1 ring-brand-800/20 hover:bg-mint-50">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
