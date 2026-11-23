"use server";

import { redirect } from "next/navigation";
import { signUp, signIn, signOut } from "@/infrastructure/auth";
import { destinationAfterLogin, safeDestination } from "@/lib/destino";

/** Devolve o que a pessoa digitou (menos a senha): o React limpa o formulário após o envio. */
export type FormState = { errorMessage?: string; name?: string; email?: string };

const text = (form: FormData, field: string) => String(form.get(field) ?? "");

export async function signInAction(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  const r = await signIn(email, text(form, "senha"));
  if (!r.ok) return { errorMessage: r.errorMessage, email };
  redirect(destinationAfterLogin(form.get("next"), r.role ?? "user"));
}

export async function signUpAction(_: FormState, form: FormData): Promise<FormState> {
  const [name, email] = [text(form, "nome"), text(form, "email")];
  const r = await signUp(name, email, text(form, "senha"));
  if (!r.ok) return { errorMessage: r.errorMessage, name, email };
  redirect(safeDestination(form.get("next")));
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/");
}
