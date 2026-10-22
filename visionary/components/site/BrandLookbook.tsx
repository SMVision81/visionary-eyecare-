'use client';
import { useEffect, useRef, useState } from 'react';

export type LookbookItem = { name: string; href: string; position?: string };

const pad = (n: number) => String(n).padStart(2, '0');
const arrow = (d: string) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

/**
 * Services: the non-exclusive labels as a lookbook. One label fills the stage (its photo sharp in the panel and
 * blurred across the whole section); a filmstrip of thumbnails, the arrows, arrow keys or a swipe change it, and the
 * new photo comes into focus. Never advances on its own. `photos`/`thumbs` are server-rendered <Media> per item.
 */
export default function BrandLookbook({ items, photos, thumbs }: { items: LookbookItem[]; photos: React.ReactNode[]; thumbs: React.ReactNode[] }) {
  const [cur, setCur] = useState(0);
  const [moved, setMoved] = useState(false);
  // Only the current label and its neighbours are mounted (plus any already seen), so the page loads 3 photos, not all of them.
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const startX = useRef<number | null>(null);
  const n = items.length;
  const go = (i: number) => {
    const next = ((i % n) + n) % n;
    setMoved(true);
    setCur(next);
    setSeen((s) => new Set(s).add(next));
  };
  const item = items[cur];
  // Keep the selected thumbnail in view inside the strip (arrow keys / arrow buttons can move past its edge).
  const strip = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!moved) return;
    strip.current?.children[cur]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [cur, moved]);
  const near = (i: number) => seen.has(i) || Math.abs(i - cur) <= 1 || Math.abs(i - cur) === n - 1;

  return (
    <div
      className="lb"
      onKeyDown={(e) => {
        if (e.target instanceof HTMLElement && e.target.closest('.lb-strip, .lb-controls')) {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          go(e.key === 'ArrowRight' ? cur + 1 : cur - 1);
        }
      }}
    >
      <div className="lb-bg" aria-hidden="true">
        {photos.map((p, i) => (
          <div key={items[i].name} className={`lb-bg-shot${i === cur ? ' is-on' : ''}`} style={{ '--pos': items[i].position } as React.CSSProperties}>
            {near(i) ? p : null}
          </div>
        ))}
      </div>

      <div className="lb-copy">
        <p className="lb-count" aria-hidden="true">
          <b>{pad(cur + 1)}</b> / {pad(n)}
        </p>
        <p key={item.name} className="lb-name">
          {item.name}
        </p>
        <a className="lb-ask" href={item.href} target="_blank" rel="noreferrer">
          Ask about {item.name} <span aria-hidden="true">→</span>
          <span className="sr-only"> (opens WhatsApp)</span>
        </a>
      </div>

      <div
        className="lb-stage"
        aria-hidden="true"
        onPointerDown={(e) => {
          startX.current = e.pointerType === 'touch' ? e.clientX : null;
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 48) go(dx < 0 ? cur + 1 : cur - 1);
        }}
      >
        {photos.map((p, i) => (
          <div key={items[i].name} className={`lb-shot${i === cur ? ' is-on' : ''}`} style={{ '--pos': items[i].position } as React.CSSProperties}>
            {near(i) ? p : null}
          </div>
        ))}
      </div>

      <div className="lb-controls">
        <button type="button" className="lb-arrow" aria-label="Previous label" onClick={() => go(cur - 1)}>
          {arrow('M15 5 8 12l7 7')}
        </button>
        <ul ref={strip} className="lb-strip" role="list" aria-label="Choose a label">
          {items.map((it, i) => (
            <li key={it.name}>
              <button
                type="button"
                className={`lb-thumb${i === cur ? ' is-on' : ''}`}
                aria-label={it.name}
                aria-pressed={i === cur}
                onClick={() => go(i)}
                // Warm the big photo before the click so it never fades in empty.
                onPointerEnter={() => setSeen((s) => (s.has(i) ? s : new Set(s).add(i)))}
                onFocus={() => setSeen((s) => (s.has(i) ? s : new Set(s).add(i)))}
              >
                <span className="lb-thumb-img" aria-hidden="true" style={{ '--pos': it.position } as React.CSSProperties}>
                  {thumbs[i]}
                </span>
                <span className="lb-thumb-name" aria-hidden="true">
                  {it.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="lb-arrow" aria-label="Next label" onClick={() => go(cur + 1)}>
          {arrow('m9 5 7 7-7 7')}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {moved ? `${item.name}, label ${cur + 1} of ${n}` : ''}
      </p>
    </div>
  );
}
