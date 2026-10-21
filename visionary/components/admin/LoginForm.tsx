'use client';
import { useActionState } from 'react';
import { loginAction } from '@/app/(admin)/admin/login/actions';
import type { ActionState } from '@/lib/types';

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { ok: false } as ActionState);
  return (
    <form action={action} className="stack">
      {state.message && (
        <p className="alert alert-error" role="alert">
          {state.message}
        </p>
      )}
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="username" defaultValue={state.values?.email} />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      <button className="a-btn a-btn-primary a-btn-block" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
