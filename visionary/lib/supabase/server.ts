import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseEnv } from './env';

/** Auth cookies are only read on the server (no browser Supabase client), so they can be HttpOnly. */
export const hardened = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const };

/** Supabase client bound to the visitor's auth cookies (anon key). Used only for admin sign-in/out and session checks. */
export async function authClient() {
  const { url, anonKey } = supabaseEnv();
  const store = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        // Server Components cannot set cookies; the proxy refreshes the session instead, so ignore that case.
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, { ...options, ...hardened }));
        } catch {
          /* called from a Server Component */
        }
      },
    },
  });
}
