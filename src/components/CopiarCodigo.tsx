"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopiarCodigo({ codigo, rotulo }: { codigo: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard?.writeText(codigo).catch(() => undefined);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-marca-800 ring-1 ring-marca-800/25 transition hover:bg-menta-50"
      aria-label={`Copiar código ${codigo}`}
    >
      {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copiado ? "Copiado!" : (rotulo ?? codigo)}
      <span className="sr-only" aria-live="polite">{copiado ? "Código copiado" : ""}</span>
    </button>
  );
}
