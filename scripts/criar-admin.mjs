// Cria (ou promove) o administrador de demonstração.
// Uso: node --env-file=.env.local scripts/criar-admin.mjs [email]
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secreta) throw new Error("Rode antes scripts/configurar-auth.mjs (precisa de SUPABASE_SERVICE_ROLE_KEY)");

const email = process.argv[2] ?? "user123@gmail.com";
const supabase = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: lista, error: erroLista } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (erroLista) throw erroLista;
let usuario = lista.users.find((u) => u.email === email);
// Sempre gera uma senha nova: rodar de novo também serve para redefinir a senha do admin de demo.
const senha = `Ef-${randomBytes(9).toString("base64url")}`;

if (!usuario) {
  const { data, error } = await supabase.auth.admin.createUser({
    email, password: senha, email_confirm: true, user_metadata: { nome: "Administrador" },
  });
  if (error) throw error;
  usuario = data.user;
} else {
  const { error } = await supabase.auth.admin.updateUserById(usuario.id, { password: senha, email_confirm: true });
  if (error) throw error;
}

const { error: erroPerfil } = await supabase.from("profiles").update({ role: "admin" }).eq("id", usuario.id);
if (erroPerfil) throw erroPerfil;

console.log(`Admin pronto: ${email}`);
console.log(`Senha (anote, não será exibida de novo): ${senha}`);
