import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { enquiries } from '@/lib/data';
import { customerWhatsAppLink, formatMyPhone, normaliseMyPhone } from '@/lib/phone';
import { formatDateTime } from '@/lib/format';
import { enquiryStatusLabel } from '@/lib/labels';
import type { EnquiryStatus } from '@/lib/types';
import { Avatar, Badge } from '@/components/admin/ui';
import ConfirmBar from '@/components/admin/ConfirmBar';
import MarkOpened from '@/components/admin/MarkOpened';
import WhatsAppReply from '@/components/admin/WhatsAppReply';
import { confirmRepliedAction, enquiryStatusAction } from '../actions';

export const metadata: Metadata = { title: 'Enquiry' };

const tone = (s: EnquiryStatus): 'new' | 'warn' | 'ok' | 'muted' => (s === 'new' ? 'new' : s === 'awaiting_reply' ? 'warn' : s === 'replied' ? 'ok' : 'muted');

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const e = await enquiries.get(id);
  if (!e) notFound();

  const waLink = customerWhatsAppLink(e.phone);
  const telDigits = normaliseMyPhone(e.phone);
  const unconfirmed = e.replies.length > 0 && !e.replies[e.replies.length - 1].confirmed;
  const archived = e.status === 'archived';
  const steps = [
    { label: 'Received', at: e.createdAt, done: true },
    { label: 'Opened', at: e.openedAt, done: !!e.openedAt || e.status !== 'new' },
    { label: 'Replied', at: e.repliedAt, done: e.status === 'replied' || !!e.repliedAt },
  ];

  return (
    <main className="admin-page">
      <MarkOpened id={e.id} status={e.status} />
      <Link href={`/admin/enquiries?status=${e.status}`} className="back">
        ← Back to {enquiryStatusLabel[e.status].toLowerCase()}
      </Link>

      <div className="workspace-shell">
        <aside className="ws-side" aria-label="Customer">
          <div className="ws-id">
            <Avatar name={e.name} size="lg" />
            <div>
              <h1>{e.name}</h1>
              <Badge tone={tone(e.status)}>{enquiryStatusLabel[e.status]}</Badge>
            </div>
          </div>

          <dl className="kv">
            <div>
              <dt>Phone / WhatsApp</dt>
              <dd>{formatMyPhone(e.phone)}</dd>
            </div>
            {e.interest && (
              <div>
                <dt>Interested in</dt>
                <dd>{e.interest}</dd>
              </div>
            )}
          </dl>

          <div className="ws-actions">
            {waLink && (
              <a className="a-btn a-btn-ghost a-btn-sm" href={waLink} target="_blank" rel="noreferrer">
                Open WhatsApp ↗
              </a>
            )}
            <a className="a-btn a-btn-ghost a-btn-sm" href={`tel:+${telDigits ?? e.phone}`}>
              Call
            </a>
          </div>

          <ol className="steps" aria-label="Enquiry progress">
            {steps.map((s) => (
              <li key={s.label} className={s.done ? 'done' : undefined}>
                <strong>{s.label}</strong>
                <span>{s.at ? formatDateTime(s.at) : s.done ? 'Done' : 'Pending'}</span>
              </li>
            ))}
          </ol>

          <div className="ws-manage">
            <form action={confirmRepliedAction.bind(null, e.id)}>
              <button className="a-btn a-btn-sm a-btn-ghost" type="submit" disabled={e.status === 'replied'}>
                Mark as replied
              </button>
            </form>
            <form action={enquiryStatusAction}>
              <input type="hidden" name="id" value={e.id} />
              <input type="hidden" name="status" value={archived ? 'awaiting_reply' : 'archived'} />
              <button className="a-btn a-btn-sm a-btn-ghost" type="submit">
                {archived ? 'Restore to inbox' : 'Archive'}
              </button>
            </form>
          </div>
        </aside>

        <section className="ws-main" aria-label="Conversation">
          <div className="thread">
            <div className="msg">
              <p className="msg-meta">
                {e.name} · {formatDateTime(e.createdAt)}
              </p>
              <p className="msg-body">{e.message}</p>
            </div>
            {e.replies.map((r) => (
              <div key={r.id} className="msg msg-out">
                <p className="msg-meta">
                  <Badge tone={r.confirmed ? 'ok' : 'warn'}>{r.confirmed ? 'Sent & confirmed' : 'WhatsApp opened, not confirmed'}</Badge>
                  {formatDateTime(r.loggedAt)}
                </p>
                <p className="msg-body">{r.body}</p>
              </div>
            ))}
          </div>

          <div className="composer">
            {unconfirmed && <ConfirmBar id={e.id} />}
            <WhatsAppReply id={e.id} customerName={e.name} waLink={waLink} />
          </div>
        </section>
      </div>
    </main>
  );
}
