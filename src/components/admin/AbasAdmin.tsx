"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONFIG, ENTIDADES } from "./entidades";

export function AbasAdmin() {
  const caminho = usePathname();
  const abas = [{ href: "/admin", rotulo: "Visão geral" }, ...ENTIDADES.map((e) => ({ href: `/admin/${e}`, rotulo: CONFIG[e].titulo }))];
  return (
    <nav aria-label="Seções do painel" className="flex gap-2 overflow-x-auto pb-1">
      {abas.map((a) => {
        const ativa = caminho === a.href;
        return (
          <Link key={a.href} href={a.href} aria-current={ativa ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${ativa ? "bg-marca-800 text-white ring-marca-800" : "bg-white ring-black/10 hover:ring-marca-600"}`}>
            {a.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
