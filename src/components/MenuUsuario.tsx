import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { obterContainer } from "@/infrastructure/container";
import { sairAction } from "@/app/auth-actions";

export async function MenuUsuario() {
  const usuario = await (await obterContainer()).usuarioAtual();
  if (!usuario) {
    return <Link href="/entrar" className="rounded-full bg-white px-3 py-1.5 font-semibold text-marca-900">Entrar</Link>;
  }
  const primeiroNome = (usuario.nome ?? usuario.email).split(/[\s@]/)[0];
  return (
    <div className="flex items-center gap-1">
      {usuario.role === "admin" && (
        <Link href="/admin" className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20">
          <ShieldCheck className="size-4" aria-hidden /> Admin
        </Link>
      )}
      <span className="hidden px-2 text-white/80 lg:inline">Olá, <strong className="text-white">{primeiroNome}</strong></span>
      <form action={sairAction}>
        <button className="flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-white/10" aria-label="Sair">
          <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">Sair</span>
        </button>
      </form>
    </div>
  );
}
