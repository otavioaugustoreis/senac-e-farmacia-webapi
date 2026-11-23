// Verificação de ponta a ponta contra um servidor rodando (local ou Vercel).
// Cria um usuário de teste, reporta um preço, confere o bloqueio do admin e, se houver
// ADMIN_EMAIL/ADMIN_PASSWORD, altera um preço como admin. Remove o usuário de teste no fim.
// Uso: node --env-file=.env.local scripts/verificar-fluxos.mjs [http://localhost:3000]
import { createClient } from "@supabase/supabase-js";

const base = process.argv[2] ?? "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = new URL(url).hostname.split(".")[0];

let failures = 0;
const check = (ok, description) => {
  console.log(`${ok ? "OK  " : "FALHA"} ${description}`);
  if (!ok) failures++;
};

/** Cookie no formato do @supabase/ssr (base64 + chunks de até 3180 caracteres). */
function sessionCookie(session) {
  const amount = "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url");
  const name = `sb-${ref}-auth-token`;
  if (amount.length <= 3180) return `${name}=${amount}`;
  const parts = amount.match(/.{1,3180}/g);
  return parts.map((p, i) => `${name}.${i}=${p}`).join("; ");
}

async function signIn(email, password) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return sessionCookie(data.session);
}

const admin = createClient(url, secretKey, { auth: { persistSession: false } });
const testEmail = `teste-${Date.now()}@exemplo.com`;
const testPassword = "senha-teste-123";

try {
  // Cadastro (sem confirmação de e-mail)
  const publicClient = createClient(url, anon, { auth: { persistSession: false } });
  const { data: signup, error: signupError } = await publicClient.auth.signUp({ email: testEmail, password: testPassword, options: { data: { nome: "Teste" } } });
  check(!signupError && !!signup.session, "cadastro entra logado direto (sem confirmar e-mail)");

  const cookie = await signIn(testEmail, testPassword);
  const home = await (await fetch(base, { headers: { cookie } })).text();
  check(home.includes("Olá") && home.includes("Sair"), "cabeçalho mostra usuário logado");

  const detail = await (await fetch(`${base}/api/medicamentos/1`)).json();
  const priceId = detail.prices[0].id;
  const rep = await fetch(`${base}/api/reportes`, {
    method: "POST", headers: { cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, comment: "verificação automática" }),
  });
  check(rep.status === 201, `reportar preço logado → 201 (veio ${rep.status})`);

  const anonymous = await fetch(`${base}/api/reportes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  check(anonymous.status === 401, `reportar sem login → 401 (veio ${anonymous.status})`);

  const blocked = await fetch(`${base}/api/admin/precos`, { headers: { cookie } });
  check(blocked.status === 403, `usuário comum no admin → 403 (veio ${blocked.status})`);

  const adminPage = await fetch(`${base}/admin`, { headers: { cookie }, redirect: "manual" });
  const adminText = adminPage.status === 200 ? await adminPage.text() : "";
  check(adminText.includes("Acesso restrito") || adminPage.status >= 300, "tela /admin bloqueada para usuário comum");

  // Admin (opcional)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const adminCookie = await signIn(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    const target = detail.prices[detail.prices.length - 1];
    const newValue = Math.round((target.amount + 0.11) * 100) / 100;
    const save = await fetch(`${base}/api/admin/precos`, {
      method: "POST", headers: { cookie: adminCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ id: target.id, medicineId: 1, pharmacyId: target.pharmacy.id, amount: newValue }),
    });
    check(save.status === 200, `admin altera preço → 200 (veio ${save.status})`);
    const after = await (await fetch(`${base}/api/medicamentos/1`)).json();
    const p = after.prices.find((x) => x.id === target.id);
    const today = new Date().toISOString().slice(0, 10);
    check(p?.amount === newValue && p.updatedAt.slice(0, 10) === today, "preço novo aparece no público com data de hoje");
    const reports = await (await fetch(`${base}/api/admin/reportes`, { headers: { cookie: adminCookie } })).json();
    check(Array.isArray(reports) && reports.some((r) => r.comment === "verificação automática"), "admin vê o reporte");
    const adminPageOk = await (await fetch(`${base}/admin`, { headers: { cookie: adminCookie } })).text();
    check(adminPageOk.includes("Painel"), "admin abre o painel");
  } else {
    console.log("(pulei os testes de admin: defina ADMIN_EMAIL e ADMIN_PASSWORD)");
  }
} finally {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const u = data?.users.find((x) => x.email === testEmail);
  if (u) await admin.auth.admin.deleteUser(u.id);
}

console.log(failures ? `\n${failures} verificação(ões) falharam` : "\nTodas as verificações passaram");
process.exit(failures ? 1 : 0);
