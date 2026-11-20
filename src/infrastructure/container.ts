import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositorios } from "@/application/ports";
import type { UsuarioAtual } from "@/domain/usuario";
import { criarRepositorios } from "./repositorios";
import { criarClienteServidor } from "./supabase/server";

export interface Container {
  repos: Repositorios;
  usuarioAtual: () => Promise<UsuarioAtual | null>;
}

type Fabrica = () => Promise<Container>;
let fabricaDeTeste: Fabrica | null = null;

/** Troca a composição por uma de teste (repositórios em memória). `null` restaura a real. */
export function definirContainerParaTestes(fabrica: Fabrica | null): void {
  fabricaDeTeste = fabrica;
}

export async function lerUsuarioAtual(db: SupabaseClient): Promise<UsuarioAtual | null> {
  const { data } = await db.auth.getUser();
  if (!data.user) return null;
  const { data: perfil } = await db.from("profiles").select("nome, role").eq("id", data.user.id).maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    nome: (perfil?.nome as string | null) ?? null,
    role: perfil?.role === "admin" ? "admin" : "user",
  };
}

/** Composição: liga os casos de uso aos repositórios Supabase com a sessão do usuário. */
export async function obterContainer(): Promise<Container> {
  if (fabricaDeTeste) return fabricaDeTeste();
  const db = await criarClienteServidor();
  return { repos: criarRepositorios(db), usuarioAtual: () => lerUsuarioAtual(db) };
}
