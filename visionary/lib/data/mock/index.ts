// In-memory mock implementation of the repositories (frontend phase only).
// State lives on globalThis so it survives hot reloads, but it RESETS on server restart
// and is not shared between serverless instances. Do not use in production.
import type { DataLayer, EnquiriesRepo, ReviewsRepo, StatsRepo } from '../repos';
import type { Enquiry, EnquiryStatus, GoogleStats, Review, ReviewStatus } from '../../types';
import { shortName, splitTranslation } from '../../reviews';
import { buildSeedEnquiries, buildSeedReviews, buildSeedStats } from './seed';

type Store = { reviews: Review[]; enquiries: Enquiry[]; stats: GoogleStats; seq: number };

const g = globalThis as typeof globalThis & { __veMockStore?: Store };
const store: Store = (g.__veMockStore ??= {
  reviews: buildSeedReviews(),
  enquiries: buildSeedEnquiries(),
  stats: buildSeedStats(),
  seq: 1000,
});

const now = () => new Date().toISOString();
const nextId = (prefix: string) => `${prefix}_${++store.seq}`;
const clone = <T>(v: T): T => structuredClone(v);
const matches = (q: string | undefined, ...fields: (string | null)[]) =>
  !q || fields.some((f) => f?.toLowerCase().includes(q.toLowerCase()));

const reviewStatuses: ReviewStatus[] = ['pending', 'approved', 'live', 'hidden', 'removed'];
const enquiryStatuses: EnquiryStatus[] = ['new', 'awaiting_reply', 'replied', 'archived'];

const reviews: ReviewsRepo = {
  async list({ status, q, rating, source, page = 1, perPage = 50 } = {}) {
    const all = store.reviews
      .filter((r) => (!status || r.status === status) && (!rating || r.rating === rating) && (!source || r.source === source))
      .filter((r) => matches(q, r.authorName, r.originalText, r.displayText))
      .sort((a, b) => b.reviewDate.localeCompare(a.reviewDate));
    return { items: clone(all.slice((page - 1) * perPage, page * perPage)), total: all.length };
  },
  async get(id) {
    return clone(store.reviews.find((r) => r.id === id) ?? null);
  },
  async counts() {
    return Object.fromEntries(reviewStatuses.map((s) => [s, store.reviews.filter((r) => r.status === s).length])) as Record<
      ReviewStatus,
      number
    >;
  },
  async listPublic(limit = 6) {
    return store.reviews
      .filter((r) => r.status === 'live')
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder || b.reviewDate.localeCompare(a.reviewDate))
      .slice(0, limit)
      .map((r) => ({ id: r.id, source: r.source, displayName: r.displayName, rating: r.rating, reviewDate: r.reviewDate, text: r.displayText ?? r.originalText }));
  },
  async setStatus(ids, status) {
    for (const r of store.reviews) if (ids.includes(r.id)) Object.assign(r, { status, updatedAt: now() });
  },
  async updateDisplay(id, patch) {
    const r = store.reviews.find((x) => x.id === id);
    if (!r) throw new Error('Review not found');
    Object.assign(r, patch, { isEdited: patch.displayText !== null, updatedAt: now() });
    return clone(r);
  },
  async pendingWebsiteCount(phone) {
    return store.reviews.filter((r) => r.source === 'website' && r.status === 'pending' && r.phone === phone).length;
  },
  async createWebsite({ authorName, rating, text, phone }) {
    const t = now();
    store.reviews.push({
      id: nextId('rev'), source: 'website', googleReviewId: null, authorName, authorPhotoUrl: null, rating, originalText: text,
      reviewDate: t, displayName: shortName(authorName), displayText: null, isEdited: false, status: 'pending',
      featured: false, sortOrder: 0, phone, syncedAt: t, updatedAt: t,
    });
  },
  async importGoogle(items, { dryRun = false, approveFiveStar = false } = {}) {
    const known = new Map(store.reviews.filter((r) => r.googleReviewId).map((r) => [r.googleReviewId, r.status]));
    const summary = { total: items.length, added: 0, existing: 0, blocked: 0 };
    for (const it of items) {
      const status = known.get(it.googleReviewId);
      if (status === 'removed') summary.blocked++;
      else if (status) summary.existing++;
      else {
        summary.added++;
        if (dryRun) continue;
        const t = now();
        const english = splitTranslation(it.text).english;
        store.reviews.push({
          id: nextId('rev'), source: 'google', googleReviewId: it.googleReviewId, authorName: it.authorName, authorPhotoUrl: null,
          rating: it.rating, originalText: it.text, reviewDate: it.reviewDate, displayName: shortName(it.authorName),
          displayText: english, isEdited: english !== null, status: approveFiveStar && it.rating === 5 ? 'approved' : 'pending',
          featured: false, sortOrder: 0, phone: null,
          syncedAt: t, updatedAt: t,
        });
        known.set(it.googleReviewId, 'pending');
      }
    }
    return summary;
  },
};

const enquiries: EnquiriesRepo = {
  async create(input) {
    const e: Enquiry = { ...input, id: nextId('enq'), status: 'new', createdAt: now(), openedAt: null, repliedAt: null, replies: [] };
    store.enquiries.push(e);
    return clone(e);
  },
  async list({ status, q } = {}) {
    return clone(
      store.enquiries
        .filter((e) => !status || e.status === status)
        .filter((e) => matches(q, e.name, e.phone, e.message))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },
  async get(id) {
    return clone(store.enquiries.find((e) => e.id === id) ?? null);
  },
  async counts() {
    return Object.fromEntries(enquiryStatuses.map((s) => [s, store.enquiries.filter((e) => e.status === s).length])) as Record<
      EnquiryStatus,
      number
    >;
  },
  async markOpened(id) {
    const e = store.enquiries.find((x) => x.id === id);
    if (e && e.status === 'new') Object.assign(e, { status: 'awaiting_reply', openedAt: now() });
  },
  async logWhatsAppAttempt(id, body) {
    const e = store.enquiries.find((x) => x.id === id);
    if (!e) throw new Error('Enquiry not found');
    e.replies.push({ id: nextId('rep'), body, channel: 'whatsapp', loggedAt: now(), confirmed: false });
    if (e.status === 'new') Object.assign(e, { status: 'awaiting_reply', openedAt: now() });
  },
  async confirmReplied(id) {
    const e = store.enquiries.find((x) => x.id === id);
    if (!e) throw new Error('Enquiry not found');
    const last = e.replies[e.replies.length - 1];
    if (last) last.confirmed = true;
    Object.assign(e, { status: 'replied', repliedAt: now() });
  },
  async setStatus(id, status) {
    const e = store.enquiries.find((x) => x.id === id);
    if (!e) throw new Error('Enquiry not found');
    e.status = status;
  },
  async purgeOlderThan(cutoff) {
    const before = store.enquiries.length;
    store.enquiries = store.enquiries.filter((e) => new Date(e.createdAt) >= cutoff);
    return before - store.enquiries.length;
  },
};

const stats: StatsRepo = {
  async get() {
    return clone(store.stats);
  },
  async recordImport({ rating, totalReviews }) {
    Object.assign(store.stats, { rating, totalReviews, lastSyncAt: now(), lastSyncStatus: 'ok' });
  },
};

export const mockData: DataLayer = { source: 'mock', reviews, enquiries, stats };
