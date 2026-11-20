"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { CONFIG, rotuloOpcao, type Campo, type Entidade, type Fonte, type Valores } from "./entidades";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = any;

const campoCss = "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-600/20";

async function pedir(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  if (r.status === 204) return null;
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo.erro ?? "Não foi possível concluir");
  return corpo;
}

export function GerenciadorEntidade({ entidade }: { entidade: Entidade }) {
  const cfg = CONFIG[entidade];
  const [itens, setItens] = useState<Item[] | null>(null);
  const [opcoes, setOpcoes] = useState<Partial<Record<Fonte, Item[]>>>({});
  const [valores, setValores] = useState<Valores | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [filtro, setFiltro] = useState("");

  const carregar = useCallback(async () => {
    try {
      setItens(await pedir(`/api/admin/${entidade}`));
    } catch (e) {
      setErro((e as Error).message);
    }
  }, [entidade]);

  useEffect(() => {
    let ativo = true;
    pedir(`/api/admin/${entidade}`)
      .then((lista) => ativo && setItens(lista))
      .catch((e: Error) => ativo && setErro(e.message));
    const fontes = [...new Set(cfg.campos.map((c) => c.fonte).filter(Boolean))] as Fonte[];
    for (const f of fontes) {
      pedir(`/api/admin/${f}`)
        .catch(() => [])
        .then((lista) => ativo && setOpcoes((o) => ({ ...o, [f]: lista })));
    }
    return () => { ativo = false; };
  }, [entidade, cfg.campos]);

  const visiveis = useMemo(() => {
    const t = filtro.trim().toLowerCase();
    return (itens ?? []).filter((i) => !t || cfg.textoBusca(i).toLowerCase().includes(t));
  }, [itens, filtro, cfg]);

  async function abrir(item?: Item) {
    setErro(null);
    setAviso(null);
    const base = item ? cfg.paraFormulario(item) : cfg.paraFormulario({});
    if (item && cfg.carregaBula) {
      const { bula } = (await pedir(`/api/admin/${entidade}/${item.id}`).catch(() => ({ bula: null }))) ?? {};
      for (const k of ["paraQueServe", "contraindicacoes", "efeitosColaterais", "advertencias", "linkAnvisa"]) {
        base[`bula.${k}`] = bula?.[k] ?? "";
      }
    }
    setValores(base);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!valores) return;
    setSalvando(true);
    setErro(null);
    try {
      await pedir(`/api/admin/${entidade}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg.paraCorpo(valores)),
      });
      setValores(null);
      setAviso(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} salvo.`);
      await carregar();
    } catch (e2) {
      setErro((e2 as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(item: Item) {
    if (!confirm(`Excluir este ${cfg.singular}? Esta ação não pode ser desfeita.`)) return;
    try {
      await pedir(`/api/admin/${entidade}/${item.id}`, { method: "DELETE" });
      setAviso(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} excluído.`);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function resolver(item: Item) {
    try {
      await pedir(`/api/admin/${entidade}/${item.id}`, { method: "PATCH" });
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const editavel = cfg.campos.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-marca-900">{cfg.titulo}</h1>
        <div className="flex gap-2">
          <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Filtrar…" aria-label="Filtrar" className={`${campoCss} w-48`} />
          {editavel && (
            <button onClick={() => abrir()} className="flex items-center gap-1 rounded-full bg-marca-800 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700">
              <Plus className="size-4" aria-hidden /> Novo
            </button>
          )}
        </div>
      </div>

      {aviso && <p role="status" className="mt-3 rounded-xl bg-menta-100 px-3 py-2 text-sm text-marca-800">{aviso}</p>}
      {erro && !valores && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      {valores && (
        <form onSubmit={salvar} className="mt-4 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{valores.id ? `Editar ${cfg.singular}` : `Novo ${cfg.singular}`}</h2>
            <button type="button" onClick={() => setValores(null)} aria-label="Fechar" className="rounded-full p-1 hover:bg-black/5"><X className="size-5" /></button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {cfg.campos.map((c, i) => (
              <CampoFormulario
                key={c.nome}
                campo={c}
                titulo={c.grupo && cfg.campos[i - 1]?.grupo !== c.grupo ? c.grupo : undefined}
                valor={valores[c.nome]}
                opcoes={c.fonte ? opcoes[c.fonte] : undefined}
                mudar={(v) => setValores((atual) => ({ ...(atual ?? {}), [c.nome]: v }))}
              />
            ))}
          </div>
          {erro && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
          <div className="mt-4 flex gap-2">
            <button disabled={salvando} className="rounded-full bg-marca-800 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {salvando ? "Salvando…" : "Salvar"}
            </button>
            <button type="button" onClick={() => setValores(null)} className="rounded-full px-4 py-2 text-sm text-suave hover:bg-black/5">Cancelar</button>
          </div>
        </form>
      )}

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] bg-white ring-1 ring-black/5">
        {itens === null ? (
          <p className="p-6 text-sm text-suave">Carregando…</p>
        ) : visiveis.length === 0 ? (
          <p className="p-6 text-sm text-suave">Nenhum registro.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-menta-50 text-xs uppercase tracking-wide text-suave">
              <tr>
                {cfg.colunas.map((c) => <th key={c.rotulo} className="px-4 py-3 font-semibold">{c.rotulo}</th>)}
                <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {visiveis.map((item) => (
                <tr key={item.id} className={item.resolvido ? "text-suave" : ""}>
                  {cfg.colunas.map((c) => <td key={c.rotulo} className="px-4 py-2.5">{c.valor(item)}</td>)}
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    {entidade === "reportes" ? (
                      !item.resolvido && (
                        <button onClick={() => resolver(item)} className="inline-flex items-center gap-1 rounded-full bg-menta-100 px-3 py-1 text-xs font-semibold text-marca-800">
                          <CheckCircle2 className="size-4" aria-hidden /> Marcar como resolvido
                        </button>
                      )
                    ) : (
                      <>
                        <button onClick={() => abrir(item)} aria-label="Editar" className="rounded-full p-1.5 text-marca-700 hover:bg-menta-100"><Pencil className="size-4" /></button>
                        <button onClick={() => excluir(item)} aria-label="Excluir" className="rounded-full p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CampoFormulario({ campo: c, valor, opcoes, mudar, titulo }: {
  campo: Campo; valor: string | boolean | undefined; opcoes?: Item[]; mudar: (v: string | boolean) => void; titulo?: string;
}) {
  const largo = c.tipo === "textarea" || c.grupo;
  return (
    <>
      {titulo && <h3 className="mt-2 text-sm font-semibold text-marca-800 sm:col-span-2">{titulo}</h3>}
      {c.tipo === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
          <input type="checkbox" checked={valor === true} onChange={(e) => mudar(e.target.checked)} className="size-4 accent-marca-700" />
          {c.rotulo}
        </label>
      ) : (
        <label className={`block text-sm font-medium ${largo ? "sm:col-span-2" : ""}`}>
          {c.rotulo}{c.obrigatorio && <span className="text-red-600"> *</span>}
          {c.tipo === "textarea" ? (
            <textarea rows={2} value={String(valor ?? "")} onChange={(e) => mudar(e.target.value)} className={`${campoCss} mt-1`} />
          ) : c.tipo === "select" ? (
            <select required={c.obrigatorio} value={String(valor ?? "")} onChange={(e) => mudar(e.target.value)} className={`${campoCss} mt-1`}>
              <option value="">{c.obrigatorio ? "Selecione…" : "— Nenhuma —"}</option>
              {c.fixas?.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
              {c.fonte && opcoes?.map((o) => <option key={o.id} value={o.id}>{rotuloOpcao(c.fonte!, o)}</option>)}
            </select>
          ) : (
            <input
              type={c.tipo === "numero" ? "number" : c.tipo === "data" ? "date" : "text"}
              step={c.passo}
              required={c.obrigatorio}
              value={String(valor ?? "")}
              onChange={(e) => mudar(e.target.value)}
              className={`${campoCss} mt-1`}
            />
          )}
        </label>
      )}
    </>
  );
}
