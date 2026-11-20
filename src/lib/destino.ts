/** Só aceita caminhos internos (evita redirecionamento para outro site após o login). */
export function destinoSeguro(next: unknown): string {
  const d = typeof next === "string" ? next : "";
  return d.startsWith("/") && !d.startsWith("//") && !d.startsWith("/\\") ? d : "/";
}
