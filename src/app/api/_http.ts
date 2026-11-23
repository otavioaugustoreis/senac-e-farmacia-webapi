import { DomainError, UnauthenticatedError, NotFoundError, ForbiddenError } from "@/domain/errors";

export type RouteContext<T extends Record<string, string>> = { params: Promise<T> };

export const json = (body: unknown, status = 200) => Response.json(body, { status });
export const noContent = () => new Response(null, { status: 204 });

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof DomainError) return json({ errorMessage: e.message }, 400);
    if (e instanceof UnauthenticatedError) return json({ errorMessage: e.message }, 401);
    if (e instanceof ForbiddenError) return json({ errorMessage: e.message }, 403);
    if (e instanceof NotFoundError) return json({ errorMessage: e.message }, 404);
    console.error(e);
    return json({ errorMessage: "Erro interno" }, 500);
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {}
  throw new DomainError("Corpo da requisição inválido");
}

export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new DomainError("Identificador inválido");
  return id;
}
