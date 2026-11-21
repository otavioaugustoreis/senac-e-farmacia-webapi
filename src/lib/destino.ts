const BASE = "http://e-farmacia.local";

/**
 * Só aceita caminhos internos (evita redirecionamento para outro site após o login).
 * Caracteres de controle e barra invertida são recusados porque o navegador os descarta
 * ou converte ao montar a URL ("/\t/evil.com" vira "//evil.com").
 */
export function destinoSeguro(next: unknown): string {
  const d = typeof next === "string" ? next : "";
  if (!d.startsWith("/") || d.startsWith("//") || /[\u0000-\u001f\u007f\\]/.test(d)) return "/";
  const url = new URL(d, BASE);
  return url.origin === BASE ? `${url.pathname}${url.search}${url.hash}` : "/";
}

/** Depois do login: o admin sem destino específico vai direto para o painel. */
export function destinoAposLogin(next: unknown, papel: "user" | "admin"): string {
  const destino = destinoSeguro(next);
  return papel === "admin" && destino === "/" ? "/admin" : destino;
}
