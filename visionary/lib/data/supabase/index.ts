import 'server-only';
import type { DataLayer, EnquiriesRepo, ReviewsRepo, StatsRepo } from '../repos';
import type { Enquiry, EnquiryReply, EnquiryStatus, GoogleStats, Review, ReviewStatus } from '../../types';
import { shortName, splitTranslation } from '../../reviews';
import { serviceClient } from '../../supabase/admin';

// Supabase implementation of the repositories. Same interfaces as ./mock; selected when DATA_SOURCE=supabase.
// All queries name their columns explicitly (no select('*') on personal data).

type ReviewRow = {
  id: string; source: Review['source']; google_review_id: string | null; author_name: string; author_photo_url: string | null;
  rating: number; original_text: string; review_date: string; display_name: string; display_text: string | null; is_edited: boolean;
  status: ReviewStatus; featured: boolean; sort_order: number; phone: string | null; synced_at: string; updated_at: string;
};
const REVIEW_COLS =
  'id, source, google_review_id, author_name, author_photo_url, rating, original_text, review_date, display_name, display_text, is_edited, status, featured, sort_order, phone, synced_at, updated_at';

const toReview = (r: ReviewRow): Review => ({
  id: r.id, source: r.source, googleReviewId: r.google_review_id, authorName: r.author_name, authorPhotoUrl: r.author_photo_url,
  rating: r.rating as Review['rating'], originalText: r.original_text, reviewDate: r.review_date, displayName: r.display_name,
  displayText: r.display_text, isEdited: r.is_edited, status: r.status, featured: r.featured, sortOrder: r.sort_order, phone: r.phone,
  syncedAt: r.synced_at, updatedAt: r.updated_at,
});

type EnquiryRow = {
  id: string; name: string; phone: string; interest: Enquiry['interest']; message: string; status: EnquiryStatus;
  created_at: string; opened_at: string | null; replied_at: string | null;
  enquiry_replies?: { id: string; body: string; channel: 'whatsapp'; logged_at: string; confirmed: boolean }[];
};
const ENQUIRY_COLS = 'id, name, phone, interest, message, status, created_at, opened_at, replied_at, enquiry_replies (id, body, channel, logged_at, confirmed)';

const toEnquiry = (e: EnquiryRow): Enquiry => ({
  id: e.id, name: e.name, phone: e.phone, interest: e.interest, message: e.message, status: e.status, createdAt: e.created_at,
  openedAt: e.opened_at, repliedAt: e.replied_at,
  replies: (e.enquiry_replies ?? [])
    .map((r): EnquiryReply => ({ id: r.id, body: r.body, channel: r.channel, loggedAt: r.logged_at, confirmed: r.confirmed }))
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt)),
});

const db = () => serviceClient();
const now = () => new Date().toISOString();
const reviewStatuses: ReviewStatus[] = ['pending', 'approved', 'live', 'hidden', 'removed'];
const enquiryStatuses: EnquiryStatus[] = ['new', 'awaiting_reply', 'replied', 'archived'];

/** Throws a generic error (details stay in the server log, never sent to the browser). */
function check<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) {
    console.error(`[supabase] ${what}: ${res.error.message}`);
    throw new Error(`Database error (${what})`);
  }
  return res.data;
}

/** A search term as a quoted PostgREST ilike value: wildcards, quotes and filter syntax characters are stripped. */
const like = (q: string) => `"%${q.replace(/[%_,()"\\]/g, ' ').trim().slice(0, 80)}%"`;

