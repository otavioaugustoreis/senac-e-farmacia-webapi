"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Search, ShieldCheck, Ticket, type LucideIcon } from "lucide-react";

interface Item {
  href: string;
  rotulo: string;
  icone: LucideIcon;
  ativo: (caminho: string) => boolean;
}

const ITENS: Item[] = [
  { href: "/", rotulo: "Início", icone: Home, ativo: (c) => c === "/" },
  { href: "/busca", rotulo: "Buscar", icone: Search, ativo: (c) => c.startsWith("/busca") || c.startsWith("/medicamento") },
  { href: "/farmacias", rotulo: "Farmácias", icone: MapPin, ativo: (c) => c.startsWith("/farmacias") },
  { href: "/cupons", rotulo: "Cupons", icone: Ticket, ativo: (c) => c.startsWith("/cupons") },
];

const ADMIN: Item = { href: "/admin", rotulo: "Admin", icone: ShieldCheck, ativo: (c) => c.startsWith("/admin") };

/** Barra de navegação fixa no celular (no computador a navegação fica no cabeçalho). */
export function NavInferior({ admin }: { admin: boolean }) {
  const caminho = usePathname();
  const itens = admin ? [...ITENS, ADMIN] : ITENS;

  return (
    <nav aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md">
        {itens.map(({ href, rotulo, icone: Icone, ativo }) => {
          const marcado = ativo(caminho);
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={marcado ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${marcado ? "text-marca-800" : "text-suave"}`}>
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${marcado ? "bg-menta-100" : ""}`}>
                  <Icone className="size-5" aria-hidden />
                </span>
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
