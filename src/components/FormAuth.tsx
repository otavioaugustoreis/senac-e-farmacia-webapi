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
  { icon: BadgeCheck, text: "Bula organizada com link para a fonte oficial da Anvisa" },
  { icon: CalendarClock, text: "Preços por farmácia com data de atualização" },
  { icon: MapPin, text: "Farmácias perto de você no mapa" },
  { icon: Flag, text: "Avise quando um preço estiver errado" },
];

export function FormAuth({ mode, action, next }: Props) {
  const [state, submit, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === "signUp";

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_40px_rgba(17,64,41,0.08)] ring-1 ring-black/5 lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-10 text-white lg:flex">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/5" aria-hidden />
        <div className="absolute -bottom-20 -left-10 size-72 rounded-full bg-white/5" aria-hidden />
        <div className="relative">
          <p className="text-sm font-semibold text-mint-100">E-Farmácia</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            {isSignUp ? "Crie sua conta grátis em segundos" : "Que bom ver você de novo"}
          </h2>
          <p className="mt-3 text-white/75">Compare preços, consulte a bula e encontre farmácias próximas num só lugar.</p>
        </div>
        <ul className="relative mt-10 space-y-4">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><Icon className="size-4 text-warning" aria-hidden /></span>
              <span className="pt-1.5 text-sm text-white/90">{text}</span>
            </li>
          ))}
        </ul>
      </aside>

      <div className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
        <h1 className="text-3xl font-bold text-brand-900">{isSignUp ? "Criar conta" : "Entrar"}</h1>
        <p className="mt-2 text-muted">
          {isSignUp ? "É grátis. Pedimos só seu nome e e-mail." : "Acesse para reportar preços e usar o painel."}
        </p>

        <form action={submit} className="mt-8 space-y-5">
          <input type="hidden" name="next" value={next} />
          {isSignUp && (
            <Field id="name" label="Nome" icon={UserRound}>
              <input id="name" name="name" defaultValue={state.name} required autoComplete="name" placeholder="Como podemos te chamar?" className={FIELD_CLASS} />
            </Field>
          )}
          <Field id="email" label="E-mail" icon={Mail}>
            <input id="email" name="email" type="email" defaultValue={state.email} required autoComplete="email" inputMode="email" placeholder="voce@exemplo.com" className={FIELD_CLASS} />
          </Field>
          <Field id="password" label="Senha" icon={Lock} hint={isSignUp ? "Mínimo de 6 caracteres" : undefined}>
            <input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={isSignUp ? 6 : undefined}
              autoComplete={isSignUp ? "new-password" : "current-password"} placeholder="••••••••" className={`${FIELD_CLASS} pr-12`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-black/5">
              {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
            </button>
          </Field>

          {state.errorMessage && (
            <p role="alert" className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.errorMessage}
            </p>
          )}

          <button disabled={pending}
            className="h-12 w-full rounded-full bg-brand-800 text-base font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {pending ? "Aguarde…" : isSignUp ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 text-xs text-muted" aria-hidden>
          <span className="h-px flex-1 bg-black/10" /> ou <span className="h-px flex-1 bg-black/10" />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          {isSignUp ? "Já tem conta? " : "Ainda não tem conta? "}
          <Link href={`${isSignUp ? "/entrar" : "/cadastro"}?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-700 underline underline-offset-2">
            {isSignUp ? "Entrar" : "Cadastre-se grátis"}
          </Link>
        </p>
      </div>
    </div>
  );
}

const FIELD_CLASS =
  "h-12 w-full rounded-2xl border border-black/10 bg-[#f7f9f8] pl-11 pr-4 text-base outline-none transition placeholder:text-muted/70 focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-600/10";

function Field({ id, label, icon: Icon, hint, children }: {
  id: string; label: string; icon: typeof Mail; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
        {children}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
