"use client";

import { useState } from "react";
import type { SearchResult } from "@/domain/medicine";
import { MedicineCard } from "./MedicineCard";

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
    <section aria-labelledby="title-most-searched">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="title-most-searched" className="text-2xl font-bold text-brand-900">Mais buscados</h2>
        <div role="tablist" aria-label="Categorias" className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          {tabs.map((a, i) => (
            <button key={a.label} role="tab" aria-selected={i === activeTab} onClick={() => setActiveTab(i)}
              className={`min-h-9 shrink-0 rounded-full px-4 text-xs font-semibold ring-1 transition ${i === activeTab ? "bg-brand-900 text-white ring-brand-900" : "bg-white text-ink ring-black/15 hover:ring-brand-600"}`}>
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
