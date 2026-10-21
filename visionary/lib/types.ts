// Domain types shared by the public site, admin panel and data layer.
// Field names mirror the planned Supabase tables (snake_case in SQL, camelCase here).

/** pending = waiting for owner; approved = vetted, not on the site yet; live = shown on the website;
 *  hidden = not shown (restorable); removed = deleted from the website, kept as a tombstone so the next
 *  Google import never brings it back. */
export type ReviewStatus = 'pending' | 'approved' | 'live' | 'hidden' | 'removed';

/** google = imported from the Business Profile (Takeout); website = written on our own review form. */
export type ReviewSource = 'google' | 'website';
export const reviewSourceLabels: Record<ReviewSource, string> = { google: 'Google review', website: 'Website review' };

export type Review = {
  id: string;
  source: ReviewSource;
  /** Google's own review ID (stable across exports). null for website reviews. */
  googleReviewId: string | null;
  authorName: string;
  authorPhotoUrl: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Exactly as written (on Google or on our form). Never modified. */
  originalText: string;
  reviewDate: string; // ISO
  /** Name shown on the website, e.g. "Aina M." */
  displayName: string;
  /** Excerpt / light typo fixes shown on the website. null = show originalText. */
  displayText: string | null;
  isEdited: boolean;
  status: ReviewStatus;
  featured: boolean;
  sortOrder: number;
  /** Website reviews only: the reviewer's phone, PRIVATE (admin only, never on the public site). */
  phone: string | null;
  syncedAt: string;
  updatedAt: string;
};

/** The only review shape that may reach the public site (no phone, no internal fields). */
export type PublicReview = Pick<Review, 'id' | 'displayName' | 'rating' | 'reviewDate' | 'source'> & { text: string };

/** A review written on our website form, after validation. */
export type NewWebsiteReview = { authorName: string; rating: Review['rating']; text: string; phone: string };

/** One review from a Google Takeout export, reduced to what we store. */
export type GoogleImportItem = { googleReviewId: string; authorName: string; rating: Review['rating']; text: string; reviewDate: string };

export type ImportSummary = {
  /** Reviews with text in the export. */
  total: number;
  added: number;
  /** Already in the database (any status): left untouched. */
  existing: number;
  /** Previously removed by the owner: never re-imported. */
  blocked: number;
};

export type GoogleStats = {
  /** Overall Google rating. null until known from the Business Profile (never invent it). */
  rating: number | null;
  totalReviews: number | null;
  /** Label used when the exact count is unknown, e.g. "2,500+". */
  totalLabel: string;
  /** Last successful Google Takeout import (none yet = null / 'never'). */
  lastSyncAt: string | null;
  lastSyncStatus: 'ok' | 'error' | 'never';
};

/** new = not opened yet; awaiting_reply = opened, no confirmed reply ("Not Yet Replied");
 *  replied = owner confirmed a reply was sent; archived = closed/hidden from the main tabs. */
export type EnquiryStatus = 'new' | 'awaiting_reply' | 'replied' | 'archived';

export const enquiryInterests = [
  'Eye examination',
  'New spectacles',
  'Contact lenses',
  'Buy 3 Free 1 lens promotion',
  'Something else',
] as const;
export type EnquiryInterest = (typeof enquiryInterests)[number];

export type EnquiryReply = {
  id: string;
  body: string;
  channel: 'whatsapp';
  /** When the owner clicked "Reply on WhatsApp". */
  loggedAt: string;
  /** True once the owner confirmed the message was actually sent. */
  confirmed: boolean;
};

export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  interest: EnquiryInterest | null;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  openedAt: string | null;
  repliedAt: string | null;
  replies: EnquiryReply[];
};

export type NewEnquiry = Pick<Enquiry, 'name' | 'phone' | 'interest' | 'message'>;

export type EnquiryCounts = Record<EnquiryStatus, number>;
export type ReviewCounts = Record<ReviewStatus, number>;

export type AdminSession = { email: string; expiresAt: number };

/** Standard result shape returned by Server Actions to forms. */
export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Submitted values echoed back so fields keep their content after a failed submit. */
  values?: Record<string, string>;
};
