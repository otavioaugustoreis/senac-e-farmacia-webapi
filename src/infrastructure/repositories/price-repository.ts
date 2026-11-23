import type { SupabaseClient } from "@supabase/supabase-js";
import type { PriceRepository } from "@/application/ports";
import { toPrice, type PriceRow } from "../mappers";
import { unwrap } from "../supabase/errors";

const PRICE_SELECT = "id, medicamento_id, valor, atualizado_em, farmacias(id, nome)";

export function createPriceRepository(db: SupabaseClient): PriceRepository {
  return {
    async listByMedicine(medicineId) {
      const rows = unwrap(await db.from("precos").select(PRICE_SELECT).eq("medicamento_id", medicineId));
      return (rows as unknown as PriceRow[]).map(toPrice);
    },
    async listAll() {
      const rows = unwrap(
        await db.from("precos").select(`${PRICE_SELECT}, medicamentos(nome_comercial)`).order("atualizado_em", { ascending: false }),
      );
      return (rows as unknown as PriceRow[]).map((l) => ({ ...toPrice(l), medicine: l.medicamentos?.nome_comercial ?? "" }));
    },
    async save(p) {
      const row = { medicamento_id: p.medicineId, farmacia_id: p.pharmacyId, valor: p.amount };
      if (p.id) unwrap(await db.from("precos").update(row).eq("id", p.id));
      else unwrap(await db.from("precos").upsert(row, { onConflict: "medicamento_id,farmacia_id" }));
    },
    async remove(id) {
      unwrap(await db.from("precos").delete().eq("id", id));
    },
  };
}
