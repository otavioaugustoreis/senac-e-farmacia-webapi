import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthService } from "@/application/ports";

const MIN_PASSWORD_LENGTH = 6;

function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos";
  if (m.includes("already registered") || m.includes("already been registered")) return "Este e-mail já está cadastrado";
  if (m.includes("password")) return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`;
  if (m.includes("email")) return "Informe um e-mail válido";
  return "Não foi possível concluir. Tente novamente.";
}

export function createAuthService(db: SupabaseClient): AuthService {
  return {
    async signIn(email, password) {
      if (!email.trim() || !password) return { ok: false, errorMessage: "Informe e-mail e senha" };
      const { data, error } = await db.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { ok: false, errorMessage: translate(error.message) };
      const { data: profile } = await db.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      return { ok: true, role: profile?.role === "admin" ? "admin" : "user" };
    },

    async signUp(name, email, password) {
      if (!name.trim()) return { ok: false, errorMessage: "Informe seu nome" };
      if (!email.trim()) return { ok: false, errorMessage: "Informe um e-mail válido" };
      if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, errorMessage: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` };
      const { data, error } = await db.auth.signUp({ email: email.trim(), password, options: { data: { nome: name.trim() } } });
      if (error) return { ok: false, errorMessage: translate(error.message) };
      if (data.user && data.user.identities?.length === 0) return { ok: false, errorMessage: "Este e-mail já está cadastrado" };
      return { ok: true };
    },

    async signOut() {
      await db.auth.signOut();
    },
  };
}
