// Verificação de ponta a ponta contra um servidor rodando (local ou Vercel).
// Cria um usuário de teste, reporta um preço, confere o bloqueio do admin e, se houver
// ADMIN_EMAIL/ADMIN_SENHA, altera um preço como admin. Remove o usuário de teste no fim.
// Uso: node --env-file=.env.local scripts/verificar-fluxos.mjs [http://localhost:3000]
import { createClient } from "@supabase/supabase-js";

const base = process.argv[2] ?? "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = new URL(url).hostname.split(".")[0];

let falhas = 0;
const checar = (ok, descricao) => {
  console.log(`${ok ? "OK  " : "FALHA"} ${descricao}`);
  if (!ok) falhas++;
};

/** Cookie no formato do @supabase/ssr (base64 + chunks de até 3180 caracteres). */
function cookieDaSessao(sessao) {
  const valor = "base64-" + Buffer.from(JSON.stringify(sessao)).toString("base64url");
  const nome = `sb-${ref}-auth-token`;
  if (valor.length <= 3180) return `${nome}=${valor}`;
  const partes = valor.match(/.{1,3180}/g);
  return partes.map((p, i) => `${nome}.${i}=${p}`).join("; ");
}

async function entrar(email, senha) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await c.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return cookieDaSessao(data.session);
}

const admin = createClient(url, secreta, { auth: { persistSession: false } });
const emailTeste = `teste-${Date.now()}@exemplo.com`;
const senhaTeste = "senha-teste-123";

try {
  // Cadastro (sem confirmação de e-mail)
  const publico = createClient(url, anon, { auth: { persistSession: false } });
  const { data: cad, error: erroCad } = await publico.auth.signUp({ email: emailTeste, password: senhaTeste, options: { data: { nome: "Teste" } } });
  checar(!erroCad && !!cad.session, "cadastro entra logado direto (sem confirmar e-mail)");

  const cookie = await entrar(emailTeste, senhaTeste);
  const home = await (await fetch(base, { headers: { cookie } })).text();
  checar(home.includes("Olá") && home.includes("Sair"), "cabeçalho mostra usuário logado");

  const detalhe = await (await fetch(`${base}/api/medicamentos/1`)).json();
  const precoId = detalhe.precos[0].id;
  const rep = await fetch(`${base}/api/reportes`, {
    method: "POST", headers: { cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ precoId, comentario: "verificação automática" }),
  });
  checar(rep.status === 201, `reportar preço logado → 201 (veio ${rep.status})`);

  const anonimo = await fetch(`${base}/api/reportes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  checar(anonimo.status === 401, `reportar sem login → 401 (veio ${anonimo.status})`);

  const bloqueado = await fetch(`${base}/api/admin/precos`, { headers: { cookie } });
  checar(bloqueado.status === 403, `usuário comum no admin → 403 (veio ${bloqueado.status})`);

  const paginaAdmin = await fetch(`${base}/admin`, { headers: { cookie }, redirect: "manual" });
  const textoAdmin = paginaAdmin.status === 200 ? await paginaAdmin.text() : "";
  checar(textoAdmin.includes("Acesso restrito") || paginaAdmin.status >= 300, "tela /admin bloqueada para usuário comum");

  // Admin (opcional)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_SENHA) {
    const cookieAdmin = await entrar(process.env.ADMIN_EMAIL, process.env.ADMIN_SENHA);
    const alvo = detalhe.precos[detalhe.precos.length - 1];
    const novoValor = Math.round((alvo.valor + 0.11) * 100) / 100;
    const salvar = await fetch(`${base}/api/admin/precos`, {
      method: "POST", headers: { cookie: cookieAdmin, "Content-Type": "application/json" },
      body: JSON.stringify({ id: alvo.id, medicamentoId: 1, farmaciaId: alvo.farmacia.id, valor: novoValor }),
    });
    checar(salvar.status === 200, `admin altera preço → 200 (veio ${salvar.status})`);
    const depois = await (await fetch(`${base}/api/medicamentos/1`)).json();
    const p = depois.precos.find((x) => x.id === alvo.id);
    const hoje = new Date().toISOString().slice(0, 10);
    checar(p?.valor === novoValor && p.atualizadoEm.slice(0, 10) === hoje, "preço novo aparece no público com data de hoje");
    const reportes = await (await fetch(`${base}/api/admin/reportes`, { headers: { cookie: cookieAdmin } })).json();
    checar(Array.isArray(reportes) && reportes.some((r) => r.comentario === "verificação automática"), "admin vê o reporte");
    const paginaAdminOk = await (await fetch(`${base}/admin`, { headers: { cookie: cookieAdmin } })).text();
    checar(paginaAdminOk.includes("Painel"), "admin abre o painel");
  } else {
    console.log("(pulei os testes de admin: defina ADMIN_EMAIL e ADMIN_SENHA)");
  }
} finally {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const u = data?.users.find((x) => x.email === emailTeste);
  if (u) await admin.auth.admin.deleteUser(u.id);
}

console.log(falhas ? `\n${falhas} verificação(ões) falharam` : "\nTodas as verificações passaram");
process.exit(falhas ? 1 : 0);
