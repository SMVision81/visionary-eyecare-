import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { isDemoData, reviews, stats } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { reviewStatusLabel, reviewTabs } from '@/lib/labels';
import { reviewSourceLabels, type Review, type ReviewSource, type ReviewStatus } from '@/lib/types';
import { Badge, EmptyState, GoogleStatus, PageHeader, SearchBar, Stars, StatusTabs } from '@/components/admin/ui';
import ConfirmButton from '@/components/admin/ConfirmButton';
import SelectAll from '@/components/admin/SelectAll';
import { reviewStatusAction } from './actions';

export const metadata: Metadata = { title: 'Reviews' };

const validStatus = (s?: string): s is ReviewStatus => reviewTabs.includes(s as ReviewStatus);
const validSource = (s?: string): s is ReviewSource => s === 'google' || s === 'website';
const PER_PAGE = 50;

const sourceFilters: { value: ReviewSource | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'google', label: 'Google' },
  { value: 'website', label: 'Website' },
];

function RowActions({ r }: { r: Review }) {
  return (
    <div className="row-actions">
      {(r.status === 'pending' || r.status === 'hidden') && (
        <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value={`approved:${r.id}`} title="Approve — adds it to the approved pool, not on the website yet">
          Approve
        </button>
      )}
      {r.status === 'approved' && (
        <button className="a-btn a-btn-sm a-btn-primary" type="submit" name="op" value={`live:${r.id}`} title="Show this review on the website">
          Put on website
        </button>
      )}
      {r.status === 'approved' && (
        <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value={`hidden:${r.id}`} title="Move to hidden">
          Hide
        </button>
      )}
      {r.status === 'live' && (
        <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value={`approved:${r.id}`} title="Take off the website (stays approved)">
          Take off
        </button>
      )}
      {r.status === 'removed' && (
        <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value={`hidden:${r.id}`} title="Bring back as hidden; you can approve it again">
          Restore
        </button>
      )}
      {r.status !== 'removed' && (
        <ConfirmButton
          op={`removed:${r.id}`}
          label="Remove"
          confirmText="Remove from website?"
          variant="danger"
          title={r.source === 'google' ? 'Delete from the website. The next Google import will not bring it back.' : 'Delete from the website.'}
        />
      )}
    </div>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = validStatus(sp.status) ? sp.status : 'pending';
  const q = sp.q?.trim() || undefined;
  const source = validSource(sp.source) ? sp.source : undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const extra: Record<string, string> = source ? { source } : {};

  const [{ items: list, total }, counts, google] = await Promise.all([
    reviews.list({ status, q, source, page, perPage: PER_PAGE }),
    reviews.counts(),
    stats.get(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const pageHref = (p: number) => `/admin/reviews?${new URLSearchParams({ status, ...(q ? { q } : {}), ...extra, page: String(p) })}`;

  return (
    <main className="admin-page">
      <PageHeader
        title="Reviews"
        subtitle="Google reviews (imported) and reviews written on the website. Approve, then choose which go live — the site shows up to 25."
        actions={
          <>
            <GoogleStatus stats={google} demo={isDemoData} />
            <Link className="a-btn a-btn-ghost a-btn-sm" href="/admin/reviews/import">
              Import from Google
            </Link>
          </>
        }
      />

      <div className="toolbar">
        <StatusTabs basePath="/admin/reviews" tabs={reviewTabs} current={status} labels={reviewStatusLabel} counts={counts} q={q} extra={extra} />
        <SearchBar status={status} q={q} placeholder="Name or review text" extra={extra} />
      </div>
      <nav className="source-filter" aria-label="Review source">
        {sourceFilters.map((f) => (
          <Link
            key={f.label}
            href={`/admin/reviews?${new URLSearchParams({ status, ...(q ? { q } : {}), ...(f.value ? { source: f.value } : {}) })}`}
            aria-current={f.value === source ? 'page' : undefined}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <form action={reviewStatusAction} className="reviews-form">
        {list.length > 1 && <SelectAll key={`${status}-${source ?? 'all'}-${page}-${q ?? ''}`} count={list.length} />}
        {list.length ? (
          <div className="surface">
            <ul className="rows">
              {list.map((r) => (
                <li key={r.id} className="rv">
                  <label className="rv-check">
                    <input type="checkbox" name="ids" value={r.id} />
                    <span className="sr-only">Select review by {r.authorName}</span>
                  </label>
                  <div className="rv-body">
                    <div className="rv-top">
                      <Stars rating={r.rating} />
                      <span className="muted">
                        {r.authorName} · {formatDate(r.reviewDate)}
                      </span>
                      <Badge tone={r.source === 'website' ? 'new' : 'muted'}>{reviewSourceLabels[r.source]}</Badge>
                      {r.featured && <Badge tone="warn">Featured</Badge>}
                      {r.isEdited && <Badge tone="muted">Edited</Badge>}
                    </div>
                    <Link href={`/admin/reviews/${r.id}?${new URLSearchParams({ from: pageHref(page) })}`} className="rv-link clamp-3">
                      “{r.displayText ?? r.originalText}”
                    </Link>
                  </div>
                  <RowActions r={r} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState title={`No ${reviewStatusLabel[status].toLowerCase()} reviews`} text={q ? `Nothing matches “${q}”.` : undefined} />
        )}
        {pages > 1 && (
          <nav className="pager" aria-label="Pages">
            {page > 1 && <Link href={pageHref(page - 1)}>← Newer</Link>}
            <span>
              Page {page} of {pages} · {total.toLocaleString('en-MY')} reviews
            </span>
            {page < pages && <Link href={pageHref(page + 1)}>Older →</Link>}
          </nav>
        )}

        <div className="bulk-bar" role="group" aria-label="Actions for selected reviews">
          <span className="bulk-hint">Apply to selected reviews</span>
          <button className="a-btn a-btn-sm a-btn-primary" type="submit" name="op" value="live:bulk">
            Put on website
          </button>
          <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value="approved:bulk">
            Approve selected
          </button>
          <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value="hidden:bulk">
            Hide selected
          </button>
        </div>
      </form>
    </main>
  );
}
