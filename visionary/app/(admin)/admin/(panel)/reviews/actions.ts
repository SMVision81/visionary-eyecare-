'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { reviews, stats } from '@/lib/data';
import type { ActionState, ImportSummary, ReviewStatus } from '@/lib/types';
import { overallRating, parseTakeoutReviews, starValue } from '@/lib/reviews';
import { validateReviewDisplay } from '@/lib/validation';

const statuses: ReviewStatus[] = ['pending', 'approved', 'live', 'hidden', 'removed'];

function refresh() {
  // Every public page can show reviews. There is no app/layout.tsx (each route group has its own root layout),
  // so target the public group's root layout explicitly.
  revalidatePath('/(site)', 'layout');
  revalidatePath('/admin', 'layout');
}

/**
 * Handles every review status button. The clicked button sends `op` = "<status>:<id>" for a single
 * review, or "<status>:bulk" to apply to all checked `ids`. Optional `redirectTo` returns to a page.
 */
export async function reviewStatusAction(form: FormData): Promise<void> {
  await requireAdmin();
  const [status, target] = String(form.get('op') ?? '').split(':') as [ReviewStatus, string];
  if (!statuses.includes(status) || !target) return;
  // Review ids are UUIDs (Supabase) or rev_… (demo); cap a bulk change at one page's worth plus margin.
  const validId = (v: string) => /^[A-Za-z0-9_-]{1,64}$/.test(v);
  const ids = (target === 'bulk' ? form.getAll('ids').map(String) : [target]).filter(validId).slice(0, 200);
  if (ids.length) await reviews.setStatus(ids, status);
  refresh();
  const redirectTo = String(form.get('redirectTo') ?? '');
  if (redirectTo.startsWith('/admin')) redirect(redirectTo);
}

export async function updateReviewAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get('id') ?? '');
  const review = await reviews.get(id);
  if (!review) return { ok: false, message: 'Review not found.' };

  const result = validateReviewDisplay(review.originalText, {
    displayName: String(form.get('displayName') ?? ''),
    displayText: String(form.get('displayText') ?? ''),
    sortOrder: String(form.get('sortOrder') ?? '0'),
  });
  if (!result.ok) return { ok: false, message: 'Please fix the highlighted fields.', fieldErrors: result.fieldErrors };

  await reviews.updateDisplay(id, { ...result.data, featured: form.get('featured') === 'on' });
  const publish = form.get('publish') === '1';
  if (publish) await reviews.setStatus([id], 'live');
  refresh();
  return { ok: true, message: publish ? 'Saved and published on the website.' : 'Changes saved.' };
}

// Google Takeout import. The browser reads the export folder and sends reviews in small batches (each well under the
// default 1 MB Server Action limit); every batch is re-validated here. Totals are added up in the browser.
const MAX_BATCH = 800;
const MAX_EXPORT = 20_000;

export type BatchResult = { ok: true; summary: ImportSummary; skippedNoText: number } | { ok: false; message: string };
export type RatingResult = { ok: true; rating: number; totalReviews: number } | { ok: false; message: string };

const NOT_TAKEOUT = 'No Google reviews found. Choose the unzipped “location-…” folder from your Google Takeout export.';

function readBatch(payload: unknown) {
  if (typeof payload !== 'string' || payload.length > 950_000) return null;
  try {
    const raw: unknown = JSON.parse(payload);
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_BATCH) return null;
    return parseTakeoutReviews(raw);
  } catch {
    return null;
  }
}

/** Rating + count from the star values of EVERY review in the export (same basis Google uses). */
function readStars(payload: unknown): number[] | null {
  if (typeof payload !== 'string' || payload.length > 200_000) return null;
  try {
    const raw: unknown = JSON.parse(payload);
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_EXPORT) return null;
    const stars = raw.map(starValue);
    return stars.every((x): x is NonNullable<typeof x> => x !== null) ? stars : null;
  } catch {
    return null;
  }
}

/** Preview one batch: counts only, nothing saved. */
export async function previewImportAction(batch: string): Promise<BatchResult> {
  await requireAdmin();
  const parsed = readBatch(batch);
  if (!parsed) return { ok: false, message: NOT_TAKEOUT };
  try {
    return { ok: true, summary: await reviews.importGoogle(parsed.items, { dryRun: true }), skippedNoText: parsed.skippedNoText };
  } catch {
    return { ok: false, message: 'Could not check the reviews against the database. Please try again.' };
  }
}

/** Import one batch: new reviews only (pending, or approved for 5★ if chosen); existing and removed ones are untouched. */
export async function importBatchAction(batch: string, approveFiveStar: boolean): Promise<BatchResult> {
  await requireAdmin();
  const parsed = readBatch(batch);
  if (!parsed) return { ok: false, message: NOT_TAKEOUT };
  try {
    const summary = await reviews.importGoogle(parsed.items, { approveFiveStar: approveFiveStar === true });
    refresh();
    return { ok: true, summary, skippedNoText: parsed.skippedNoText };
  } catch {
    // Batches already imported stay imported; running the import again only adds what is missing.
    return { ok: false, message: 'Part of the import could not be saved. Some reviews may already be in; run the import again to finish.' };
  }
}

/** The rating + count this export gives (for the preview). */
export async function exportRatingAction(stars: string): Promise<RatingResult> {
  await requireAdmin();
  const list = readStars(stars);
  if (!list) return { ok: false, message: NOT_TAKEOUT };
  return { ok: true, rating: overallRating(list), totalReviews: list.length };
}

/** After all batches: save the Google rating + count from the export and log the import (with who ran it). */
export async function finishImportAction(stars: string, totals: ImportSummary): Promise<RatingResult> {
  const session = await requireAdmin();
  const list = readStars(stars);
  if (!list) return { ok: false, message: NOT_TAKEOUT };
  const n = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= MAX_EXPORT ? (v as number) : 0);
  const summary = { total: n(totals?.total), added: n(totals?.added), existing: n(totals?.existing), blocked: n(totals?.blocked) };
  const rating = overallRating(list);
  try {
    await stats.recordImport({ rating, totalReviews: list.length, summary, adminEmail: session.email });
  } catch {
    return { ok: false, message: 'The reviews were imported, but the Google rating could not be updated. Please run the import again.' };
  }
  refresh();
  return { ok: true, rating, totalReviews: list.length };
}
