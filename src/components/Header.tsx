import Link from "next/link";
import { MapPin, Search, Ticket } from "lucide-react";
import { Logo } from "./Logo";

export function Header({ menuUsuario }: { menuUsuario?: React.ReactNode }) {
  return (
    <header className="pt-3">
      <p className="rounded-full bg-menta-100 px-4 py-1.5 text-center text-xs font-medium text-marca-800">
        Dados de demonstração · Veja os <Link href="/cupons" className="underline underline-offset-2">cupons das farmácias parceiras</Link>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] bg-marca-900 px-4 py-3 text-white">
        <Logo claro />
        <form action="/busca" className="order-3 flex w-full items-center gap-2 rounded-full bg-white px-3 py-1.5 text-tinta sm:order-none sm:w-auto sm:flex-1">
          <Search className="size-4 text-suave" aria-hidden />
          <input
            name="q"
            placeholder="Busque por nome ou princípio ativo"
            aria-label="Buscar medicamento"
            className="w-full bg-transparent text-sm outline-none placeholder:text-suave"
          />
        </form>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link href="/farmacias" className="flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-white/10">
            <MapPin className="size-4" aria-hidden /> <span className="hidden md:inline">Perto de você</span>
          </Link>
          <Link href="/cupons" className="flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-white/10">
            <Ticket className="size-4" aria-hidden /> <span className="hidden md:inline">Cupons</span>
          </Link>
          {menuUsuario ?? (
            <Link href="/entrar" className="rounded-full bg-white px-3 py-1.5 font-semibold text-marca-900">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
