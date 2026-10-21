import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { reviews } from '@/lib/data';
import { formatDateTime } from '@/lib/format';
import { reviewStatusLabel } from '@/lib/labels';
import { reviewSourceLabels, type ReviewStatus } from '@/lib/types';
import { Badge, Stars } from '@/components/admin/ui';
import ConfirmButton from '@/components/admin/ConfirmButton';
import ReviewEditor from '@/components/admin/ReviewEditor';
import { reviewStatusAction } from '../actions';

export const metadata: Metadata = { title: 'Review' };

const tone: Record<ReviewStatus, 'new' | 'warn' | 'ok' | 'muted'> = {
  pending: 'warn',
  approved: 'new',
  live: 'ok',
  hidden: 'muted',
  removed: 'muted',
};

export default async function ReviewDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const review = await reviews.get(id);
  if (!review) notFound();
  // Return to the exact list (filter, source, page) the owner came from; only admin paths are accepted.
  const from = (await searchParams).from;
  const back = from?.startsWith('/admin/reviews') ? from : '/admin/reviews?status=' + review.status;

  return (
    <main className="admin-page">
      <p>
        <Link href={back} className="link">
          ← Back to reviews
        </Link>
      </p>

      <div className="detail-head">
        <h1>{review.authorName}</h1>
        <Stars rating={review.rating} />
        <Badge tone={tone[review.status]}>{reviewStatusLabel[review.status]}</Badge>
        <Badge tone={review.source === 'website' ? 'new' : 'muted'}>{reviewSourceLabels[review.source]}</Badge>
        {review.isEdited && <Badge tone="muted">Edited</Badge>}
      </div>
      <p className="muted">
        {review.source === 'google'
          ? `Left on Google ${formatDateTime(review.reviewDate)} · Imported ${formatDateTime(review.syncedAt)}`
          : `Written on the website ${formatDateTime(review.reviewDate)}`}
      </p>
      {review.source === 'website' && review.phone && (
        <p className="muted">
          Private contact (never shown on the website): <a className="link" href={`tel:${review.phone.replace(/[^\d+]/g, '')}`}>{review.phone}</a>
        </p>
      )}

      <form action={reviewStatusAction} className="row-actions row-actions-top">
        {(review.status === 'pending' || review.status === 'hidden') && (
          <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value={`approved:${review.id}`}>
            Approve
          </button>
        )}
        {review.status === 'approved' && (
          <button className="a-btn a-btn-sm a-btn-primary" type="submit" name="op" value={`live:${review.id}`}>
            Put on website
          </button>
        )}
        {review.status === 'live' && (
          <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value={`approved:${review.id}`}>
            Take off website
          </button>
        )}
        {review.status === 'removed' && (
          <button className="a-btn a-btn-sm a-btn-ghost" type="submit" name="op" value={`hidden:${review.id}`}>
            Restore as hidden
          </button>
        )}
        {review.status !== 'removed' && <ConfirmButton op={`removed:${review.id}`} label="Remove" confirmText="Remove from website?" variant="danger" />}
        <input type="hidden" name="redirectTo" value={back} />
      </form>

      <div className="review-compare">
        <section className="panel">
          <h2 className="panel-sub">Original {reviewSourceLabels[review.source].toLowerCase()}</h2>
          <p className="muted small">
            Read-only — the customer’s words exactly as written{review.source === 'google' ? ' on Google' : ' on your website'}.
          </p>
          <blockquote className="orig-quote">{review.originalText}</blockquote>
        </section>
        <section className="panel">
          <h2 className="panel-sub">Shown on your website</h2>
          <ReviewEditor review={review} publish={review.status !== 'live'} />
        </section>
      </div>
    </main>
  );
}
