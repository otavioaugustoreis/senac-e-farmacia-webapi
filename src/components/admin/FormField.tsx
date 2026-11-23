import { optionLabel, type Field } from "./entities";
import type { Item } from "./admin-api";

export const fieldClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20";

export function FormField({ field: c, value, options, update, title }: {
  field: Field; value: string | boolean | undefined; options?: Item[]; update: (v: string | boolean) => void; title?: string;
}) {
  const wide = c.type === "textarea" || c.group;
  return (
    <>
      {title && <h3 className="mt-2 text-sm font-semibold text-brand-800 sm:col-span-2">{title}</h3>}
      {c.type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
          <input type="checkbox" checked={value === true} onChange={(e) => update(e.target.checked)} className="size-4 accent-brand-700" />
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
