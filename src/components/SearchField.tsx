"use client";

import { usePathname, useSearchParams } from "next/navigation";

const INPUT_CLASS = "h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted md:h-10";

export function SearchField() {
  const params = useSearchParams();
  const query = usePathname() === "/busca" ? (params.get("q") ?? "") : "";
  return (
    <input key={query} name="q" type="search" enterKeyHint="search" defaultValue={query}
      placeholder="Nome ou princípio ativo" aria-label="Buscar medicamento" className={INPUT_CLASS} />
  );
}

export function EmptySearchField() {
  return <input name="q" type="search" enterKeyHint="search" placeholder="Nome ou princípio ativo" aria-label="Buscar medicamento" className={INPUT_CLASS} />;
}
