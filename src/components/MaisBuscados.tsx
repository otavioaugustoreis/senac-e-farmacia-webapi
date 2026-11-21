"use client";

import { useState } from "react";
import type { ResultadoBusca } from "@/domain/medicamento";
import { CartaoMedicamento } from "./CartaoMedicamento";

interface Aba {
  rotulo: string;
  itens: ResultadoBusca[];
}

/** "Mais buscados" com abas em pílula (como "Best Sellers" da referência). */
export function MaisBuscados({ abas }: { abas: Aba[] }) {
  const [ativa, setAtiva] = useState(0);
  if (abas.length === 0) return null;
  const atual = abas[Math.min(ativa, abas.length - 1)];

  return (
    <section aria-labelledby="titulo-mais-buscados">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="titulo-mais-buscados" className="text-2xl font-bold text-marca-900">Mais buscados</h2>
        <div role="tablist" aria-label="Categorias" className="sem-barra -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          {abas.map((a, i) => (
            <button key={a.rotulo} role="tab" aria-selected={i === ativa} onClick={() => setAtiva(i)}
              className={`min-h-9 shrink-0 rounded-full px-4 text-xs font-semibold ring-1 transition ${i === ativa ? "bg-marca-900 text-white ring-marca-900" : "bg-white text-tinta ring-black/15 hover:ring-marca-600"}`}>
              {a.rotulo}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
        {atual.itens.map((m) => <CartaoMedicamento key={m.id} medicamento={m} />)}
      </div>
    </section>
  );
}
