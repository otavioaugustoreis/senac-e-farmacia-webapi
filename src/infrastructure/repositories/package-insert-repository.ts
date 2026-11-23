import type { SupabaseClient } from "@supabase/supabase-js";
import type { PackageInsertRepository } from "@/application/ports";
import { fromPackageInsert, toPackageInsert, type PackageInsertRow } from "../mappers";
import { unwrap } from "../supabase/errors";

export function createPackageInsertRepository(db: SupabaseClient): PackageInsertRepository {
  return {
    async get(medicineId) {
      const row = unwrap(await db.from("bulas").select("*").eq("medicamento_id", medicineId).maybeSingle());
      return row ? toPackageInsert(row as PackageInsertRow) : null;
    },
    async save(b) {
      unwrap(await db.from("bulas").upsert(fromPackageInsert(b), { onConflict: "medicamento_id" }));
    },
  };
}
