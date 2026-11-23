import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportRepository } from "@/application/ports";
import { toReport, type ReportRow } from "../mappers";
import { unwrap } from "../supabase/errors";

export function createReportRepository(db: SupabaseClient): ReportRepository {
  return {
    async create(r) {
      unwrap(await db.from("reportes_preco").insert({ preco_id: r.priceId, user_id: r.userId, comentario: r.comment }));
    },
    async list() {
      const rows = unwrap(await db.from("reportes_view").select("*").order("criado_em", { ascending: false }));
      return (rows as ReportRow[]).map(toReport);
    },
    async markResolved(id) {
      unwrap(await db.from("reportes_preco").update({ resolvido: true }).eq("id", id));
    },
  };
}
