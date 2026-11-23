"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { ENTITY_CONFIG, optionLabel, type Field, type Entity, type OptionSource, type FormValues } from "./entidades";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = any;

const fieldClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-600/20";

async function apiRequest(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  if (r.status === 204) return null;
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.errorMessage ?? "Não foi possível concluir");
  return body;
}

export function EntityManager({ entity }: { entity: Entity }) {
  const cfg = ENTITY_CONFIG[entity];
  const [items, setItems] = useState<Item[] | null>(null);
  const [options, setOptions] = useState<Partial<Record<OptionSource, Item[]>>>({});
  const [values, setValues] = useState<FormValues | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await apiRequest(`/api/admin/${entity}`));
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  }, [entity]);

  useEffect(() => {
    let isActive = true;
    apiRequest(`/api/admin/${entity}`)
      .then((list) => isActive && setItems(list))
      .catch((e: Error) => isActive && setErrorMessage(e.message));
    const sources = [...new Set(cfg.fields.map((c) => c.source).filter(Boolean))] as OptionSource[];
    for (const f of sources) {
      apiRequest(`/api/admin/${f}`)
        .catch(() => [])
        .then((list) => isActive && setOptions((o) => ({ ...o, [f]: list })));
    }
    return () => { isActive = false; };
  }, [entity, cfg.fields]);

  const visible = useMemo(() => {
    const t = filter.trim().toLowerCase();
    return (items ?? []).filter((i) => !t || cfg.searchText(i).toLowerCase().includes(t));
  }, [items, filter, cfg]);

  async function open(item?: Item) {
    setErrorMessage(null);
    setNotice(null);
    const base = item ? cfg.toForm(item) : cfg.toForm({});
    if (item && cfg.loadsPackageInsert) {
      const { packageInsert } = (await apiRequest(`/api/admin/${entity}/${item.id}`).catch(() => ({ packageInsert: null }))) ?? {};
      for (const k of ["usedFor", "contraindications", "sideEffects", "warnings", "anvisaLink"]) {
        base[`packageInsert.${k}`] = packageInsert?.[k] ?? "";
      }
    }
    setValues(base);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!values) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      await apiRequest(`/api/admin/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg.toBody(values)),
      });
      setValues(null);
      setNotice(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} salvo.`);
      await load();
    } catch (e2) {
      setErrorMessage((e2 as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Item) {
    if (!confirm(`Excluir este ${cfg.singular}? Esta ação não pode ser desfeita.`)) return;
    try {
      await apiRequest(`/api/admin/${entity}/${item.id}`, { method: "DELETE" });
      setNotice(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} excluído.`);
      await load();
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  }

  async function markResolved(item: Item) {
    try {
      await apiRequest(`/api/admin/${entity}/${item.id}`, { method: "PATCH" });
      await load();
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  }

  const editable = cfg.fields.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-marca-900">{cfg.title}</h1>
        <div className="flex w-full gap-2 sm:w-auto">
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar…" aria-label="Filtrar" className={`${fieldClass} min-w-0 flex-1 sm:w-48 sm:flex-none`} />
          {editable && (
            <button onClick={() => open()} className="flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-marca-800 px-4 text-sm font-semibold text-white hover:bg-marca-700">
              <Plus className="size-4" aria-hidden /> Novo
            </button>
          )}
        </div>
      </div>

      {notice && <p role="status" className="mt-3 rounded-xl bg-menta-100 px-3 py-2 text-sm text-marca-800">{notice}</p>}
      {errorMessage && !values && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

      {values && (
        <form onSubmit={save} className="mt-4 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{values.id ? `Editar ${cfg.singular}` : `Novo ${cfg.singular}`}</h2>
            <button type="button" onClick={() => setValues(null)} aria-label="Fechar" className="rounded-full p-1 hover:bg-black/5"><X className="size-5" /></button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {cfg.fields.map((c, i) => (
              <FormField
                key={c.name}
                field={c}
                title={c.group && cfg.fields[i - 1]?.group !== c.group ? c.group : undefined}
                value={values[c.name]}
                options={c.source ? options[c.source] : undefined}
                update={(v) => setValues((current) => ({ ...(current ?? {}), [c.name]: v }))}
              />
            ))}
          </div>
          {errorMessage && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}
          <div className="mt-4 flex gap-2">
            <button disabled={saving} className="rounded-full bg-marca-800 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button type="button" onClick={() => setValues(null)} className="rounded-full px-4 py-2 text-sm text-suave hover:bg-black/5">Cancelar</button>
          </div>
        </form>
      )}

      {items !== null && visible.length > 0 && (
        <p className="mt-4 text-xs text-suave">{visible.length} {visible.length === 1 ? "registro" : "registros"}</p>
      )}

      {/* Celular: cartões */}
      {items !== null && visible.length > 0 && (
        <ul className="mt-2 space-y-2 md:hidden">
          {visible.map((item) => (
            <li key={item.id} className={`rounded-2xl bg-white p-4 ring-1 ring-black/5 ${item.resolved ? "opacity-60" : ""}`}>
              <p className="font-semibold leading-snug">{cfg.columns[0].value(item)}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                {cfg.columns.slice(1).map((c) => (
                  <div key={c.label} className="contents">
                    <dt className="text-suave">{c.label}</dt>
                    <dd className="min-w-0 break-words">{c.value(item)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex gap-2">
                {entity === "reportes" ? (
                  !item.resolved && (
                    <button onClick={() => markResolved(item)} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-full bg-menta-100 px-3 text-sm font-semibold text-marca-800">
                      <CheckCircle2 className="size-4" aria-hidden /> Marcar como resolvido
                    </button>
                  )
                ) : (
                  <>
                    <button onClick={() => open(item)} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-full bg-menta-100 text-sm font-semibold text-marca-800">
                      <Pencil className="size-4" aria-hidden /> Editar
                    </button>
                    <button onClick={() => remove(item)} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-full bg-red-50 text-sm font-semibold text-red-700">
                      <Trash2 className="size-4" aria-hidden /> Excluir
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Computador: tabela (e mensagens de carregando/vazio em qualquer tela) */}
      <div className={`mt-2 overflow-x-auto rounded-[var(--radius-card)] bg-white ring-1 ring-black/5 ${items !== null && visible.length > 0 ? "hidden md:block" : ""}`}>
        {items === null ? (
          <p className="p-6 text-sm text-suave">Carregando…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-suave">Nenhum registro.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-menta-50 text-xs uppercase tracking-wide text-suave">
              <tr>
                {cfg.columns.map((c) => <th key={c.label} className="px-4 py-3 font-semibold">{c.label}</th>)}
                <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {visible.map((item) => (
                <tr key={item.id} className={item.resolved ? "text-suave" : ""}>
                  {cfg.columns.map((c) => <td key={c.label} className="px-4 py-2.5">{c.value(item)}</td>)}
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    {entity === "reportes" ? (
                      !item.resolved && (
                        <button onClick={() => markResolved(item)} className="inline-flex items-center gap-1 rounded-full bg-menta-100 px-3 py-1 text-xs font-semibold text-marca-800">
                          <CheckCircle2 className="size-4" aria-hidden /> Marcar como resolvido
                        </button>
                      )
                    ) : (
                      <>
                        <button onClick={() => open(item)} aria-label="Editar" className="rounded-full p-1.5 text-marca-700 hover:bg-menta-100"><Pencil className="size-4" /></button>
                        <button onClick={() => remove(item)} aria-label="Excluir" className="rounded-full p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
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

function FormField({ field: c, value, options, update, title }: {
  field: Field; value: string | boolean | undefined; options?: Item[]; update: (v: string | boolean) => void; title?: string;
}) {
  const wide = c.type === "textarea" || c.group;
  return (
    <>
      {title && <h3 className="mt-2 text-sm font-semibold text-marca-800 sm:col-span-2">{title}</h3>}
      {c.type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
          <input type="checkbox" checked={value === true} onChange={(e) => update(e.target.checked)} className="size-4 accent-marca-700" />
          {c.label}
        </label>
      ) : (
        <label className={`block text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
          {c.label}{c.required && <span className="text-red-600"> *</span>}
          {c.type === "textarea" ? (
            <textarea rows={2} value={String(value ?? "")} onChange={(e) => update(e.target.value)} className={`${fieldClass} mt-1`} />
          ) : c.type === "select" ? (
            <select required={c.required} value={String(value ?? "")} onChange={(e) => update(e.target.value)} className={`${fieldClass} mt-1`}>
              <option value="">{c.required ? "Selecione…" : "— Nenhuma —"}</option>
              {c.fixedOptions?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              {c.source && options?.map((o) => <option key={o.id} value={o.id}>{optionLabel(c.source!, o)}</option>)}
            </select>
          ) : (
            <input
              type={c.type === "number" ? "number" : c.type === "date" ? "date" : "text"}
              step={c.step}
              required={c.required}
              value={String(value ?? "")}
              onChange={(e) => update(e.target.value)}
              className={`${fieldClass} mt-1`}
            />
          )}
        </label>
      )}
    </>
  );
}
