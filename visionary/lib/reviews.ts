// Review helpers shared by the data layer, the Google import and the website review form.
import type { GoogleImportItem, Review } from './types';

/** Truncate by Unicode code points, so an emoji is never cut in half (Postgres rejects lone surrogates). */
export const clip = (s: string, n: number) => {
  const chars = Array.from(s);
  return chars.length > n ? chars.slice(0, n).join('') : s;
};

/** Name shown on the website: first name + last initial, e.g. "Aina Mahmud" → "Aina M." (single names unchanged). */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return clip(parts[0] ?? 'Customer', 60);
  const initial = Array.from(parts[parts.length - 1])[0].toUpperCase();
  return clip(`${parts[0]} ${initial}.`, 60);
}

const STARS = new Map<string, Review['rating']>([
  ['ONE', 1],
  ['TWO', 2],
  ['THREE', 3],
  ['FOUR', 4],
  ['FIVE', 5],
]);

/** Google's star value ("ONE" … "FIVE") as a number, or null for anything else. */
export const starValue = (v: unknown): Review['rating'] | null => (typeof v === 'string' ? (STARS.get(v) ?? null) : null);

/** Google adds "(Translated by Google) <English> (Original) <original>" to non-English reviews. */
export function splitTranslation(comment: string): { original: string; english: string | null } {
  const t = comment.match(/^\(Translated by Google\)\s*([\s\S]*?)\s*\(Original\)\s*([\s\S]*)$/);
  return { original: comment, english: t ? t[1].trim() || null : null };
}

const MAX_TEXT = 4000;
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Turn raw (untrusted) Takeout `reviews[]` entries into import items. Skips star-only reviews and anything malformed. */
export function parseTakeoutReviews(raw: unknown[]): { items: GoogleImportItem[]; skippedNoText: number } {
  const byId = new Map<string, GoogleImportItem>();
  let skippedNoText = 0;
  for (const entry of raw) {
    if (!isObject(entry)) continue;
    const id = typeof entry.name === 'string' ? (entry.name.split('/reviews/').pop() ?? '') : '';
    const rating = starValue(entry.starRating);
    const created = typeof entry.createTime === 'string' ? Date.parse(entry.createTime) : NaN;
    if (!id || id.length > 300 || !rating || Number.isNaN(created)) continue;
    const text = typeof entry.comment === 'string' ? clip(entry.comment.trim(), MAX_TEXT) : '';
    if (!text) {
      skippedNoText++;
      continue;
    }
    const reviewer = isObject(entry.reviewer) ? entry.reviewer : {};
    const name = typeof reviewer.displayName === 'string' && reviewer.displayName.trim() ? clip(reviewer.displayName.trim(), 120) : 'Google user';
    byId.set(id, { googleReviewId: id, authorName: name, rating, text, reviewDate: new Date(created).toISOString() });
  }
  return { items: [...byId.values()], skippedNoText };
}

/** Overall rating from EVERY review in the export (the same basis Google uses), rounded to one decimal. */
export function overallRating(ratings: number[]): number {
  if (!ratings.length) return 0;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}
