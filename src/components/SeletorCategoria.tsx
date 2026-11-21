"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Categoria } from "@/domain/medicamento";

const CSS =
  "h-11 w-full appearance-none truncate rounded-full bg-menta-100 pl-4 pr-9 text-sm font-medium text-marca-900 outline-none md:h-10";

function Seletor({ categorias, valor }: { categorias: Categoria[]; valor: string }) {
  return (
    <label className="relative block w-full shrink-0 sm:w-56">
      <span className="sr-only">Categoria</span>
      {/* key: volta para "Todas as categorias" ao mudar de página (o navegador não restaura a escolha antiga) */}
      <select key={valor} name="categoria" defaultValue={valor} autoComplete="off" className={CSS}>
        <option value="">Todas as categorias</option>
        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-marca-800" aria-hidden />
    </label>
  );
}

function SeletorSincronizado({ categorias }: { categorias: Categoria[] }) {
  const caminho = usePathname();
  const params = useSearchParams();
  const atual = caminho === "/busca" ? params.get("categoria") ?? "" : "";
  const valor = categorias.some((c) => String(c.id) === atual) ? atual : "";
  return <Seletor categorias={categorias} valor={valor} />;
}

/** Seletor "Todas as categorias" do cabeçalho; reflete o filtro atual só na página de busca. */
export function SeletorCategoria({ categorias }: { categorias: Categoria[] }) {
  return (
    <Suspense fallback={<Seletor categorias={categorias} valor="" />}>
      <SeletorSincronizado categorias={categorias} />
    </Suspense>
  );
}
