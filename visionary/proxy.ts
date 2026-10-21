import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Admin routes only. Two jobs:
// 1. Supabase mode: refresh the auth session cookies (tokens expire; refreshed here so Server Components see a valid one).
// 2. Optimistic redirect to the login page when there is clearly no session.
// Real authorisation still happens in requireAdmin() (lib/auth) on every admin page and Server Action.
const MOCK_COOKIE = 've_admin_session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith('/admin/login');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (process.env.DATA_SOURCE === 'supabase' && url && anonKey) {
    let response = NextResponse.next({ request });
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet, headers) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          // Same hardening as lib/supabase/server.ts: HttpOnly, Secure in production, SameSite=Lax.
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    if (!data.user && !isLogin) return NextResponse.redirect(new URL('/admin/login', request.url));
    return response;
  }

  if (!isLogin && !request.cookies.has(MOCK_COOKIE)) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
