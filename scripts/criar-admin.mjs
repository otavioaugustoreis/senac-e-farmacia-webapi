// Cria (ou promove) o administrador de demonstração.
// Uso: node --env-file=.env.local scripts/criar-admin.mjs [email]
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secretKey) throw new Error("Rode antes scripts/configurar-auth.mjs (precisa de SUPABASE_SERVICE_ROLE_KEY)");

const email = process.argv[2] ?? "user123@gmail.com";
const supabase = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: userList, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;
let user = userList.users.find((u) => u.email === email);
// Sempre gera uma senha nova: rodar de novo também serve para redefinir a senha do admin de demo.
const password = `Ef-${randomBytes(9).toString("base64url")}`;

if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { nome: "Administrador" },
  });
  if (error) throw error;
  user = data.user;
} else {
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) throw error;
}

const { error: profileError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
if (profileError) throw profileError;

console.log(`Admin pronto: ${email}`);
console.log(`Senha (anote, não será exibida de novo): ${password}`);
