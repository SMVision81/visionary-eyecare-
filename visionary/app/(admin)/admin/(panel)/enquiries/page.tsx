import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { enquiryRetentionMonths } from '@/lib/site';
import { enquiries } from '@/lib/data';
import { formatMyPhone } from '@/lib/phone';
import { timeAgo } from '@/lib/format';
import { enquiryStatusLabel, enquiryTabs } from '@/lib/labels';
import type { EnquiryStatus } from '@/lib/types';
import { Avatar, Badge, EmptyState, PageHeader, SearchBar, StatusTabs } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'Enquiries' };

const validStatus = (s?: string): s is EnquiryStatus => enquiryTabs.includes(s as EnquiryStatus);
const tone = (s: EnquiryStatus): 'new' | 'warn' | 'ok' | 'muted' => (s === 'new' ? 'new' : s === 'awaiting_reply' ? 'warn' : s === 'replied' ? 'ok' : 'muted');

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = validStatus(sp.status) ? sp.status : 'new';
  const q = sp.q?.trim() || undefined;

  const [list, counts] = await Promise.all([enquiries.list({ status, q }), enquiries.counts()]);

  return (
    <main className="admin-page">
      <PageHeader title="Enquiries" subtitle={`Messages customers sent through the website. Reply on WhatsApp from each enquiry. Enquiries are deleted automatically after ${enquiryRetentionMonths} months.`} />

      <div className="toolbar">
        <StatusTabs basePath="/admin/enquiries" tabs={enquiryTabs} current={status} labels={enquiryStatusLabel} counts={counts} q={q} />
        <SearchBar status={status} q={q} placeholder="Name, phone or message" />
      </div>

      {list.length ? (
        <div className="surface">
          <div className="rows-head row-grid" aria-hidden="true">
            <span className="c-cust">Customer</span>
            <span className="c-interest">Interest</span>
            <span className="c-msg">Message</span>
            <span className="c-status">Status</span>
            <span className="c-time">Received</span>
          </div>
          <ul className="rows">
            {list.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className={`row-link row-grid${e.status === 'new' ? ' is-unread' : ''}`}>
                  <span className="c-cust">
                    <Avatar name={e.name} dot={e.status === 'new'} />
                    <span className="cust-text">
                      <strong>{e.name}</strong>
                      <span className="muted">{formatMyPhone(e.phone)}</span>
                    </span>
                  </span>
                  <span className="c-interest muted">{e.interest ?? '—'}</span>
                  <span className="c-msg clamp-2">{e.message}</span>
                  <span className="c-status">
                    <Badge tone={tone(e.status)}>{enquiryStatusLabel[e.status]}</Badge>
                  </span>
                  <span className="c-time muted">{timeAgo(e.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          title={`No ${enquiryStatusLabel[status].toLowerCase()} enquiries`}
          text={q ? `Nothing matches “${q}”.` : status === 'new' ? 'New customer enquiries will appear here.' : undefined}
        />
      )}
    </main>
  );
}
