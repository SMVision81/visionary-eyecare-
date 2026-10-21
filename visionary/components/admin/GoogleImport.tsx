'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import type { ImportSummary } from '@/lib/types';
import { exportRatingAction, finishImportAction, importBatchAction, previewImportAction } from '@/app/(admin)/admin/(panel)/reviews/actions';

type Entry = { name: unknown; reviewer: { displayName: unknown }; starRating: unknown; comment: unknown; createTime: unknown };
type Picked = { files: number; batches: string[]; stars: string };
type Totals = ImportSummary & { skippedNoText: number };
type Preview = Totals & { rating: number; totalReviews: number };

const BATCH_BYTES = 600_000; // keeps each request well under the 1 MB Server Action limit
const BATCH_MAX = 500;
const empty = (): Totals => ({ total: 0, added: 0, existing: 0, blocked: 0, skippedNoText: 0 });

/** Keep only the fields we import: the raw export also holds owner replies and profile data we don't send. */
function compact(r: Record<string, unknown>): Entry {
  const reviewer = (r.reviewer ?? {}) as Record<string, unknown>;
  return { name: r.name, reviewer: { displayName: reviewer.displayName }, starRating: r.starRating, comment: r.comment, createTime: r.createTime };
}

async function readTakeout(list: FileList): Promise<Picked | null> {
  const files = [...list].filter((f) => /(^|\/)reviews[^/]*\.json$/i.test(f.webkitRelativePath || f.name));
  const byId = new Map<string, Entry>();
  for (const f of files) {
    try {
      const json = JSON.parse(await f.text()) as { reviews?: Record<string, unknown>[] };
      for (const r of json.reviews ?? []) if (typeof r.name === 'string') byId.set(r.name, compact(r));
    } catch {
      /* not a reviews file: skip */
    }
  }
  if (!byId.size) return null;
  const entries = [...byId.values()];
  const batches: string[] = [];
  let cur: Entry[] = [];
  let size = 0;
  for (const e of entries) {
    const len = JSON.stringify(e).length;
    if (cur.length && (size + len > BATCH_BYTES || cur.length >= BATCH_MAX)) {
      batches.push(JSON.stringify(cur));
      cur = [];
      size = 0;
    }
    cur.push(e);
    size += len;
  }
  if (cur.length) batches.push(JSON.stringify(cur));
  return { files: files.length, batches, stars: JSON.stringify(entries.map((e) => e.starRating)) };
}

const add = (a: Totals, b: ImportSummary & { skippedNoText: number }): Totals => ({
  total: a.total + b.total,
  added: a.added + b.added,
  existing: a.existing + b.existing,
  blocked: a.blocked + b.blocked,
  skippedNoText: a.skippedNoText + b.skippedNoText,
});

/**
 * Admin: import Google reviews from a Takeout export. The owner picks the export folder; the browser reads only the
 * reviews-*.json files and sends the review fields in batches; the server re-validates everything. Preview first,
 * then import. New reviews arrive as Pending; existing and removed ones are never changed.
 */