const reviews: ReviewsRepo = {
  async list({ status, q, rating, source, page = 1, perPage = 50 } = {}) {
    let query = db().from('reviews').select(REVIEW_COLS, { count: 'exact' });
    if (status) query = query.eq('status', status);
    if (rating) query = query.eq('rating', rating);
    if (source) query = query.eq('source', source);
    if (q) query = query.or(`author_name.ilike.${like(q)},original_text.ilike.${like(q)},display_text.ilike.${like(q)}`);
    const from = (page - 1) * perPage;
    // id as a tiebreaker: imports can share timestamps, and pagination must be stable.
    const res = await query.order('review_date', { ascending: false }).order('id').range(from, from + perPage - 1);
    const rows = check(res, 'list reviews') as ReviewRow[];
    return { items: rows.map(toReview), total: res.count ?? rows.length };
  },
  async get(id) {
    const res = await db().from('reviews').select(REVIEW_COLS).eq('id', id).maybeSingle();
    const row = check(res, 'get review') as ReviewRow | null;
    return row ? toReview(row) : null;
  },
  async counts() {
    const entries = await Promise.all(
      reviewStatuses.map(async (s) => {
        const res = await db().from('reviews').select('id', { count: 'exact', head: true }).eq('status', s);
        check(res, 'count reviews');
        return [s, res.count ?? 0] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<ReviewStatus, number>;
  },
  async listPublic(limit = 6) {
    // Only public columns: never the phone or the author's full name.
    const res = await db()
      .from('reviews')
      .select('id, source, display_name, rating, review_date, display_text, original_text')
      .eq('status', 'live')
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('review_date', { ascending: false })
      .limit(limit);
    const rows = check(res, 'public reviews') as Pick<ReviewRow, 'id' | 'source' | 'display_name' | 'rating' | 'review_date' | 'display_text' | 'original_text'>[];
    return rows.map((r) => ({
      id: r.id, source: r.source, displayName: r.display_name, rating: r.rating as Review['rating'], reviewDate: r.review_date,
      text: r.display_text ?? r.original_text,
    }));
  },
  async setStatus(ids, status) {
    if (!ids.length) return;
    check(await db().from('reviews').update({ status, updated_at: now() }).in('id', ids), 'update review status');
  },
  async updateDisplay(id, patch) {
    const res = await db()
      .from('reviews')
      .update({
        display_name: patch.displayName, display_text: patch.displayText, featured: patch.featured, sort_order: patch.sortOrder,
        is_edited: patch.displayText !== null, updated_at: now(),
      })
      .eq('id', id)
      .select(REVIEW_COLS)
      .single();
    return toReview(check(res, 'update review') as ReviewRow);
  },
  async pendingWebsiteCount(phone) {
    const res = await db().from('reviews').select('id', { count: 'exact', head: true }).eq('source', 'website').eq('status', 'pending').eq('phone', phone);
    check(res, 'count pending website reviews');
    return res.count ?? 0;
  },
  async createWebsite({ authorName, rating, text, phone }) {
    const t = now();
    check(
      await db().from('reviews').insert({
        source: 'website', author_name: authorName, rating, original_text: text, review_date: t, display_name: shortName(authorName),
        status: 'pending', phone, synced_at: t, updated_at: t,
      }),
      'create website review',
    );
  },
  async importGoogle(items, { dryRun = false, approveFiveStar = false } = {}) {
    // Look up which IDs we already have (any status) in chunks.
    const known = new Map<string, ReviewStatus>();
    const ids = items.map((i) => i.googleReviewId);
    // 80 ids per lookup keeps the request URL well under gateway limits (ids are ~40–70 characters).
    for (let i = 0; i < ids.length; i += 80) {
      const res = await db().from('reviews').select('google_review_id, status').in('google_review_id', ids.slice(i, i + 80));
      for (const r of check(res, 'lookup imported reviews') as { google_review_id: string; status: ReviewStatus }[]) known.set(r.google_review_id, r.status);
    }
    const summary = { total: items.length, added: 0, existing: 0, blocked: 0 };
    const fresh = items.filter((it) => {
      const s = known.get(it.googleReviewId);
      if (s === 'removed') summary.blocked++;
      else if (s) summary.existing++;
      else return true;
      return false;
    });
    summary.added = fresh.length;
    if (dryRun || !fresh.length) return summary;

    const t = now();
    const rows = fresh.map((it) => {
      const english = splitTranslation(it.text).english;
      return {
        source: 'google', google_review_id: it.googleReviewId, author_name: it.authorName, rating: it.rating, original_text: it.text,
        review_date: it.reviewDate, display_name: shortName(it.authorName), display_text: english, is_edited: english !== null,
        status: approveFiveStar && it.rating === 5 ? 'approved' : 'pending', synced_at: t, updated_at: t,
      };
    });
    // ignoreDuplicates: a row that appeared in the meantime is left exactly as it is (never overwritten).
    for (let i = 0; i < rows.length; i += 500) {
      check(await db().from('reviews').upsert(rows.slice(i, i + 500), { onConflict: 'google_review_id', ignoreDuplicates: true }), 'import reviews');
    }
    return summary;
  },
};

const enquiries: EnquiriesRepo = {
  async create(input) {
    const res = await db().from('enquiries').insert({ name: input.name, phone: input.phone, interest: input.interest, message: input.message }).select(ENQUIRY_COLS).single();
    return toEnquiry(check(res, 'create enquiry') as EnquiryRow);
  },
  async list({ status, q } = {}) {
    let query = db().from('enquiries').select(ENQUIRY_COLS);
    if (status) query = query.eq('status', status);
    if (q) query = query.or(`name.ilike.${like(q)},phone.ilike.${like(q)},message.ilike.${like(q)}`);
    const res = await query.order('created_at', { ascending: false }).order('id').limit(500);
    return (check(res, 'list enquiries') as EnquiryRow[]).map(toEnquiry);
  },
  async get(id) {
    const res = await db().from('enquiries').select(ENQUIRY_COLS).eq('id', id).maybeSingle();
    const row = check(res, 'get enquiry') as EnquiryRow | null;
    return row ? toEnquiry(row) : null;
  },
  async counts() {
    const entries = await Promise.all(
      enquiryStatuses.map(async (s) => {
        const res = await db().from('enquiries').select('id', { count: 'exact', head: true }).eq('status', s);
        check(res, 'count enquiries');
        return [s, res.count ?? 0] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<EnquiryStatus, number>;
  },
  async markOpened(id) {
    check(await db().from('enquiries').update({ status: 'awaiting_reply', opened_at: now() }).eq('id', id).eq('status', 'new'), 'open enquiry');
  },
  async logWhatsAppAttempt(id, body, adminEmail) {
    check(await db().from('enquiry_replies').insert({ enquiry_id: id, body, channel: 'whatsapp', admin_email: adminEmail ?? null }), 'log reply');
    check(await db().from('enquiries').update({ status: 'awaiting_reply', opened_at: now() }).eq('id', id).eq('status', 'new'), 'open enquiry');
  },
  async confirmReplied(id) {
    const last = await db().from('enquiry_replies').select('id').eq('enquiry_id', id).order('logged_at', { ascending: false }).order('id', { ascending: false }).limit(1).maybeSingle();
    const row = check(last, 'find reply') as { id: string } | null;
    if (row) check(await db().from('enquiry_replies').update({ confirmed: true }).eq('id', row.id), 'confirm reply');
    check(await db().from('enquiries').update({ status: 'replied', replied_at: now() }).eq('id', id), 'mark replied');
  },
  async setStatus(id, status) {
    check(await db().from('enquiries').update({ status }).eq('id', id), 'set enquiry status');
  },
};

const stats: StatsRepo = {
  async get(): Promise<GoogleStats> {
    const [profile, run] = await Promise.all([
      db().from('google_profile_stats').select('rating, total_review_count').eq('id', 1).maybeSingle(),
      db().from('review_import_runs').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    const p = check(profile, 'google stats') as { rating: number | string | null; total_review_count: number | null } | null;
    const r = check(run, 'last import') as { created_at: string } | null;
    return {
      rating: p?.rating != null ? Number(p.rating) : null,
      totalReviews: p?.total_review_count ?? null,
      totalLabel: '2,500+',
      lastSyncAt: r?.created_at ?? null,
      lastSyncStatus: r ? 'ok' : 'never',
    };
  },
  async recordImport({ rating, totalReviews, summary, adminEmail }) {
    check(await db().from('review_import_runs').insert({ ...summary, rating, total_reviews: totalReviews, admin_email: adminEmail }), 'record import');
    check(
      await db().from('google_profile_stats').upsert({ id: 1, rating, total_review_count: totalReviews, fetched_at: now() }),
      'update google stats',
    );
  },
};

export const supabaseData: DataLayer = { source: 'supabase', reviews, enquiries, stats };
