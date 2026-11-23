import Link from "next/link";
import { LogOut, ShieldCheck, Ticket, UserRound } from "lucide-react";
import type { CurrentUser } from "@/domain/user";
import { signOutAction } from "@/app/auth-actions";

const circle = "grid size-10 shrink-0 place-items-center rounded-full";

export function UserMenu({ user }: { user: CurrentUser | null }) {
  const coupons = (
    <Link href="/cupons" aria-label="Cupons" className={`${circle} hidden bg-white text-brand-900 hover:bg-mint-100 xl:grid`}>
      <Ticket className="size-4" aria-hidden />
    </Link>
  );

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/entrar" className="flex items-center gap-2 rounded-full hover:bg-white/5 md:pr-2">
          <span className={`${circle} bg-white/15`}><UserRound className="size-5" aria-hidden /></span>
          <span className="leading-tight">
            <span className="block text-xs text-white/70">Olá!</span>
            <span className="block font-semibold">Entrar</span>
          </span>
        </Link>
        {coupons}
      </div>
    );
  }

  const firstName = (user.name ?? user.email).split(/[\s@]/)[0];
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-2">
        <span className={`${circle} bg-warning text-sm font-bold uppercase text-white`} aria-hidden>{firstName.slice(0, 1)}</span>
        <span className="hidden leading-tight 2xl:block">
          <span className="block text-xs text-white/70">Olá!</span>
          <span className="block max-w-[9rem] truncate font-semibold">{firstName}</span>
        </span>
      </span>
      {user.role === "admin" && (
        <Link href="/admin" className="hidden h-10 items-center gap-2 rounded-full bg-warning px-4 font-semibold text-brand-950 hover:brightness-105 md:flex">
          <ShieldCheck className="size-4" aria-hidden /> Painel admin
        </Link>
      )}
      <form action={signOutAction}>
        <button aria-label="Sair" className={`${circle} bg-white/10 hover:bg-white/20`}>
          <LogOut className="size-4" aria-hidden />
        </button>
      </form>
      {coupons}
    </div>
  );
}
