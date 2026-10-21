import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession, isUsingDevLogin } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage() {
  if (await getSession()) redirect('/admin');
  return (
    <main className="login-page">
      <div className="login-card">
        <img src="/images/logo-white.svg" alt="Visionary Eyecare" width={120} height={58} />
        <h1>Owner sign in</h1>
        <p className="muted">Manage Google reviews and customer enquiries.</p>
        <LoginForm />
        {isUsingDevLogin() && (
          <p className="dev-hint">
            Development login: <code>owner@visionary.local</code> / <code>visionary-demo</code>. Set ADMIN_DEMO_EMAIL,
            ADMIN_DEMO_PASSWORD and SESSION_SECRET in .env.local to change it.
          </p>
        )}
      </div>
    </main>
  );
}
