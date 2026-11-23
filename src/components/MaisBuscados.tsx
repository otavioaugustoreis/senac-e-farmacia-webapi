"use client";

import { useState } from "react";
import type { SearchResult } from "@/domain/medicamento";
import { MedicineCard } from "./CartaoMedicamento";

interface Tab {
  label: string;
  items: SearchResult[];
}

/** "Mais buscados" com abas em pílula (como "Best Sellers" da referência). */
export function MostSearched({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(0);
  if (tabs.length === 0) return null;
  const current = tabs[Math.min(activeTab, tabs.length - 1)];

  return (
    <section aria-labelledby="titulo-mais-buscados">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="titulo-mais-buscados" className="text-2xl font-bold text-marca-900">Mais buscados</h2>
        <div role="tablist" aria-label="Categorias" className="sem-barra -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          {tabs.map((a, i) => (
            <button key={a.label} role="tab" aria-selected={i === activeTab} onClick={() => setActiveTab(i)}
              className={`min-h-9 shrink-0 rounded-full px-4 text-xs font-semibold ring-1 transition ${i === activeTab ? "bg-marca-900 text-white ring-marca-900" : "bg-white text-tinta ring-black/15 hover:ring-marca-600"}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
        {current.items.map((m) => <MedicineCard key={m.id} medicine={m} />)}
      </div>
    </section>
  );
}
