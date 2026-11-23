import type { SupabaseClient } from "@supabase/supabase-js";
import type { CouponRepository } from "@/application/ports";
import { toCoupon, toDayString, type CouponRow } from "../mappers";
import { unwrap } from "../supabase/errors";

export function createCouponRepository(db: SupabaseClient): CouponRepository {
  return {
    async list() {
      const rows = unwrap(await db.from("cupons").select("*, farmacias(id, nome, endereco)").order("validade"));
      return (rows as unknown as CouponRow[]).map(toCoupon);
    },
    async save(c) {
      const row = { farmacia_id: c.pharmacyId, codigo: c.code, descricao: c.description, desconto: c.discount, validade: toDayString(c.validUntil) };
      if (c.id) unwrap(await db.from("cupons").update(row).eq("id", c.id));
      else unwrap(await db.from("cupons").insert(row));
    },
    async remove(id) {
      unwrap(await db.from("cupons").delete().eq("id", id));
    },
  };
}
