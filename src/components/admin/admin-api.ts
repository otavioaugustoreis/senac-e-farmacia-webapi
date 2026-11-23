import type { Entity, OptionSource } from "./entities";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item = any;

async function request(url: string, init?: RequestInit): Promise<Item> {
  const response = await fetch(url, init);
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.errorMessage ?? "Não foi possível concluir");
  return body;
}

export function adminApi(entity: Entity | OptionSource) {
  const base = `/api/admin/${entity}`;
  return {
    list: (): Promise<Item[]> => request(base),
    detail: (id: number): Promise<Item> => request(`${base}/${id}`),
    save: (body: Record<string, unknown>) =>
      request(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    remove: (id: number) => request(`${base}/${id}`, { method: "DELETE" }),
    resolve: (id: number) => request(`${base}/${id}`, { method: "PATCH" }),
  };
}
