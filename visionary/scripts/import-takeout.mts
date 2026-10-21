// Import Google reviews from an unzipped Takeout export, from the command line (same rules as Admin → Reviews →
// Import from Google). Usage (from visionary/):
//   npm run reviews:import -- ../reviews-import/location-XXXX [--approve-5]
// New reviews only: existing and removed (tombstoned) ones are never touched. New ones arrive as pending, or approved
// for 5★ with --approve-5 (approved is still NOT on the website). Rating + count are refreshed from the export.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { overallRating, parseTakeoutReviews, shortName, splitTranslation, starValue } from '../lib/reviews.ts';

const dir = process.argv[2];
const approveFive = process.argv.includes('--approve-5');
if (!dir || !statSync(dir, { throwIfNoEntry: false })?.isDirectory()) {
  console.error('Usage: npm run reviews:import -- <unzipped Takeout location-… folder> [--approve-5]');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// 1. Read every reviews*.json in the folder.
const raw = new Map<string, unknown>();
for (const f of readdirSync(dir).filter((n) => /^reviews.*\.json$/i.test(n))) {
  try {
    const json = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { reviews?: { name?: unknown }[] };
    for (const r of json.reviews ?? []) if (typeof r.name === 'string') raw.set(r.name, r);
  } catch {
    console.warn(`Skipped unreadable file ${f}`);
  }
}
const entries = [...raw.values()];
const stars = entries.map((e) => starValue((e as { starRating?: unknown }).starRating)).filter((s): s is NonNullable<typeof s> => s !== null);
const { items, skippedNoText } = parseTakeoutReviews(entries);
if (!items.length) {
  console.error('No reviews found in that folder.');
  process.exit(1);
}

// 2. Which IDs do we already have (any status)?
const known = new Map<string, string>();
const ids = items.map((i) => i.googleReviewId);
for (let i = 0; i < ids.length; i += 80) {
  const { data, error } = await db.from('reviews').select('google_review_id, status').in('google_review_id', ids.slice(i, i + 80));
  if (error) throw new Error(`Lookup failed: ${error.message}`);
  for (const r of data) known.set(r.google_review_id, r.status);
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

// 3. Insert new ones in batches (DO NOTHING on conflict: an existing row is never overwritten).
const now = new Date().toISOString();
const rows = fresh.map((it) => {
  const english = splitTranslation(it.text).english;
  return {
    source: 'google', google_review_id: it.googleReviewId, author_name: it.authorName, rating: it.rating, original_text: it.text,
    review_date: it.reviewDate, display_name: shortName(it.authorName), display_text: english, is_edited: english !== null,
    status: approveFive && it.rating === 5 ? 'approved' : 'pending', synced_at: now, updated_at: now,
  };
});
for (let i = 0; i < rows.length; i += 500) {
  const { error } = await db.from('reviews').upsert(rows.slice(i, i + 500), { onConflict: 'google_review_id', ignoreDuplicates: true });
  if (error) throw new Error(`Insert failed at batch ${i / 500 + 1}: ${error.message} (already-imported batches stay; re-run to finish)`);
}

// 4. Rating + count from ALL reviews in the export; log the run.
const rating = overallRating(stars);
const run = await db.from('review_import_runs').insert({ ...summary, rating, total_reviews: stars.length, admin_email: 'cli import' });
if (run.error) throw new Error(`Logging the import failed: ${run.error.message}`);
const st = await db.from('google_profile_stats').upsert({ id: 1, rating, total_review_count: stars.length, fetched_at: now });
if (st.error) throw new Error(`Updating the rating failed: ${st.error.message}`);

console.log(`✓ Imported ${summary.added} new reviews (${approveFive ? '5★ as Approved, others Pending' : 'all Pending'}).`);
console.log(`  Already imported: ${summary.existing} · removed by you (skipped): ${summary.blocked} · star-only (skipped): ${skippedNoText}`);
console.log(`  Google rating: ${rating.toFixed(1)} from ${stars.length} reviews.`);
