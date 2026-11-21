import Link from "next/link";
import { LogOut, ShieldCheck, Ticket, UserRound } from "lucide-react";
import type { UsuarioAtual } from "@/domain/usuario";
import { sairAction } from "@/app/auth-actions";

const circulo = "grid size-10 shrink-0 place-items-center rounded-full";

export function MenuUsuario({ usuario }: { usuario: UsuarioAtual | null }) {
  const cupons = (
    <Link href="/cupons" aria-label="Cupons" className={`${circulo} hidden bg-white text-marca-900 hover:bg-menta-100 xl:grid`}>
      <Ticket className="size-4" aria-hidden />
    </Link>
  );

  if (!usuario) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/entrar" className="flex items-center gap-2 rounded-full hover:bg-white/5 md:pr-2">
          <span className={`${circulo} bg-white/15`}><UserRound className="size-5" aria-hidden /></span>
          <span className="leading-tight">
            <span className="block text-xs text-white/70">Olá!</span>
            <span className="block font-semibold">Entrar</span>
          </span>
        </Link>
        {cupons}
      </div>
    );
  }

  const primeiroNome = (usuario.nome ?? usuario.email).split(/[\s@]/)[0];
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-2">
        <span className={`${circulo} bg-alerta text-sm font-bold uppercase text-white`} aria-hidden>{primeiroNome.slice(0, 1)}</span>
        <span className="hidden leading-tight 2xl:block">
          <span className="block text-xs text-white/70">Olá!</span>
          <span className="block max-w-[9rem] truncate font-semibold">{primeiroNome}</span>
        </span>
      </span>
      {usuario.role === "admin" && (
        <Link href="/admin" className="hidden h-10 items-center gap-2 rounded-full bg-alerta px-4 font-semibold text-marca-950 hover:brightness-105 md:flex">
          <ShieldCheck className="size-4" aria-hidden /> Painel admin
        </Link>
      )}
      <form action={sairAction}>
        <button aria-label="Sair" className={`${circulo} bg-white/10 hover:bg-white/20`}>
          <LogOut className="size-4" aria-hidden />
        </button>
      </form>
      {cupons}
    </div>
  );
}
