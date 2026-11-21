import Link from "next/link";
import { MapPin, Search, Ticket } from "lucide-react";
import { Logo } from "./Logo";

export function Header({ menuUsuario }: { menuUsuario: React.ReactNode }) {
  return (
    <header className="pt-3">
      <p className="rounded-full bg-menta-100 px-4 py-1.5 text-center text-xs font-medium text-marca-800">
        <span className="sm:hidden">Dados de demonstração · </span>
        <span className="hidden sm:inline">Dados de demonstração · Veja os </span>
        <Link href="/cupons" className="underline underline-offset-2">
          <span className="sm:hidden">ver cupons</span>
          <span className="hidden sm:inline">cupons das farmácias parceiras</span>
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-3 rounded-[var(--radius-card)] bg-marca-900 px-3 py-3 text-white sm:px-4">
        <Logo claro />
        <form action="/busca" role="search" className="order-3 flex w-full items-center gap-2 rounded-full bg-white px-4 text-tinta md:order-none md:w-auto md:flex-1">
          <Search className="size-4 shrink-0 text-suave" aria-hidden />
          <input
            name="q"
            type="search"
            enterKeyHint="search"
            placeholder="Nome ou princípio ativo"
            aria-label="Buscar medicamento"
            className="h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-suave md:h-10"
          />
        </form>
        <nav aria-label="Atalhos" className="ml-auto flex items-center gap-1 text-sm">
          <Link href="/farmacias" className="hidden min-h-10 items-center gap-1.5 rounded-full px-3 hover:bg-white/10 md:flex">
            <MapPin className="size-4" aria-hidden /> Perto de você
          </Link>
          <Link href="/cupons" className="hidden min-h-10 items-center gap-1.5 rounded-full px-3 hover:bg-white/10 md:flex">
            <Ticket className="size-4" aria-hidden /> Cupons
          </Link>
          {menuUsuario}
        </nav>
      </div>
    </header>
  );
}
