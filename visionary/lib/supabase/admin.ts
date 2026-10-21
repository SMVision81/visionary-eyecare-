import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseEnv } from './env';

let client: SupabaseClient | null = null;

/**
 * Service-role client: bypasses Row Level Security. SERVER ONLY. Use it only after validating input, and in admin
 * code only after requireAdmin(). Never import this from a client component.
 */
export function serviceClient(): SupabaseClient {
  if (client) return client;
  const { url, serviceKey, ready } = supabaseEnv();
  if (!ready) throw new Error('Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.');
  client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
