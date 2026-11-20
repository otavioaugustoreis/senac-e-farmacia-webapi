"use server";

import { redirect } from "next/navigation";
import { cadastrar, entrar, sair } from "@/infrastructure/auth";
import { destinoSeguro } from "@/lib/destino";

export type EstadoForm = { erro?: string };

export async function entrarAction(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const r = await entrar(String(form.get("email") ?? ""), String(form.get("senha") ?? ""));
  if (!r.ok) return { erro: r.erro };
  redirect(destinoSeguro(form.get("next")));
}

export async function cadastrarAction(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const r = await cadastrar(String(form.get("nome") ?? ""), String(form.get("email") ?? ""), String(form.get("senha") ?? ""));
  if (!r.ok) return { erro: r.erro };
  redirect(destinoSeguro(form.get("next")));
}

export async function sairAction(): Promise<void> {
  await sair();
  redirect("/");
}
