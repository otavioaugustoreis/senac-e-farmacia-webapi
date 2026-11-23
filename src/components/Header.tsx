import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { LocalizacaoAtual } from "./LocalizacaoAtual";
import { CampoBusca, CampoBuscaVazio } from "./CampoBusca";

interface Props {
  menuUsuario: React.ReactNode;
}

export function Header({ menuUsuario }: Props) {
  return (
    <header id="topo" className="relative z-10 scroll-mt-4 pt-3">
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

        <form action="/busca" role="search" autoComplete="off" className="hidden md:flex md:max-w-2xl md:flex-1">
          <div className="flex w-full min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 text-tinta">
            <Search className="size-4 shrink-0 text-suave" aria-hidden />
            <Suspense fallback={<CampoBuscaVazio />}><CampoBusca /></Suspense>
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
