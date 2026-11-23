"use server";

import { redirect } from "next/navigation";
import { cadastrar, entrar, sair } from "@/infrastructure/auth";
import { destinoAposLogin, destinoSeguro } from "@/lib/destino";

/** Devolve o que a pessoa digitou (menos a senha): o React limpa o formulário após o envio. */
export type EstadoForm = { erro?: string; nome?: string; email?: string };

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? "");

export async function entrarAction(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const email = texto(form, "email");
  const r = await entrar(email, texto(form, "senha"));
  if (!r.ok) return { erro: r.erro, email };
  redirect(destinoAposLogin(form.get("next"), r.papel ?? "user"));
}

export async function cadastrarAction(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const [nome, email] = [texto(form, "nome"), texto(form, "email")];
  const r = await cadastrar(nome, email, texto(form, "senha"));
  if (!r.ok) return { erro: r.erro, nome, email };
  redirect(destinoSeguro(form.get("next")));
}

export async function sairAction(): Promise<void> {
  await sair();
  redirect("/");
}
