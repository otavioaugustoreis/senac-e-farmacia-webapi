import type { SupabaseClient } from "@supabase/supabase-js";
import type { MedicineRepository } from "@/application/ports";
import { normalizeText } from "@/domain/text";
import { toMedicine, toSearchResult, type MedicineRow, type SearchRow } from "../mappers";
import { unwrap } from "../supabase/errors";

export function createMedicineRepository(db: SupabaseClient): MedicineRepository {
  const search = async (q: string, categoryId?: number) => {
    const rows = unwrap(await db.rpc("buscar_medicamentos", { q, categoria_filtro: categoryId ?? null }));
    return (rows as SearchRow[]).map(toSearchResult);
  };

  return {
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
  };
}
