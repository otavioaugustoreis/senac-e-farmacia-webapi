import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SESSION_COOKIE_OPTIONS } from "./cookie-options";

export function publicCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anonKey };
}

export async function createServerSupabase() {
  const { url, anonKey } = publicCredentials();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, { ...options, ...SESSION_COOKIE_OPTIONS }));
        } catch {}
      },
    },
  });
}
