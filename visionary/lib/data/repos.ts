// Repository interfaces. The UI and Server Actions depend ONLY on these.
// Implementations: ./mock (frontend phase) and ./supabase (Phase B, same interfaces).
import type {
  Enquiry,
  EnquiryCounts,
  EnquiryStatus,
  GoogleImportItem,
  GoogleStats,
  ImportSummary,
  NewEnquiry,
  NewWebsiteReview,
  PublicReview,
  Review,
  ReviewCounts,
  ReviewSource,
  ReviewStatus,
} from '../types';

export type ReviewListQuery = { status?: ReviewStatus; q?: string; rating?: number; source?: ReviewSource; page?: number; perPage?: number };
export type ReviewPage = { items: Review[]; total: number };

export interface ReviewsRepo {
  /** Newest first, paginated (page is 1-based; default 50 per page). */
  list(query?: ReviewListQuery): Promise<ReviewPage>;
  get(id: string): Promise<Review | null>;
  counts(): Promise<ReviewCounts>;
  /** Live reviews for the public site: featured first, then sortOrder, then newest. */
  listPublic(limit?: number): Promise<PublicReview[]>;
  setStatus(ids: string[], status: ReviewStatus): Promise<void>;
  updateDisplay(
    id: string,
    patch: { displayName: string; displayText: string | null; featured: boolean; sortOrder: number },
  ): Promise<Review>;
  /** How many website reviews from this phone are still waiting for approval (spam cap). */
  pendingWebsiteCount(phone: string): Promise<number>;
  /** A review from our website form. Always arrives as `pending`. */
  createWebsite(input: NewWebsiteReview): Promise<void>;
  /** Google Takeout import: inserts new reviews as `pending`; never touches existing or removed ones.
   *  dryRun = only count what would happen. */
  importGoogle(items: GoogleImportItem[], opts?: { dryRun?: boolean; approveFiveStar?: boolean }): Promise<ImportSummary>;
}

export type EnquiryListQuery = { status?: EnquiryStatus; q?: string };

export interface EnquiriesRepo {
  create(input: NewEnquiry): Promise<Enquiry>;
  list(query?: EnquiryListQuery): Promise<Enquiry[]>;
  get(id: string): Promise<Enquiry | null>;
  counts(): Promise<EnquiryCounts>;
  /** new -> awaiting_reply (no-op for other statuses). */
  markOpened(id: string): Promise<void>;
  /** Owner clicked "Reply on WhatsApp": store the message as an unconfirmed reply. */
  logWhatsAppAttempt(id: string, body: string, adminEmail?: string): Promise<void>;
  /** Owner confirmed the latest reply was sent: -> replied. */
  confirmReplied(id: string): Promise<void>;
  setStatus(id: string, status: EnquiryStatus): Promise<void>;
}

export interface StatsRepo {
  get(): Promise<GoogleStats>;
  /** Store the rating + count read from a Google export and mark the import time. */
  recordImport(input: { rating: number; totalReviews: number; summary: ImportSummary; adminEmail: string }): Promise<void>;
}

export type DataLayer = {
  source: 'mock' | 'supabase';
  reviews: ReviewsRepo;
  enquiries: EnquiriesRepo;
  stats: StatsRepo;
};