export default function GoogleImport() {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [done, setDone] = useState<Preview | null>(null);
  const [approveFive, setApproveFive] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [pending, start] = useTransition();
  const resultHeading = useRef<HTMLHeadingElement>(null);

  // Move focus to the preview / result so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (preview || done) resultHeading.current?.focus();
  }, [preview, done]);

  const onPick = (list: FileList | null) => {
    setError('');
    setPreview(null);
    setDone(null);
    if (!list?.length) return;
    start(async () => {
      setStatus('Reading the export…');
      const p = await readTakeout(list);
      if (!p) {
        setPicked(null);
        setStatus('');
        setError('No reviews files found. Choose the unzipped “location-…” folder from your Google Takeout export.');
        return;
      }
      setPicked(p);
      let totals = empty();
      for (const [i, batch] of p.batches.entries()) {
        setStatus(`Checking reviews… ${i + 1} of ${p.batches.length}`);
        const res = await previewImportAction(batch);
        if (!res.ok) {
          setStatus('');
          setError(res.message);
          return;
        }
        totals = add(totals, { ...res.summary, skippedNoText: res.skippedNoText });
      }
      const rating = await exportRatingAction(p.stars);
      if (!rating.ok) {
        setStatus('');
        setError(rating.message);
        return;
      }
      setPreview({ ...totals, rating: rating.rating, totalReviews: rating.totalReviews });
      setStatus(`Preview ready: ${totals.added.toLocaleString('en-MY')} new reviews to import.`);
    });
  };

  const onImport = () => {
    if (!picked) return;
    setError('');
    start(async () => {
      let totals = empty();
      for (const [i, batch] of picked.batches.entries()) {
        setStatus(`Importing… ${i + 1} of ${picked.batches.length}`);
        const res = await importBatchAction(batch, approveFive);
        if (!res.ok) {
          setStatus('');
          setError(res.message);
          return;
        }
        totals = add(totals, { ...res.summary, skippedNoText: res.skippedNoText });
      }
      const fin = await finishImportAction(picked.stars, { total: totals.total, added: totals.added, existing: totals.existing, blocked: totals.blocked });
      if (!fin.ok) {
        setStatus('');
        setError(fin.message);
        return;
      }
      setDone({ ...totals, rating: fin.rating, totalReviews: fin.totalReviews });
      setPreview(null);
      setStatus(`Import complete: ${totals.added.toLocaleString('en-MY')} new reviews imported.`);
    });
  };

  return (
    <div className="gi">
      <ol className="gi-steps">
        <li>
          On <b>takeout.google.com</b>, export <b>Google Business Profile</b> only (.zip), then unzip it.
        </li>
        <li>Choose the unzipped folder that starts with “location-”. Only the review files are read.</li>
        <li>Check the preview, then import. New reviews arrive as <b>Pending</b>; nothing goes on the website until you choose it.</li>
      </ol>

      <div className="gi-pick">
        <input
          id="takeout"
          className="sr-only"
          type="file"
          multiple
          disabled={pending}
          // Lets the owner choose the whole export folder (supported by Chrome, Edge, Safari and Firefox).
          {...({ webkitdirectory: '' } as Record<string, string>)}
          onChange={(e) => onPick(e.target.files)}
        />
        <label htmlFor="takeout" className="a-btn a-btn-primary">
          Choose Takeout folder
        </label>
        {picked && <span className="muted">{picked.files} review files read</span>}
      </div>

      {/* Always in the DOM so screen readers announce every change. */}
      <p className="muted" role="status" aria-live="polite">
        {status}
      </p>
      <div role="alert">{error && <p className="alert alert-error">{error}</p>}</div>

      {preview && (
        <section className="surface gi-preview" aria-labelledby="gi-preview-title">
          <h2 id="gi-preview-title" ref={resultHeading} tabIndex={-1}>
            Ready to import
          </h2>
          <dl className="gi-stats">
            <div>
              <dt>New reviews</dt>
              <dd>{preview.added.toLocaleString('en-MY')}</dd>
            </div>
            <div>
              <dt>Already imported</dt>
              <dd>{preview.existing.toLocaleString('en-MY')}</dd>
            </div>
            <div>
              <dt>Removed by you (skipped)</dt>
              <dd>{preview.blocked.toLocaleString('en-MY')}</dd>
            </div>
            <div>
              <dt>Star rating only (no text, skipped)</dt>
              <dd>{preview.skippedNoText.toLocaleString('en-MY')}</dd>
            </div>
          </dl>
          <p className="muted">
            Google rating from this export: <b>{preview.rating.toFixed(1)}</b> from <b>{preview.totalReviews.toLocaleString('en-MY')}</b> reviews.
            The website will show these numbers.
          </p>
          <label className="gi-check">
            <input type="checkbox" checked={approveFive} onChange={(e) => setApproveFive(e.target.checked)} />
            <span>
              Mark new 5-star reviews as <b>Approved</b> (they still stay off the website until you put them live)
            </span>
          </label>
          <button className="a-btn a-btn-primary" type="button" onClick={onImport} disabled={pending || preview.added === 0}>
            {preview.added === 0 ? 'Nothing new to import' : `Import ${preview.added.toLocaleString('en-MY')} reviews`}
          </button>
        </section>
      )}

      {done && (
        <section className="surface gi-preview" aria-labelledby="gi-done-title">
          <h2 id="gi-done-title" ref={resultHeading} tabIndex={-1}>
            Import complete
          </h2>
          <p>
            {done.added.toLocaleString('en-MY')} new reviews imported. Google rating updated to {done.rating.toFixed(1)} from{' '}
            {done.totalReviews.toLocaleString('en-MY')} reviews.
          </p>
          <Link className="a-btn a-btn-primary" href={`/admin/reviews?status=${approveFive ? 'approved' : 'pending'}&source=google`}>
            Review them now
          </Link>
        </section>
      )}
    </div>
  );
}
