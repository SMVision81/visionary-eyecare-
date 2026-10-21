import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AdminSession } from '../types';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, checkCredentials, createToken, readToken, usingDevCredentials } from './mock';
import { usingSupabase } from '../supabase/env';
import { authClient } from '../supabase/server';
import { serviceClient } from '../supabase/admin';

/** True only in development when no ADMIN_DEMO_PASSWORD is set and Supabase is off (shows the demo login hint). */
export const isUsingDevLogin = () => !usingSupabase() && usingDevCredentials();

// Public auth API used by admin pages and Server Actions. Two back ends behind the same exports:
// Supabase Auth + the `admins` allow-list (DATA_SOURCE=supabase), or the mock HMAC cookie (demo mode).

/** Is this Supabase user on the admin allow-list? (service role: the admins table is closed to browsers). */
async function isAdmin(userId: string): Promise<boolean> {
  const res = await serviceClient().from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  return !res.error && !!res.data;
}

export const getSession = cache(async (): Promise<AdminSession | null> => {
  if (usingSupabase()) {
    const supabase = await authClient();
    // getUser() validates the token with Supabase (never trust the cookie contents alone).
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email || !(await isAdmin(data.user.id))) return null;
    return { email: data.user.email, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 };
  }
  const store = await cookies();
  return readToken(store.get(SESSION_COOKIE)?.value);
});

/** Call at the top of EVERY admin page and admin Server Action. Redirects to login if not signed in. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}

export async function signIn(email: string, password: string): Promise<boolean> {
  if (usingSupabase()) {
    const supabase = await authClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.user) return false;
    // A valid Supabase account that is not on the allow-list must not keep a session.
    if (!(await isAdmin(data.user.id))) {
      await supabase.auth.signOut();
      return false;
    }
    return true;
  }
  if (!checkCredentials(email, password)) return false;
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(email.trim().toLowerCase()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

export async function signOut(): Promise<void> {
  if (usingSupabase()) {
    const supabase = await authClient();
    await supabase.auth.signOut();
    return;
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
