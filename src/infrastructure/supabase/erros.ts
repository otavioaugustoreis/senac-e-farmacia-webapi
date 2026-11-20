import type { PostgrestError } from "@supabase/supabase-js";
import { DomainError, ProibidoError } from "@/domain/erros";

/** Converte erros do PostgREST em erros do domínio (RLS → Proibido; restrições → validação). */
export function falha(error: PostgrestError): never {
  if (error.code === "42501") throw new ProibidoError();
  if (error.code === "23505") throw new DomainError("Já existe um registro com esses dados");
  if (error.code === "23503") throw new DomainError("Registro relacionado não encontrado ou ainda em uso");
  if (error.code === "23514") throw new DomainError("Dados inválidos");
  throw new Error(error.message);
}

export function verificar<T>(resultado: { data: T; error: PostgrestError | null }): T {
  if (resultado.error) falha(resultado.error);
  return resultado.data;
}
