// Supabase configuration (read on the server). NEXT_PUBLIC_* values are not secret; the service-role key is.
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  return { url, anonKey, serviceKey, ready: Boolean(url && anonKey && serviceKey) };
}

/** True when the site should use Supabase for data and admin login (DATA_SOURCE=supabase). */
export const usingSupabase = () => process.env.DATA_SOURCE === 'supabase';
