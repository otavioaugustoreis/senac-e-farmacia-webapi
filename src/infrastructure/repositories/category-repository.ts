import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryRepository } from "@/application/ports";
import { unwrap } from "../supabase/errors";

export function createCategoryRepository(db: SupabaseClient): CategoryRepository {
  return {
    async list() {
      const rows = unwrap(await db.from("categorias").select("id, nome").order("nome")) as { id: number; nome: string }[];
      return rows.map((r) => ({ id: r.id, name: r.nome }));
    },
    async save(c) {
      if (c.id) unwrap(await db.from("categorias").update({ nome: c.name }).eq("id", c.id));
      else unwrap(await db.from("categorias").insert({ nome: c.name }));
    },
    async remove(id) {
      unwrap(await db.from("categorias").delete().eq("id", id));
    },
  };
}
