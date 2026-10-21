'use client';
import { motion, useReducedMotion, type PanInfo } from 'motion/react';
import { useEffect, useState } from 'react';
import { motionTokens, springs } from '@/lib/motion';
import { reviewSourceLabels, type PublicReview } from '@/lib/types';

const monthYear = new Intl.DateTimeFormat('en-MY', { month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
const tones = ['paper', 'navy', 'ivory'] as const;

const VISIBLE = 3; // cards drawn in the stack; the rest wait invisibly behind the last one
// Back cards fan out evenly to both sides (one tilted left, one right), dropping slightly lower each layer.
const stackPos = (depth: number) => {
  const d = Math.min(depth, VISIBLE - 1);
  const side = d === 0 ? 0 : d % 2 ? 1 : -1;
  return { x: side * 10, y: d * 10, rotate: side * 3.2, scale: 1 - d * 0.035, opacity: depth < VISIBLE ? 1 : 0 };
};

/**
 * Home reviews: a fanned deck of large review cards. Only the front card is readable; "Next" (or a swipe/drag)
 * lifts it off to the side and tucks it behind the stack. Nothing moves on its own.
 */
export default function ReviewDeck({ items }: { items: PublicReview[] }) {
  const [order, setOrder] = useState(() => items.map((_, k) => k));
  const [flying, setFlying] = useState<{ k: number; dir: 1 | -1 } | null>(null);
  const [announce, setAnnounce] = useState('');
  const reduce = useReducedMotion();
  const n = items.length;
  const front = order[0];

  const say = (k: number) => setAnnounce(`Review ${k + 1} of ${n}. ${items[k].rating} out of 5 stars. ${items[k].text} ${items[k].displayName}.`);
  const sendBack = () => {
    const r = [...order.slice(1), order[0]];
    setOrder(r);
    say(r[0]);
  };
  const next = (dir: 1 | -1 = -1) => {
    if (flying || n < 2) return;
    if (reduce) return sendBack(); // no fly-off animation: swap straight away
    setFlying({ k: front, dir });
  };
  const prev = () => {
    if (flying || n < 2) return;
    const r = [order[n - 1], ...order.slice(0, -1)];
    setOrder(r);
    say(r[0]);
  };
  const landed = (k: number) => {
    if (flying?.k !== k) return;
    sendBack();
    setFlying(null);
  };

  // Safety net: if the fly-off animation never reports completion (interrupted, tab hidden), finish the swap anyway.
  useEffect(() => {
    if (!flying) return;
    const t = window.setTimeout(() => landed(flying.k), motionTokens.duration.slow * 1000 + 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flying]);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -400) next(-1);
    else if (info.offset.x > 80 || info.velocity.x > 400) next(1);
  };

  if (!n) return null;

  return (
    <div className="deck" role="group" aria-roledescription="carousel" aria-label="Customer reviews">
      <div className="deck-stack">
        {items.map((r, k) => {
          const depth = order.indexOf(k);
          const isFront = depth === 0;
          const isFlying = flying?.k === k;
          return (
            <motion.figure
              key={r.id}
              className={`deck-card deck-${tones[k % tones.length]}`}
              style={{ zIndex: isFlying ? n + 1 : n - depth }}
              initial={false}
              animate={isFlying ? { x: `${flying.dir * 112}%`, y: -10, rotate: flying.dir * 9, scale: 1, opacity: 1 } : stackPos(depth)}
              transition={isFlying ? { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth } : springs.snappy}
              onAnimationComplete={() => landed(k)}
              drag={isFront && !flying && n > 1 ? 'x' : false}
              dragSnapToOrigin
              dragElastic={0.35}
              onDragEnd={onDragEnd}
              aria-hidden={isFront ? undefined : true}
            >
              <span className="deck-mark" aria-hidden="true">
                “
              </span>
              <span className="deck-stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
                {'★'.repeat(Math.max(0, Math.min(5, r.rating)))}
              </span>
              <blockquote>“{r.text}”</blockquote>
              <figcaption>
                <span className="deck-avatar" aria-hidden="true">
                  {r.displayName.charAt(0)}
                </span>
                <span>
                  <strong>{r.displayName}</strong>
                  <small>
                    {reviewSourceLabels[r.source]} · <time dateTime={r.reviewDate}>{monthYear.format(new Date(r.reviewDate))}</time>
                  </small>
                </span>
              </figcaption>
            </motion.figure>
          );
        })}
      </div>
      {n > 1 && (
        <div className="deck-nav">
          <span className="deck-count" aria-hidden="true">
            {String(front + 1).padStart(2, '0')} <i>/</i> {String(n).padStart(2, '0')}
          </span>
          <button type="button" className="deck-btn" aria-label="Previous review" onClick={prev}>
            ←
          </button>
          <button type="button" className="deck-btn deck-next" onClick={() => next(-1)}>
            Next review <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
