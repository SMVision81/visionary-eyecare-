import { SmoothTabs } from './SmoothTabs';
import { timeAgo } from '@/lib/format';
import type { GoogleStats } from '@/lib/types';

// Small presentational building blocks for admin pages (server-safe, no state).

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function StatusTabs<T extends string>({
  basePath,
  tabs,
  current,
  labels,
  counts,
  q,
  extra,
}: {
  basePath: string;
  tabs: T[];
  current: T;
  labels: Record<T, string>;
  counts: Record<T, number>;
  q?: string;
  /** Other filters to keep when switching tabs, e.g. { source: 'website' }. */
  extra?: Record<string, string>;
}) {
  return (
    <SmoothTabs
      items={tabs.map((t) => ({
        href: `${basePath}?${new URLSearchParams({ status: t, ...(q ? { q } : {}), ...extra })}`,
        label: labels[t],
        count: counts[t],
        active: t === current,
      }))}
    />
  );
}

export function SearchBar({ status, q, placeholder, extra }: { status: string; q?: string; placeholder: string; extra?: Record<string, string> }) {
  return (
    <form className="search" role="search">
      <input type="hidden" name="status" value={status} />
      {Object.entries(extra ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label className="search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4-4" />
        </svg>
        <span className="sr-only">Search</span>
        <input name="q" type="search" defaultValue={q} placeholder={placeholder} />
      </label>
      <button className="a-btn a-btn-ghost a-btn-sm" type="submit">
        Search
      </button>
    </form>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="a-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="a-stars-off">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

export function Badge({ tone, children }: { tone: 'new' | 'warn' | 'ok' | 'muted' | 'danger'; children: React.ReactNode }) {
  return <span className={`a-badge a-badge-${tone}`}>{children}</span>;
}

export function Avatar({ name, size, dot }: { name: string; size?: 'lg'; dot?: boolean }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
  return (
    <span className={`avatar${size === 'lg' ? ' avatar-lg' : ''}`} aria-hidden="true">
      {initials}
      {dot && <i className="avatar-dot" />}
    </span>
  );
}

/** Truthful Google connection state: never "connected" in demo mode or without a successful sync. */
export function GoogleStatus({ stats, demo }: { stats: GoogleStats; demo: boolean }) {
  if (demo) return <Badge tone="muted">Demo data · not saved</Badge>;
  if (stats.lastSyncStatus === 'ok' && stats.lastSyncAt) return <Badge tone="ok">{`Google import ${timeAgo(stats.lastSyncAt)}`}</Badge>;
  if (stats.lastSyncStatus === 'error') return <Badge tone="danger">Last import failed</Badge>;
  return <Badge tone="muted">No Google import yet</Badge>;
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {text && <p className="muted">{text}</p>}
    </div>
  );
}
