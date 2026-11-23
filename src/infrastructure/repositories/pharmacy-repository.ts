import type { SupabaseClient } from "@supabase/supabase-js";
import type { PharmacyRepository } from "@/application/ports";
import { pointEwkt, toNearbyPharmacy, toPharmacy, type PharmacyRow } from "../mappers";
import { unwrap } from "../supabase/errors";

export function createPharmacyRepository(db: SupabaseClient): PharmacyRepository {
  return {
    async nearby(lat, lng, radiusKm) {
      const rows = unwrap(await db.rpc("farmacias_proximas", { origem_lat: lat, origem_lng: lng, raio_km: radiusKm }));
      return (rows as PharmacyRow[]).map(toNearbyPharmacy);
    },
    async list() {
      const rows = unwrap(await db.from("farmacias_view").select("*").order("nome"));
      return (rows as PharmacyRow[]).map(toPharmacy);
    },
    async save(f) {
      const row = { nome: f.name, endereco: f.address, telefone: f.phone, parceira: f.isPartner, localizacao: pointEwkt(f.lat, f.lng) };
      if (f.id) unwrap(await db.from("farmacias").update(row).eq("id", f.id));
      else unwrap(await db.from("farmacias").insert(row));
    },
    async remove(id) {
      unwrap(await db.from("farmacias").delete().eq("id", id));
    },
  };
}
