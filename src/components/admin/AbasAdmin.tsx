"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENTITY_CONFIG, ENTITIES } from "./entidades";

export function AdminTabs() {
  const path = usePathname();
  const tabs = [{ href: "/admin", label: "Visão geral" }, ...ENTITIES.map((e) => ({ href: `/admin/${e}`, label: ENTITY_CONFIG[e].title }))];
  return (
    <nav aria-label="Seções do painel" className="sem-barra -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {tabs.map((a) => {
        const activeTab = path === a.href;
        return (
          <Link key={a.href} href={a.href} aria-current={activeTab ? "page" : undefined}
            className={`flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-medium ring-1 ${activeTab ? "bg-marca-800 text-white ring-marca-800" : "bg-white ring-black/10 hover:ring-marca-600"}`}>
            {a.label}
          </Link>
        );
      })}
    </nav>
  );
}
