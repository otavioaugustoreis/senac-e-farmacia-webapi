import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositorios } from "@/application/ports";
import { normalizarTexto } from "@/domain/texto";
import {
  deBula, paraBula, paraCupom, paraDia, paraFarmacia, paraFarmaciaProxima, paraMedicamento, paraPreco,
  paraReporte, paraResultadoBusca, pontoEwkt,
  type LinhaBula, type LinhaBusca, type LinhaCupom, type LinhaFarmacia, type LinhaMedicamento, type LinhaPreco, type LinhaReporte,
} from "../mapeadores";
import { verificar } from "../supabase/erros";

const SELECT_PRECO = "id, medicamento_id, valor, atualizado_em, farmacias(id, nome)";

/** Implementa os ports da aplicação sobre o Supabase. A RLS do banco é a segunda barreira de acesso. */
export function criarRepositorios(db: SupabaseClient): Repositorios {
  const buscar = async (q: string, categoriaId?: number) => {
    const linhas = verificar(await db.rpc("buscar_medicamentos", { q, categoria_filtro: categoriaId ?? null }));
    return (linhas as LinhaBusca[]).map(paraResultadoBusca);
  };

  return {
    medicamentos: {
      buscar,
      async obterPorId(id) {
        const linha = verificar(await db.from("medicamentos").select("*, categorias(id, nome)").eq("id", id).maybeSingle());
        return linha ? paraMedicamento(linha as unknown as LinhaMedicamento) : null;
      },
      async listarPorPrincipioAtivo(principio) {
        const alvo = normalizarTexto(principio);
        return (await buscar(principio)).filter((m) => normalizarTexto(m.principioAtivo) === alvo);
      },
      async salvar(m) {
        const linha = {
          nome_comercial: m.nomeComercial, principio_ativo: m.principioAtivo, categoria_id: m.categoriaId,
          tipo: m.tipo, fabricante: m.fabricante, apresentacao: m.apresentacao,
          imagem_url: m.imagemUrl?.trim() || null, imagem_credito: m.imagemCredito?.trim() || null, imagem_fonte: m.imagemFonte?.trim() || null,
        };
        if (m.id) {
          verificar(await db.from("medicamentos").update(linha).eq("id", m.id));
          return m.id;
        }
        const criado = verificar(await db.from("medicamentos").insert(linha).select("id").single());
        return (criado as { id: number }).id;
      },
      async excluir(id) {
        verificar(await db.from("medicamentos").delete().eq("id", id));
      },
    },

    bulas: {
      async obter(medicamentoId) {
        const linha = verificar(await db.from("bulas").select("*").eq("medicamento_id", medicamentoId).maybeSingle());
        return linha ? paraBula(linha as LinhaBula) : null;
      },
      async salvar(b) {
        verificar(await db.from("bulas").upsert(deBula(b), { onConflict: "medicamento_id" }));
      },
    },

    precos: {
      async listarPorMedicamento(medicamentoId) {
        const linhas = verificar(await db.from("precos").select(SELECT_PRECO).eq("medicamento_id", medicamentoId));
        return (linhas as unknown as LinhaPreco[]).map(paraPreco);
      },
      async listarTodos() {
        const linhas = verificar(
          await db.from("precos").select(`${SELECT_PRECO}, medicamentos(nome_comercial)`).order("atualizado_em", { ascending: false }),
        );
        return (linhas as unknown as LinhaPreco[]).map((l) => ({ ...paraPreco(l), medicamento: l.medicamentos?.nome_comercial ?? "" }));
      },
      async salvar(p) {
        const linha = { medicamento_id: p.medicamentoId, farmacia_id: p.farmaciaId, valor: p.valor };
        if (p.id) verificar(await db.from("precos").update(linha).eq("id", p.id));
        else verificar(await db.from("precos").upsert(linha, { onConflict: "medicamento_id,farmacia_id" }));
      },
      async excluir(id) {
        verificar(await db.from("precos").delete().eq("id", id));
      },
    },

    farmacias: {
      async proximas(lat, lng, raioKm) {
        const linhas = verificar(await db.rpc("farmacias_proximas", { origem_lat: lat, origem_lng: lng, raio_km: raioKm }));
        return (linhas as LinhaFarmacia[]).map(paraFarmaciaProxima);
      },
      async listar() {
        const linhas = verificar(await db.from("farmacias_view").select("*").order("nome"));
        return (linhas as LinhaFarmacia[]).map(paraFarmacia);
      },
      async salvar(f) {
        const linha = { nome: f.nome, endereco: f.endereco, telefone: f.telefone, parceira: f.parceira, localizacao: pontoEwkt(f.lat, f.lng) };
        if (f.id) verificar(await db.from("farmacias").update(linha).eq("id", f.id));
        else verificar(await db.from("farmacias").insert(linha));
      },
      async excluir(id) {
        verificar(await db.from("farmacias").delete().eq("id", id));
      },
    },

    cupons: {
      async listar() {
        const linhas = verificar(await db.from("cupons").select("*, farmacias(id, nome)").order("validade"));
        return (linhas as unknown as LinhaCupom[]).map(paraCupom);
      },
      async salvar(c) {
        const linha = { farmacia_id: c.farmaciaId, codigo: c.codigo, descricao: c.descricao, desconto: c.desconto, validade: paraDia(c.validade) };
        if (c.id) verificar(await db.from("cupons").update(linha).eq("id", c.id));
        else verificar(await db.from("cupons").insert(linha));
      },
      async excluir(id) {
        verificar(await db.from("cupons").delete().eq("id", id));
      },
    },

    categorias: {
      async listar() {
        return verificar(await db.from("categorias").select("id, nome").order("nome")) as { id: number; nome: string }[];
      },
      async salvar(c) {
        if (c.id) verificar(await db.from("categorias").update({ nome: c.nome }).eq("id", c.id));
        else verificar(await db.from("categorias").insert({ nome: c.nome }));
      },
      async excluir(id) {
        verificar(await db.from("categorias").delete().eq("id", id));
      },
    },

    reportes: {
      async criar(r) {
        verificar(await db.from("reportes_preco").insert({ preco_id: r.precoId, user_id: r.userId, comentario: r.comentario }));
      },
      async listar() {
        const linhas = verificar(await db.from("reportes_view").select("*").order("criado_em", { ascending: false }));
        return (linhas as LinhaReporte[]).map(paraReporte);
      },
      async resolver(id) {
        verificar(await db.from("reportes_preco").update({ resolvido: true }).eq("id", id));
      },
    },
  };
}
