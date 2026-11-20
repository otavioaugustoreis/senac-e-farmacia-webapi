import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { obterContainer } from "@/infrastructure/container";
import { AbasAdmin } from "@/components/admin/AbasAdmin";

export const metadata: Metadata = { title: "Painel administrativo — E-Farmácia" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await (await obterContainer()).usuarioAtual();
  if (!usuario) redirect("/entrar?next=/admin");

  if (usuario.role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-[var(--radius-card)] bg-white p-10 text-center ring-1 ring-black/5">
        <ShieldAlert className="mx-auto size-10 text-alerta" aria-hidden />
        <h1 className="mt-3 text-xl font-semibold">Acesso restrito</h1>
        <p className="mt-1 text-sm text-suave">O painel é exclusivo para administradores.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-marca-800 px-5 py-2 font-semibold text-white">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-suave">Painel administrativo</p>
        <div className="mt-2"><AbasAdmin /></div>
      </div>
      {children}
    </div>
  );
}
