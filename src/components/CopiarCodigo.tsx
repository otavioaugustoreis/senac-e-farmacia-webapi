"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopiarCodigo({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard?.writeText(codigo).catch(() => undefined);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-marca-600/40 bg-white px-4 py-1.5 font-mono font-bold text-marca-800 hover:border-marca-600"
      aria-label={`Copiar código ${codigo}`}
    >
      {codigo} {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span className="sr-only" aria-live="polite">{copiado ? "Copiado" : ""}</span>
    </button>
  );
}
