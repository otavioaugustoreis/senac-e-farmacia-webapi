import { readFileSync, writeFileSync } from "node:fs";

const ref = process.env.SUPABASE_PROJECT_REF;
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!ref || !token) throw new Error("Defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN no .env.local");

const siteUrl = process.argv[2] ?? "http://localhost:3000";
const api = (path, init = {}) =>
  fetch(`https://api.supabase.com/v1/projects/${ref}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });

const redirects = [siteUrl, "http://localhost:3000"].filter((v, i, a) => a.indexOf(v) === i).map((u) => `${u}/**`).join(",");
const patch = await api("/config/auth", {
  method: "PATCH",
  body: JSON.stringify({ mailer_autoconfirm: true, site_url: siteUrl, uri_allow_list: redirects }),
});
if (!patch.ok) throw new Error(`Falha ao configurar Auth: ${patch.status} ${await patch.text()}`);
console.log(`Auth configurado: confirmação de e-mail desligada, site_url=${siteUrl}`);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const resp = await api("/api-keys?reveal=true");
  if (!resp.ok) throw new Error(`Falha ao ler chaves: ${resp.status} ${await resp.text()}`);
  const keyNames = await resp.json();
  const secretKey =
    keyNames.find((k) => k.type === "secret")?.api_key ??
    keyNames.find((k) => k.name === "service_role")?.api_key;
  if (!secretKey) throw new Error("Chave secreta não encontrada");
  const env = readFileSync(".env.local", "utf8").replace(/\s*$/, "\n");
  writeFileSync(".env.local", `${env}SUPABASE_SERVICE_ROLE_KEY=${secretKey}\n`);
  console.log("SUPABASE_SERVICE_ROLE_KEY gravada no .env.local");
}
