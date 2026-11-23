"use client";

import { usePathname, useSearchParams } from "next/navigation";

const CLASSE = "h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-suave md:h-10";

/** Mantém no campo o termo pesquisado enquanto a pessoa está nos resultados. */
export function CampoBusca() {
  const params = useSearchParams();
  const termo = usePathname() === "/busca" ? (params.get("q") ?? "") : "";
  return (
    <input key={termo} name="q" type="search" enterKeyHint="search" defaultValue={termo}
      placeholder="Nome ou princípio ativo" aria-label="Buscar medicamento" className={CLASSE} />
  );
}

export function CampoBuscaVazio() {
  return <input name="q" type="search" enterKeyHint="search" placeholder="Nome ou princípio ativo" aria-label="Buscar medicamento" className={CLASSE} />;
}
