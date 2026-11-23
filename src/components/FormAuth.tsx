"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, BadgeCheck, CalendarClock, Eye, EyeOff, Flag, Lock, Mail, MapPin, UserRound } from "lucide-react";
import type { EstadoForm } from "@/app/auth-actions";

interface Props {
  modo: "entrar" | "cadastro";
  acao: (estado: EstadoForm, form: FormData) => Promise<EstadoForm>;
  next: string;
}

const BENEFICIOS = [
  { icone: BadgeCheck, texto: "Bula organizada com link para a fonte oficial da Anvisa" },
  { icone: CalendarClock, texto: "Preços por farmácia com data de atualização" },
  { icone: MapPin, texto: "Farmácias perto de você no mapa" },
  { icone: Flag, texto: "Avise quando um preço estiver errado" },
];

export function FormAuth({ modo, acao, next }: Props) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  const [verSenha, setVerSenha] = useState(false);
  const cadastro = modo === "cadastro";

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_40px_rgba(17,64,41,0.08)] ring-1 ring-black/5 lg:grid-cols-[1fr_1.1fr]">
      {/* Painel de boas-vindas (computador) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-marca-900 p-10 text-white lg:flex">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/5" aria-hidden />
        <div className="absolute -bottom-20 -left-10 size-72 rounded-full bg-white/5" aria-hidden />
        <div className="relative">
          <p className="text-sm font-semibold text-menta-100">E-Farmácia</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            {cadastro ? "Crie sua conta grátis em segundos" : "Que bom ver você de novo"}
          </h2>
          <p className="mt-3 text-white/75">Compare preços, consulte a bula e encontre farmácias próximas num só lugar.</p>
        </div>
        <ul className="relative mt-10 space-y-4">
          {BENEFICIOS.map(({ icone: Icone, texto }) => (
            <li key={texto} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><Icone className="size-4 text-alerta" aria-hidden /></span>
              <span className="pt-1.5 text-sm text-white/90">{texto}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Formulário */}
      <div className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
        <h1 className="text-3xl font-bold text-marca-900">{cadastro ? "Criar conta" : "Entrar"}</h1>
        <p className="mt-2 text-suave">
          {cadastro ? "É grátis. Pedimos só seu nome e e-mail." : "Acesse para reportar preços e usar o painel."}
        </p>

        <form action={enviar} className="mt-8 space-y-5">
          <input type="hidden" name="next" value={next} />
          {cadastro && (
            <Campo id="nome" rotulo="Nome" icone={UserRound}>
              <input id="nome" name="nome" defaultValue={estado.nome} required autoComplete="name" placeholder="Como podemos te chamar?" className={CAMPO} />
            </Campo>
          )}
          <Campo id="email" rotulo="E-mail" icone={Mail}>
            <input id="email" name="email" type="email" defaultValue={estado.email} required autoComplete="email" inputMode="email" placeholder="voce@exemplo.com" className={CAMPO} />
          </Campo>
          <Campo id="senha" rotulo="Senha" icone={Lock} ajuda={cadastro ? "Mínimo de 6 caracteres" : undefined}>
            <input id="senha" name="senha" type={verSenha ? "text" : "password"} required minLength={cadastro ? 6 : undefined}
              autoComplete={cadastro ? "new-password" : "current-password"} placeholder="••••••••" className={`${CAMPO} pr-12`} />
            <button type="button" onClick={() => setVerSenha((v) => !v)} aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-suave hover:bg-black/5">
              {verSenha ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
            </button>
          </Campo>

          {estado.erro && (
            <p role="alert" className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" aria-hidden /> {estado.erro}
            </p>
          )}

          <button disabled={pendente}
            className="h-12 w-full rounded-full bg-marca-800 text-base font-semibold text-white transition hover:bg-marca-700 disabled:opacity-60">
            {pendente ? "Aguarde…" : cadastro ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 text-xs text-suave" aria-hidden>
          <span className="h-px flex-1 bg-black/10" /> ou <span className="h-px flex-1 bg-black/10" />
        </div>
        <p className="mt-6 text-center text-sm text-suave">
          {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
          <Link href={`${cadastro ? "/entrar" : "/cadastro"}?next=${encodeURIComponent(next)}`} className="font-semibold text-marca-700 underline underline-offset-2">
            {cadastro ? "Entrar" : "Cadastre-se grátis"}
          </Link>
        </p>
      </div>
    </div>
  );
}

const CAMPO =
  "h-12 w-full rounded-2xl border border-black/10 bg-[#f7f9f8] pl-11 pr-4 text-base outline-none transition placeholder:text-suave/70 focus:border-marca-600 focus:bg-white focus:ring-4 focus:ring-marca-600/10";

function Campo({ id, rotulo, icone: Icone, ajuda, children }: {
  id: string; rotulo: string; icone: typeof Mail; ajuda?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-tinta">{rotulo}</label>
      <div className="relative">
        <Icone className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-suave" aria-hidden />
        {children}
      </div>
      {ajuda && <p className="mt-1.5 text-xs text-suave">{ajuda}</p>}
    </div>
  );
}
