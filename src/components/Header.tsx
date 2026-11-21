import Link from "next/link";
import { Search } from "lucide-react";
import type { Categoria } from "@/domain/medicamento";
import { Logo } from "./Logo";
import { SeletorCategoria } from "./SeletorCategoria";
import { LocalizacaoAtual } from "./LocalizacaoAtual";

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

        <form action="/busca" role="search" autoComplete="off" className="order-3 flex w-full flex-col gap-2 sm:flex-row sm:items-center md:order-none md:w-auto md:flex-1">
          <SeletorCategoria categorias={categorias} />
          <div className="flex w-full min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 text-tinta sm:w-auto">
            <Search className="size-4 shrink-0 text-suave" aria-hidden />
            <input name="q" type="search" enterKeyHint="search" placeholder="Nome ou princípio ativo" aria-label="Buscar medicamento"
              className="h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-suave md:h-10" />
          </div>
        </form>

        <nav aria-label="Atalhos" className="ml-auto flex items-center gap-2 text-sm">
          <LocalizacaoAtual />
          {menuUsuario}
        </nav>
      </div>
    </header>
  );
}
