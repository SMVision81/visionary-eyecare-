import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AdminSession } from '../types';

// MOCK AUTH (frontend phase). Credentials from env; replaced by Supabase Auth in Phase B.
// In development, falls back to demo credentials so the panel can be used without setup.
const isProd = process.env.NODE_ENV === 'production';
const DEV_EMAIL = 'owner@visionary.local';
const DEV_PASSWORD = 'visionary-demo';
const DEV_SECRET = 'dev-only-insecure-secret-change-me';

export const SESSION_COOKIE = 've_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

function config() {
  const email = process.env.ADMIN_DEMO_EMAIL || (isProd ? '' : DEV_EMAIL);
  const password = process.env.ADMIN_DEMO_PASSWORD || (isProd ? '' : DEV_PASSWORD);
  const secret = process.env.SESSION_SECRET || (isProd ? '' : DEV_SECRET);
  return { email, password, secret, enabled: Boolean(email && password && secret) };
}

export const usingDevCredentials = () => !isProd && !process.env.ADMIN_DEMO_PASSWORD;

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('base64url');

export function checkCredentials(email: string, password: string): boolean {
  const c = config();
  if (!c.enabled) return false;
  return safeEqual(email.trim().toLowerCase(), c.email.toLowerCase()) && safeEqual(password, c.password);
}

export function createToken(email: string): string {
  const { secret } = config();
  const payload = Buffer.from(JSON.stringify({ email, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function readToken(token: string | undefined): AdminSession | null {
  const { secret, enabled } = config();
  if (!token || !enabled) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload, secret))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AdminSession;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}
