import { createServerSupabase } from "./supabase/server";

export type AuthResult = { ok: true } | { ok: false; errorMessage: string };

const MIN_PASSWORD_LENGTH = 6;

function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos";
  if (m.includes("already registered") || m.includes("already been registered")) return "Este e-mail já está cadastrado";
  if (m.includes("password")) return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`;
  if (m.includes("email")) return "Informe um e-mail válido";
  return "Não foi possível concluir. Tente novamente.";
}

export async function signIn(email: string, password: string): Promise<AuthResult & { role?: "user" | "admin" }> {
  if (!email.trim() || !password) return { ok: false, errorMessage: "Informe e-mail e senha" };
  const db = await createServerSupabase();
  const { data, error } = await db.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false, errorMessage: translate(error.message) };
  const { data: profile } = await db.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  return { ok: true, role: profile?.role === "admin" ? "admin" : "user" };
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  if (!name.trim()) return { ok: false, errorMessage: "Informe seu nome" };
  if (!email.trim()) return { ok: false, errorMessage: "Informe um e-mail válido" };
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, errorMessage: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` };
  const db = await createServerSupabase();
  const { data, error } = await db.auth.signUp({ email: email.trim(), password, options: { data: { nome: name.trim() } } });
  if (error) return { ok: false, errorMessage: translate(error.message) };
  // Com e-mail já cadastrado o Supabase devolve usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) return { ok: false, errorMessage: "Este e-mail já está cadastrado" };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const db = await createServerSupabase();
  await db.auth.signOut();
}
