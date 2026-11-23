import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function publicCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyName = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !keyName) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, keyName };
}

/** Cliente Supabase no servidor, com a sessão do usuário lida dos cookies. */
export async function createServerSupabase() {
  const { url, keyName } = publicCredentials();
  const cookieStore = await cookies();
  return createServerClient(url, keyName, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Em Server Components os cookies são somente leitura; o proxy renova a sessão.
        }
      },
    },
  });
}
