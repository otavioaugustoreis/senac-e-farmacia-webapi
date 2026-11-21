import { criarClienteServidor } from "./supabase/server";

export type ResultadoAuth = { ok: true } | { ok: false; erro: string };

const SENHA_MINIMA = 6;

function traduzir(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos";
  if (m.includes("already registered") || m.includes("already been registered")) return "Este e-mail já está cadastrado";
  if (m.includes("password")) return `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres`;
  if (m.includes("email")) return "Informe um e-mail válido";
  return "Não foi possível concluir. Tente novamente.";
}

export async function entrar(email: string, senha: string): Promise<ResultadoAuth & { papel?: "user" | "admin" }> {
  if (!email.trim() || !senha) return { ok: false, erro: "Informe e-mail e senha" };
  const db = await criarClienteServidor();
  const { data, error } = await db.auth.signInWithPassword({ email: email.trim(), password: senha });
  if (error) return { ok: false, erro: traduzir(error.message) };
  const { data: perfil } = await db.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  return { ok: true, papel: perfil?.role === "admin" ? "admin" : "user" };
}

export async function cadastrar(nome: string, email: string, senha: string): Promise<ResultadoAuth> {
  if (!nome.trim()) return { ok: false, erro: "Informe seu nome" };
  if (!email.trim()) return { ok: false, erro: "Informe um e-mail válido" };
  if (senha.length < SENHA_MINIMA) return { ok: false, erro: `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres` };
  const db = await criarClienteServidor();
  const { data, error } = await db.auth.signUp({ email: email.trim(), password: senha, options: { data: { nome: nome.trim() } } });
  if (error) return { ok: false, erro: traduzir(error.message) };
  // Com e-mail já cadastrado o Supabase devolve usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) return { ok: false, erro: "Este e-mail já está cadastrado" };
  return { ok: true };
}

export async function sair(): Promise<void> {
  const db = await criarClienteServidor();
  await db.auth.signOut();
}
