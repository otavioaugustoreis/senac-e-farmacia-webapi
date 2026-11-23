"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, BadgeCheck, CalendarClock, Eye, EyeOff, Flag, Lock, Mail, MapPin, UserRound } from "lucide-react";
import type { FormState } from "@/app/auth-actions";

interface Props {
  mode: "signIn" | "signUp";
  action: (state: FormState, form: FormData) => Promise<FormState>;
  next: string;
}

const BENEFITS = [
  { icone: BadgeCheck, text: "Bula organizada com link para a fonte oficial da Anvisa" },
  { icone: CalendarClock, text: "Preços por farmácia com data de atualização" },
  { icone: MapPin, text: "Farmácias perto de você no mapa" },
  { icone: Flag, text: "Avise quando um preço estiver errado" },
];

export function FormAuth({ mode, action, next }: Props) {
  const [state, submit, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === "signUp";

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_40px_rgba(17,64,41,0.08)] ring-1 ring-black/5 lg:grid-cols-[1fr_1.1fr]">
      {/* Painel de boas-vindas (computador) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-marca-900 p-10 text-white lg:flex">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/5" aria-hidden />
        <div className="absolute -bottom-20 -left-10 size-72 rounded-full bg-white/5" aria-hidden />
        <div className="relative">
          <p className="text-sm font-semibold text-menta-100">E-Farmácia</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            {isSignUp ? "Crie sua conta grátis em segundos" : "Que bom ver você de novo"}
          </h2>
          <p className="mt-3 text-white/75">Compare preços, consulte a bula e encontre farmácias próximas num só lugar.</p>
        </div>
        <ul className="relative mt-10 space-y-4">
          {BENEFITS.map(({ icone: Icone, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><Icone className="size-4 text-alerta" aria-hidden /></span>
              <span className="pt-1.5 text-sm text-white/90">{text}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Formulário */}
      <div className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
        <h1 className="text-3xl font-bold text-marca-900">{isSignUp ? "Criar conta" : "Entrar"}</h1>
        <p className="mt-2 text-suave">
          {isSignUp ? "É grátis. Pedimos só seu nome e e-mail." : "Acesse para reportar preços e usar o painel."}
        </p>

        <form action={submit} className="mt-8 space-y-5">
          <input type="hidden" name="next" value={next} />
          {isSignUp && (
            <Field id="nome" label="Nome" icone={UserRound}>
              <input id="nome" name="nome" defaultValue={state.name} required autoComplete="name" placeholder="Como podemos te chamar?" className={FIELD_CLASS} />
            </Field>
          )}
          <Field id="email" label="E-mail" icone={Mail}>
            <input id="email" name="email" type="email" defaultValue={state.email} required autoComplete="email" inputMode="email" placeholder="voce@exemplo.com" className={FIELD_CLASS} />
          </Field>
          <Field id="senha" label="Senha" icone={Lock} hint={isSignUp ? "Mínimo de 6 caracteres" : undefined}>
            <input id="senha" name="senha" type={showPassword ? "text" : "password"} required minLength={isSignUp ? 6 : undefined}
              autoComplete={isSignUp ? "new-password" : "current-password"} placeholder="••••••••" className={`${FIELD_CLASS} pr-12`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-suave hover:bg-black/5">
              {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
            </button>
          </Field>

          {state.errorMessage && (
            <p role="alert" className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.errorMessage}
            </p>
          )}

          <button disabled={pending}
            className="h-12 w-full rounded-full bg-marca-800 text-base font-semibold text-white transition hover:bg-marca-700 disabled:opacity-60">
            {pending ? "Aguarde…" : isSignUp ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 text-xs text-suave" aria-hidden>
          <span className="h-px flex-1 bg-black/10" /> ou <span className="h-px flex-1 bg-black/10" />
        </div>
        <p className="mt-6 text-center text-sm text-suave">
          {isSignUp ? "Já tem conta? " : "Ainda não tem conta? "}
          <Link href={`${isSignUp ? "/entrar" : "/cadastro"}?next=${encodeURIComponent(next)}`} className="font-semibold text-marca-700 underline underline-offset-2">
            {isSignUp ? "Entrar" : "Cadastre-se grátis"}
          </Link>
        </p>
      </div>
    </div>
  );
}

const FIELD_CLASS =
  "h-12 w-full rounded-2xl border border-black/10 bg-[#f7f9f8] pl-11 pr-4 text-base outline-none transition placeholder:text-suave/70 focus:border-marca-600 focus:bg-white focus:ring-4 focus:ring-marca-600/10";

function Field({ id, label, icone: Icone, hint, children }: {
  id: string; label: string; icone: typeof Mail; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-tinta">{label}</label>
      <div className="relative">
        <Icone className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-suave" aria-hidden />
        {children}
      </div>
      {hint && <p className="mt-1.5 text-xs text-suave">{hint}</p>}
    </div>
  );
}
