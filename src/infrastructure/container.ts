import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositories } from "@/application/ports";
import type { CurrentUser } from "@/domain/user";
import { createRepositories } from "./repositories/index";
import { createServerSupabase } from "./supabase/server";

export interface Container {
  repos: Repositories;
  currentUser: () => Promise<CurrentUser | null>;
}

type Factory = () => Promise<Container>;
let testFactory: Factory | null = null;

export function setContainerForTests(factory: Factory | null): void {
  testFactory = factory;
}

export async function readCurrentUser(db: SupabaseClient): Promise<CurrentUser | null> {
  const { data } = await db.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await db.from("profiles").select("nome, role").eq("id", data.user.id).maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: (profile?.nome as string | null) ?? null,
    role: profile?.role === "admin" ? "admin" : "user",
  };
}

export async function getContainer(): Promise<Container> {
  if (testFactory) return testFactory();
  const db = await createServerSupabase();
  return { repos: createRepositories(db), currentUser: () => readCurrentUser(db) };
}
