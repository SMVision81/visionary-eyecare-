'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logoutAction } from '@/app/(admin)/admin/login/actions';

type Props = { email: string; attention: number; demo: boolean };

const sections: Record<string, { label: string; one: string }> = {
  enquiries: { label: 'Enquiries', one: 'Enquiry' },
  reviews: { label: 'Reviews', one: 'Review' },
};

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  const [section, id] = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const s = section && sections[section];
  if (!s) return [{ label: 'Dashboard' }];
  return id ? [{ label: s.label, href: `/admin/${section}` }, { label: s.one }] : [{ label: s.label }];
}

/** Light/dark toggle — flips data-theme on the admin body, persisted in localStorage. */
function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    setLight(document.body.dataset.theme === 'light');
  }, []);
  const toggle = () => {
    const next = !light;
    setLight(next);
    if (next) document.body.dataset.theme = 'light';
    else delete document.body.dataset.theme;
    try {
      localStorage.setItem('ad-theme', next ? 'light' : 'dark');
    } catch {}
  };
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={light}
      aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {light ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.4M12 19.1v2.4M3.3 3.3l1.7 1.7M19 19l1.7 1.7M2.5 12h2.4M19.1 12h2.4M3.3 20.7 5 19M19 5l1.7-1.7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.2 13.4A8.4 8.4 0 0 1 10.6 3.8a8.4 8.4 0 1 0 9.6 9.6Z" />
        </svg>
      )}
    </button>
  );
}

/** Utility header: page context, demo status, what needs attention, admin identity. */
export default function TopBar({ email, attention, demo }: Props) {
  const crumbs = crumbsFor(usePathname());
  return (
    <header className="topbar">
      <nav aria-label="Breadcrumb">
        <ol className="crumbs">
          {crumbs.map((c, i) => (
            <li key={c.label} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
              {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
            </li>
          ))}
        </ol>
      </nav>
      <div className="topbar-right">
        <ThemeToggle />
        {demo && (
          <span className="status-chip" title="Showing sample data. Not connected to Google or the database. Changes reset when the server restarts.">
            Demo data · resets on restart
          </span>
        )}
        {attention > 0 && (
          <Link href="/admin/enquiries?status=new" className="attn" aria-label={`${attention} enquiries need a reply`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5h16v11H8l-4 4z" />
            </svg>
            <b>{attention}</b>
            <span className="sr-only">enquiries need a reply</span>
          </Link>
        )}
        <div className="identity">
          <span className="avatar" aria-hidden="true">
            {email[0]?.toUpperCase() ?? 'A'}
          </span>
          <span className="identity-text">
            <strong title={email}>{email}</strong>
            <span>Admin</span>
          </span>
        </div>
        <form action={logoutAction} className="topbar-signout">
          <button type="submit" className="a-btn a-btn-ghost a-btn-sm">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
