import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositories } from "@/application/ports";
import { normalizeText } from "@/domain/texto";
import {
  fromPackageInsert, toPackageInsert, toCoupon, toDayString, toPharmacy, toNearbyPharmacy, toMedicine, toPrice,
  toReport, toSearchResult, pointEwkt,
  type PackageInsertRow, type SearchRow, type CouponRow, type PharmacyRow, type MedicineRow, type PriceRow, type ReportRow,
} from "../mapeadores";
import { unwrap } from "../supabase/erros";

const PRICE_SELECT = "id, medicamento_id, valor, atualizado_em, farmacias(id, nome)";

/** Implementa os ports da aplicação sobre o Supabase. A RLS do banco é a segunda barreira de acesso. */
export function createRepositories(db: SupabaseClient): Repositories {
  const search = async (q: string, categoryId?: number) => {
    const rows = unwrap(await db.rpc("buscar_medicamentos", { q, categoria_filtro: categoryId ?? null }));
    return (rows as SearchRow[]).map(toSearchResult);
  };

  return {
    medicines: {
      search,
      async getById(id) {
        const row = unwrap(await db.from("medicamentos").select("*, categorias(id, nome)").eq("id", id).maybeSingle());
        return row ? toMedicine(row as unknown as MedicineRow) : null;
      },
      async listByActiveIngredient(ingredient) {
        const target = normalizeText(ingredient);
        return (await search(ingredient)).filter((m) => normalizeText(m.activeIngredient) === target);
      },
      async save(m) {
        const row = {
          nome_comercial: m.brandName, principio_ativo: m.activeIngredient, categoria_id: m.categoryId,
          tipo: m.type, fabricante: m.manufacturer, apresentacao: m.presentation,
          imagem_url: m.imageUrl?.trim() || null, imagem_credito: m.imageCredit?.trim() || null, imagem_fonte: m.imageSource?.trim() || null,
        };
        if (m.id) {
          unwrap(await db.from("medicamentos").update(row).eq("id", m.id));
          return m.id;
        }
        const created = unwrap(await db.from("medicamentos").insert(row).select("id").single());
        return (created as { id: number }).id;
      },
      async remove(id) {
        unwrap(await db.from("medicamentos").delete().eq("id", id));
      },
    },

    packageInserts: {
      async get(medicineId) {
        const row = unwrap(await db.from("bulas").select("*").eq("medicamento_id", medicineId).maybeSingle());
        return row ? toPackageInsert(row as PackageInsertRow) : null;
      },
      async save(b) {
        unwrap(await db.from("bulas").upsert(fromPackageInsert(b), { onConflict: "medicamento_id" }));
      },
    },

    prices: {
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
    },

    pharmacies: {
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
    },

    coupons: {
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
    },

    categories: {
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
    },

    reports: {
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
    },
  };
}
