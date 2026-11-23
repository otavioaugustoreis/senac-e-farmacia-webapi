"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { ENTITY_CONFIG, type Entity, type OptionSource, type FormValues } from "./entities";
import { adminApi, type Item } from "./admin-api";
import { FormField, fieldClass } from "./FormField";

export function EntityManager({ entity }: { entity: Entity }) {
  const cfg = ENTITY_CONFIG[entity];
  const api = useMemo(() => adminApi(entity), [entity]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [options, setOptions] = useState<Partial<Record<OptionSource, Item[]>>>({});
  const [values, setValues] = useState<FormValues | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  const reload = useCallback(async () => {
    try {
      setItems(await api.list());
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    let isActive = true;
    api.list()
      .then((list) => isActive && setItems(list))
      .catch((e: Error) => isActive && setErrorMessage(e.message));
    const sources = [...new Set(cfg.fields.map((c) => c.source).filter(Boolean))] as OptionSource[];
    for (const source of sources) {
      adminApi(source).list()
        .catch(() => [])
        .then((list) => isActive && setOptions((o) => ({ ...o, [source]: list })));
    }
    return () => { isActive = false; };
  }, [api, cfg.fields]);

  const visible = useMemo(() => {
    const t = filter.trim().toLowerCase();
    return (items ?? []).filter((i) => !t || cfg.searchText(i).toLowerCase().includes(t));
  }, [items, filter, cfg]);

  const capitalized = `${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)}`;

  async function run(action: () => Promise<unknown>, success?: string) {
    try {
      await action();
      if (success) setNotice(success);
      await reload();
      return true;
    } catch (e) {
      setErrorMessage((e as Error).message);
      return false;
    }
  }

  async function open(item?: Item) {
    setErrorMessage(null);
    setNotice(null);
    const form = cfg.toForm(item ?? {});
    if (item && cfg.detailToForm) {
      const detail = await api.detail(item.id).catch(() => null);
      Object.assign(form, cfg.detailToForm(detail));
    }
    setValues(form);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!values) return;
    setSaving(true);
    setErrorMessage(null);
    if (await run(() => api.save(cfg.toBody(values)), `${capitalized} salvo.`)) setValues(null);
    setSaving(false);
  }

  async function remove(item: Item) {
    if (!confirm(`Excluir este ${cfg.singular}? Esta ação não pode ser desfeita.`)) return;
    await run(() => api.remove(item.id), `${capitalized} excluído.`);
  }

  const markResolved = (item: Item) => run(() => api.resolve(item.id));

  const editable = cfg.fields.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">{cfg.title}</h1>
        <div className="flex w-full gap-2 sm:w-auto">
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar…" aria-label="Filtrar" className={`${fieldClass} min-w-0 flex-1 sm:w-48 sm:flex-none`} />
          {editable && (
            <button onClick={() => open()} className="flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-brand-800 px-4 text-sm font-semibold text-white hover:bg-brand-700">
              <Plus className="size-4" aria-hidden /> Novo
            </button>
          )}
        </div>
      </div>

      {notice && <p role="status" className="mt-3 rounded-xl bg-mint-100 px-3 py-2 text-sm text-brand-800">{notice}</p>}
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
            <button disabled={saving} className="rounded-full bg-brand-800 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button type="button" onClick={() => setValues(null)} className="rounded-full px-4 py-2 text-sm text-muted hover:bg-black/5">Cancelar</button>
          </div>
        </form>
      )}

      {items !== null && visible.length > 0 && (
        <p className="mt-4 text-xs text-muted">{visible.length} {visible.length === 1 ? "registro" : "registros"}</p>
      )}

      {items !== null && visible.length > 0 && (
        <ul className="mt-2 space-y-2 md:hidden">
          {visible.map((item) => (
            <li key={item.id} className={`rounded-2xl bg-white p-4 ring-1 ring-black/5 ${item.resolved ? "opacity-60" : ""}`}>
              <p className="font-semibold leading-snug">{cfg.columns[0].value(item)}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                {cfg.columns.slice(1).map((c) => (
                  <div key={c.label} className="contents">
                    <dt className="text-muted">{c.label}</dt>
                    <dd className="min-w-0 break-words">{c.value(item)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex gap-2">
                {cfg.actions === "resolve" ? (
                  !item.resolved && (
                    <button onClick={() => markResolved(item)} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-full bg-mint-100 px-3 text-sm font-semibold text-brand-800">
                      <CheckCircle2 className="size-4" aria-hidden /> Marcar como resolvido
                    </button>
                  )
                ) : (
                  <>
                    <button onClick={() => open(item)} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-full bg-mint-100 text-sm font-semibold text-brand-800">
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

      <div className={`mt-2 overflow-x-auto rounded-[var(--radius-card)] bg-white ring-1 ring-black/5 ${items !== null && visible.length > 0 ? "hidden md:block" : ""}`}>
        {items === null ? (
          <p className="p-6 text-sm text-muted">Carregando…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-muted">Nenhum registro.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-mint-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                {cfg.columns.map((c) => <th key={c.label} className="px-4 py-3 font-semibold">{c.label}</th>)}
                <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {visible.map((item) => (
                <tr key={item.id} className={item.resolved ? "text-muted" : ""}>
                  {cfg.columns.map((c) => <td key={c.label} className="px-4 py-2.5">{c.value(item)}</td>)}
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    {cfg.actions === "resolve" ? (
                      !item.resolved && (
                        <button onClick={() => markResolved(item)} className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-3 py-1 text-xs font-semibold text-brand-800">
                          <CheckCircle2 className="size-4" aria-hidden /> Marcar como resolvido
                        </button>
                      )
                    ) : (
                      <>
                        <button onClick={() => open(item)} aria-label="Editar" className="rounded-full p-1.5 text-brand-700 hover:bg-mint-100"><Pencil className="size-4" /></button>
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

