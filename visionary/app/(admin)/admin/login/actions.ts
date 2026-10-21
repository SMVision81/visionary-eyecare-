'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/lib/auth';
import { clientIp } from '@/lib/rate-limit';
import type { ActionState } from '@/lib/types';

// Simple brute-force protection (per server instance). Phase B: Supabase Auth handles this.
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function loginAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const h = await headers();
  const ip = clientIp(h);
  const entry = attempts.get(ip);
  if (entry && entry.until > Date.now()) {
    return { ok: false, message: 'Too many attempts. Please wait 15 minutes and try again.' };
  }

  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');
  if (!email || !password) return { ok: false, message: 'Enter your email and password.', values: { email } };

  if (!(await signIn(email, password))) {
    const count = (entry?.count ?? 0) + 1;
    attempts.set(ip, { count, until: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0 });
    return { ok: false, message: 'Incorrect email or password.', values: { email } };
  }

  attempts.delete(ip);
  redirect('/admin');
}

export async function logoutAction() {
  await signOut();
  redirect('/admin/login');
}
