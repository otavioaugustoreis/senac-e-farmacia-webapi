// Configura o Auth do Supabase pela Management API e grava a chave secreta no .env.local.
// Uso: node --env-file=.env.local scripts/configurar-auth.mjs [site_url]
import { readFileSync, writeFileSync } from "node:fs";

const ref = process.env.SUPABASE_PROJECT_REF;
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!ref || !token) throw new Error("Defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN no .env.local");

const siteUrl = process.argv[2] ?? "http://localhost:3000";
const api = (caminho, init = {}) =>
  fetch(`https://api.supabase.com/v1/projects/${ref}${caminho}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });

// 1) Cadastro sem confirmação de e-mail + URLs do site
const redirects = [siteUrl, "http://localhost:3000"].filter((v, i, a) => a.indexOf(v) === i).map((u) => `${u}/**`).join(",");
const patch = await api("/config/auth", {
  method: "PATCH",
  body: JSON.stringify({ mailer_autoconfirm: true, site_url: siteUrl, uri_allow_list: redirects }),
});
if (!patch.ok) throw new Error(`Falha ao configurar Auth: ${patch.status} ${await patch.text()}`);
console.log(`Auth configurado: confirmação de e-mail desligada, site_url=${siteUrl}`);

// 2) Chave secreta (service role) para scripts administrativos — nunca vai para o navegador
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const resp = await api("/api-keys?reveal=true");
  if (!resp.ok) throw new Error(`Falha ao ler chaves: ${resp.status} ${await resp.text()}`);
  const chaves = await resp.json();
  const secreta =
    chaves.find((k) => k.type === "secret")?.api_key ??
    chaves.find((k) => k.name === "service_role")?.api_key;
  if (!secreta) throw new Error("Chave secreta não encontrada");
  const env = readFileSync(".env.local", "utf8").replace(/\s*$/, "\n");
  writeFileSync(".env.local", `${env}SUPABASE_SERVICE_ROLE_KEY=${secreta}\n`);
  console.log("SUPABASE_SERVICE_ROLE_KEY gravada no .env.local");
}
