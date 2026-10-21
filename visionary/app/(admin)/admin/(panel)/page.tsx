import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { enquiries, isDemoData, reviews, stats } from '@/lib/data';
import { formatDate, timeAgo, todayLabel } from '@/lib/format';
import { formatMyPhone } from '@/lib/phone';
import { enquiryStatusLabel } from '@/lib/labels';
import type { Enquiry } from '@/lib/types';
import { Avatar, Badge, EmptyState, GoogleStatus, PageHeader, Stars } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'Dashboard' };

const newestFirst = (a: Enquiry, b: Enquiry) => b.createdAt.localeCompare(a.createdAt);

export default async function Dashboard() {
  await requireAdmin();
  const [eCounts, rCounts, google, newList, awaitingList, pending] = await Promise.all([
    enquiries.counts(),
    reviews.counts(),
    stats.get(),
    enquiries.list({ status: 'new' }),
    enquiries.list({ status: 'awaiting_reply' }),
    reviews.list({ status: 'pending', perPage: 3 }),
  ]);
  const unanswered = [...newList, ...awaitingList].sort(newestFirst);
  const recent = unanswered.slice(0, 5);
  const oldest = unanswered[unanswered.length - 1];
  const latestNew = [...newList].sort(newestFirst)[0];
  const latestPending = pending.items[0];

  return (
    <main className="admin-page">
      <PageHeader title="Dashboard" subtitle={`${todayLabel()} · what needs your attention`} />

      <div className="dash">
        <Link href="/admin/enquiries?status=new" className="kpi kpi-hero">
          <span className="kpi-label">New enquiries</span>
          <span className="kpi-value">{eCounts.new}</span>
          <span className="kpi-meta">
            {latestNew ? (
              <>
                Latest: <strong>{latestNew.name}</strong> · {timeAgo(latestNew.createdAt)}
              </>
            ) : (
              'No unopened enquiries'
            )}
          </span>
          <span className="kpi-cta">
            Open inbox <span aria-hidden="true">→</span>
          </span>
        </Link>

        <Link href="/admin/enquiries?status=awaiting_reply" className="kpi kpi-warn">
          <span className="kpi-label">Not yet replied</span>
          <span className="kpi-value">{eCounts.awaiting_reply}</span>
          <span className="kpi-meta">{oldest ? `Oldest unanswered: ${timeAgo(oldest.createdAt)}` : 'Nothing waiting'}</span>
        </Link>

        <Link href="/admin/reviews?status=pending" className="kpi kpi-review">
          <span className="kpi-label">Reviews to approve</span>
          <span className="kpi-value">{rCounts.pending}</span>
          <span className="kpi-meta">{latestPending ? `Latest from ${latestPending.authorName}` : 'All reviewed'}</span>
        </Link>

        <section className="kpi kpi-live" aria-label="Website reviews and Google connection">
          <Link href="/admin/reviews?status=live" className="live-count">
            <span className="kpi-value">{rCounts.live}</span>
            <span className="kpi-label">Reviews live on website</span>
          </Link>
          <div className="live-google">
            <dl>
              <div>
                <dt>Google rating</dt>
                <dd>{google.rating !== null ? google.rating.toFixed(1) : '—'}</dd>
              </div>
              <div>
                <dt>Total reviews</dt>
                <dd>{google.totalReviews?.toLocaleString('en-MY') ?? google.totalLabel}</dd>
              </div>
            </dl>
            <div className="live-actions">
              <GoogleStatus stats={google} demo={isDemoData} />
              <Link className="a-btn a-btn-ghost a-btn-sm" href="/admin/reviews/import">
                Import from Google
              </Link>
            </div>
          </div>
        </section>

        <section className="surface dash-enq" aria-labelledby="recent-enq">
          <div className="surface-head">
            <h2 id="recent-enq">Recent enquiries</h2>
            <Link href="/admin/enquiries" className="link">
              View all →
            </Link>
          </div>
          {recent.length ? (
            <ul className="rows">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="row-mini">
                    <Avatar name={e.name} dot={e.status === 'new'} />
                    <span className="row-mini-main">
                      <strong>{e.name}</strong>
                      <span className="muted clamp-1">{e.message}</span>
                    </span>
                    <span className="row-mini-meta">
                      <Badge tone={e.status === 'new' ? 'new' : 'warn'}>{enquiryStatusLabel[e.status]}</Badge>
                      <span className="muted">
                        {formatMyPhone(e.phone)} · {timeAgo(e.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="All caught up" text="No enquiries are waiting for a reply." />
          )}
        </section>

        <section className="surface dash-rev" aria-labelledby="pending-rev">
          <div className="surface-head">
            <h2 id="pending-rev">Waiting for approval</h2>
            <Link href="/admin/reviews?status=pending" className="link">
              Moderate →
            </Link>
          </div>
          {pending.items.length ? (
            <ul className="rows">
              {pending.items.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/reviews/${r.id}`} className="rv-mini">
                    <Stars rating={r.rating} />
                    <p className="rv-quote clamp-3">“{r.displayText ?? r.originalText}”</p>
                    <span className="rv-by">
                      {r.authorName} · {formatDate(r.reviewDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No reviews waiting" text="New Google imports and reviews written on the website appear here for approval." />
          )}
        </section>
      </div>
    </main>
  );
}
