import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function credenciaisPublicas() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, chave };
}

/** Cliente Supabase no servidor, com a sessão do usuário lida dos cookies. */
export async function criarClienteServidor() {
  const { url, chave } = credenciaisPublicas();
  const cookieStore = await cookies();
  return createServerClient(url, chave, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Em Server Components os cookies são somente leitura; o proxy renova a sessão.
        }
      },
    },
  });
}
