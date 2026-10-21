'use client';
import { useRef, useState } from 'react';
import { reviewSourceLabels, type PublicReview } from '@/lib/types';

const pad = (n: number) => String(n).padStart(2, '0');
// Longer reviews are set smaller so every quote fits a similar block instead of leaving a gap under short ones.
const size = (text: string) => {
  const len = Array.from(text).length;
  return len > 230 ? ' rf-quote--l' : len > 130 ? ' rf-quote--m' : '';
};

const arrow = (d: string) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

/** About: one review at a time. Prev/Next (or a swipe) blurs the quote out and brings the next one into focus. Never auto-advances. */
export default function ReviewFocus({ items }: { items: PublicReview[] }) {
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const startX = useRef<number | null>(null);
  const n = items.length;
  const go = (d: number) => {
    setTouched(true);
    setPrev(cur);
    setCur((cur + d + n) % n);
  };

  return (
    <div className="rf">
      {/* Controls sit above the quote so they stay put while the quote height changes. */}
      {n > 1 && (
        <div className="rf-controls">
          <p className="rf-count" aria-hidden="true">
            <b>{pad(cur + 1)}</b> / {pad(n)}
          </p>
          <button type="button" className="rf-btn" aria-label="Previous review" onClick={() => go(-1)}>
            {arrow('M15 5 8 12l7 7')}
          </button>
          <button type="button" className="rf-btn" aria-label="Next review" onClick={() => go(1)}>
            {arrow('m9 5 7 7-7 7')}
          </button>
        </div>
      )}
      <div
        className="rf-stage"
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
          if (n > 1 && Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* The current and outgoing quotes share one grid cell for the crossfade; idle ones take no space, so the stage fits the quote shown. */}
        {items.map((r, k) => (
          <figure
            key={r.id}
            className={`rf-quote${size(r.text)} ${k === cur ? 'is-in' : k === prev ? 'is-out' : 'is-idle'}`}
            aria-hidden={k !== cur}
            onAnimationEnd={k === prev ? () => setPrev(null) : undefined}
          >
            <div className="stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
              {'★'.repeat(r.rating)}
            </div>
            <blockquote>
              <p>
                <span className="rf-mark" aria-hidden="true">
                  “
                </span>
                {r.text}”
              </p>
            </blockquote>
            <figcaption>
              <b>{r.displayName}</b> {reviewSourceLabels[r.source]}
            </figcaption>
          </figure>
        ))}
      </div>
      {/* Announces the new review after Prev/Next (live regions stay silent on first render). */}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {touched ? `Review ${cur + 1} of ${n}: ${items[cur].rating} out of 5 stars. ${items[cur].text} ${items[cur].displayName}, ${reviewSourceLabels[items[cur].source]}.` : ''}
      </p>
    </div>
  );
}
