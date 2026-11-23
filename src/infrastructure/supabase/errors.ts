import type { PostgrestError } from "@supabase/supabase-js";
import { DomainError, ForbiddenError } from "@/domain/errors";

/** Converte erros do PostgREST em erros do domínio (RLS → Proibido; restrições → validação). */
export function failure(error: PostgrestError): never {
  if (error.code === "42501") throw new ForbiddenError();
  if (error.code === "23505") throw new DomainError("Já existe um registro com esses dados");
  if (error.code === "23503") throw new DomainError("Registro relacionado não encontrado ou ainda em uso");
  if (error.code === "23514") throw new DomainError("Dados inválidos");
  throw new Error(error.message);
}

export function unwrap<T>(result: { data: T; error: PostgrestError | null }): T {
  if (result.error) failure(result.error);
  return result.data;
}
