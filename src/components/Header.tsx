import Link from "next/link";
import { ChevronDown, MapPin, Search } from "lucide-react";
import type { Categoria } from "@/domain/medicamento";
import { Logo } from "./Logo";

interface Props {
  menuUsuario: React.ReactNode;
  categorias: Categoria[];
}

export function Header({ menuUsuario, categorias }: Props) {
  return (
    <header className="relative z-10 pt-3">
      <p className="rounded-full bg-menta-100 px-4 py-1.5 text-center text-xs font-medium text-marca-800">
        <span aria-hidden>💊 </span>
        <span className="sm:hidden">Dados de demonstração · </span>
        <span className="hidden sm:inline">Dados de demonstração · Economize com genéricos e use os </span>
        <Link href="/cupons" className="font-semibold underline underline-offset-2">
          <span className="sm:hidden">ver cupons</span>
          <span className="hidden sm:inline">cupons das farmácias parceiras</span>
        </Link>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[var(--radius-card)] bg-marca-900 px-4 py-3 text-white sm:px-6 sm:py-4">
        <Logo claro />

        <form action="/busca" role="search" autoComplete="off" className="order-3 flex w-full items-center gap-2 md:order-none md:w-auto md:flex-1">
          <label className="relative hidden lg:block">
            <span className="sr-only">Categoria</span>
            <select name="categoria" defaultValue="" autoComplete="off"
              className="h-10 appearance-none rounded-full bg-menta-100 pl-4 pr-9 text-sm font-medium text-marca-900 outline-none">
              <option value="">Todas as categorias</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-marca-800" aria-hidden />
          </label>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 text-tinta">
            <Search className="size-4 shrink-0 text-suave" aria-hidden />
            <input name="q" type="search" enterKeyHint="search" placeholder="Nome ou princípio ativo" aria-label="Buscar medicamento"
              className="h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-suave md:h-10" />
          </div>
        </form>

        <nav aria-label="Atalhos" className="ml-auto flex items-center gap-2 text-sm">
          <Link href="/farmacias" className="hidden items-center gap-2 rounded-full pr-2 hover:bg-white/5 md:flex">
            <span className="grid size-10 place-items-center rounded-full ring-1 ring-white/30"><MapPin className="size-4" aria-hidden /></span>
            <span className="leading-tight">
              <span className="block text-xs text-white/70">Perto de você</span>
              <span className="flex items-center gap-1 font-semibold">São Paulo <ChevronDown className="size-3.5" aria-hidden /></span>
            </span>
          </Link>
          {menuUsuario}
        </nav>
      </div>
    </header>
  );
}
