"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCodeButton({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard?.writeText(code).catch(() => undefined);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-brand-800 ring-1 ring-brand-800/25 transition hover:bg-mint-50"
      aria-label={`Copiar código ${code}`}
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "Copiado!" : (label ?? code)}
      <span className="sr-only" aria-live="polite">{copied ? "Código copiado" : ""}</span>
    </button>
  );
}
