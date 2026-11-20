"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoForm } from "@/app/auth-actions";

interface Props {
  modo: "entrar" | "cadastro";
  acao: (estado: EstadoForm, form: FormData) => Promise<EstadoForm>;
  next: string;
}

const campo = "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-600/20";

export function FormAuth({ modo, acao, next }: Props) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  const cadastro = modo === "cadastro";

  return (
    <div className="mx-auto max-w-md rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      <h1 className="text-2xl font-bold text-marca-900">{cadastro ? "Criar conta" : "Entrar"}</h1>
      <p className="mt-1 text-sm text-suave">
        {cadastro ? "Grátis. Usamos só seu nome e e-mail." : "Acesse para reportar preços e usar o painel."}
      </p>
      <form action={enviar} className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        {cadastro && (
          <label className="block text-sm font-medium">
            Nome
            <input name="nome" required autoComplete="name" className={`${campo} mt-1`} />
          </label>
        )}
        <label className="block text-sm font-medium">
          E-mail
          <input name="email" type="email" required autoComplete="email" className={`${campo} mt-1`} />
        </label>
        <label className="block text-sm font-medium">
          Senha
          <input name="senha" type="password" required minLength={cadastro ? 6 : undefined}
            autoComplete={cadastro ? "new-password" : "current-password"} className={`${campo} mt-1`} />
        </label>
        {estado.erro && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>}
        <button disabled={pendente} className="w-full rounded-full bg-marca-800 px-4 py-2.5 font-semibold text-white hover:bg-marca-700 disabled:opacity-60">
          {pendente ? "Aguarde…" : cadastro ? "Criar conta" : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-suave">
        {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
        <Link href={`${cadastro ? "/entrar" : "/cadastro"}?next=${encodeURIComponent(next)}`} className="font-semibold text-marca-700 underline">
          {cadastro ? "Entrar" : "Cadastre-se"}
        </Link>
      </p>
    </div>
  );
}
