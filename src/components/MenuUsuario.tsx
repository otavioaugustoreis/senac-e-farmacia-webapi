import Link from "next/link";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import type { UsuarioAtual } from "@/domain/usuario";
import { sairAction } from "@/app/auth-actions";

export function MenuUsuario({ usuario }: { usuario: UsuarioAtual | null }) {
  if (!usuario) {
    return (
      <Link href="/entrar" className="flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 font-semibold text-marca-900">
        <UserRound className="size-4" aria-hidden /> Entrar
      </Link>
    );
  }
  const primeiroNome = (usuario.nome ?? usuario.email).split(/[\s@]/)[0];
  return (
    <div className="flex items-center gap-1">
      {usuario.role === "admin" && (
        <Link href="/admin" className="hidden min-h-10 items-center gap-1 rounded-full bg-white/10 px-3 hover:bg-white/20 md:flex">
          <ShieldCheck className="size-4" aria-hidden /> Admin
        </Link>
      )}
      <span className="hidden px-2 text-white/80 lg:inline">Olá, <strong className="text-white">{primeiroNome}</strong></span>
      <form action={sairAction}>
        <button className="flex min-h-10 items-center gap-1.5 rounded-full px-3 hover:bg-white/10" aria-label={`Sair (${primeiroNome})`}>
          <span className="grid size-7 place-items-center rounded-full bg-white/15 text-xs font-bold uppercase lg:hidden" aria-hidden>
            {primeiroNome.slice(0, 1)}
          </span>
          <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">Sair</span>
        </button>
      </form>
    </div>
  );
}
