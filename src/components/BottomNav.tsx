"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Search, ShieldCheck, Ticket, type LucideIcon } from "lucide-react";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (path: string) => boolean;
}

const ITEMS: Item[] = [
  { href: "/", label: "Início", icon: Home, isActive: (c) => c === "/" },
  { href: "/busca", label: "Buscar", icon: Search, isActive: (c) => c.startsWith("/busca") || c.startsWith("/medicamento") },
  { href: "/farmacias", label: "Farmácias", icon: MapPin, isActive: (c) => c.startsWith("/farmacias") },
  { href: "/cupons", label: "Cupons", icon: Ticket, isActive: (c) => c.startsWith("/cupons") },
];

const ADMIN: Item = { href: "/admin", label: "Admin", icon: ShieldCheck, isActive: (c) => c.startsWith("/admin") };

export function BottomNav({ admin }: { admin: boolean }) {
  const path = usePathname();
  const items = admin ? [...ITEMS, ADMIN] : ITEMS;

  return (
    <nav aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md">
        {items.map(({ href, label, icon: Icon, isActive }) => {
          const checked = isActive(path);
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={checked ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${checked ? "text-brand-800" : "text-muted"}`}>
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${checked ? "bg-mint-100" : ""}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
