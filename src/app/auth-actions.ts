"use server";

import { redirect } from "next/navigation";
import { getAuthService } from "@/infrastructure/container";
import { destinationAfterLogin, safeDestination } from "@/lib/destination";

export type FormState = { errorMessage?: string; name?: string; email?: string };

const text = (form: FormData, field: string) => String(form.get(field) ?? "");

export async function signInAction(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  const r = await (await getAuthService()).signIn(email, text(form, "password"));
  if (!r.ok) return { errorMessage: r.errorMessage, email };
  redirect(destinationAfterLogin(form.get("next"), r.role ?? "user"));
}

export async function signUpAction(_: FormState, form: FormData): Promise<FormState> {
  const [name, email] = [text(form, "name"), text(form, "email")];
  const r = await (await getAuthService()).signUp(name, email, text(form, "password"));
  if (!r.ok) return { errorMessage: r.errorMessage, name, email };
  redirect(safeDestination(form.get("next")));
}

export async function signOutAction(): Promise<void> {
  await (await getAuthService()).signOut();
  redirect("/");
}
