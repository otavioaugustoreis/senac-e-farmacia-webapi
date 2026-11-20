import { DomainError, NaoAutenticadoError, NaoEncontradoError, ProibidoError } from "@/domain/erros";

export type Contexto<T extends Record<string, string>> = { params: Promise<T> };

export const json = (corpo: unknown, status = 200) => Response.json(corpo, { status });
export const semConteudo = () => new Response(null, { status: 204 });

/** Executa o controller e traduz erros do domínio em status HTTP com corpo { erro }. */
export async function tratar(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof DomainError) return json({ erro: e.message }, 400);
    if (e instanceof NaoAutenticadoError) return json({ erro: e.message }, 401);
    if (e instanceof ProibidoError) return json({ erro: e.message }, 403);
    if (e instanceof NaoEncontradoError) return json({ erro: e.message }, 404);
    console.error(e);
    return json({ erro: "Erro interno" }, 500);
  }
}

export async function lerJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const corpo = await request.json();
    if (corpo && typeof corpo === "object" && !Array.isArray(corpo)) return corpo as Record<string, unknown>;
  } catch {
    // cai no erro abaixo
  }
  throw new DomainError("Corpo da requisição inválido");
}

export function lerId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new DomainError("Identificador inválido");
  return id;
}
