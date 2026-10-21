'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import Media from '@/components/media/Media';
import type { MediaKey } from '@/lib/media';
import { motionTokens } from '@/lib/motion';

export type ExploreRow = { href: string; label: string; title: string; text: string; cta: string; media: MediaKey; focus: string };

/**
 * Home "Explore": a full-bleed three-way split of photo panels (no heading band). On entry a navy curtain wipes off each panel in turn,
 * photos drift with the scroll, and on mouse devices the hovered panel widens (see "Home: Explore triptych" in
 * site.css). Phones get a swipeable row. Reduced motion: no curtain or drift (MotionProvider + CSS).
 */
export default function ExplorePanels({ rows }: { rows: ExploreRow[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  return (
    <section ref={ref} className="explore" aria-labelledby="explore-title">
      {/* The split is purely visual; the heading stays for screen readers and the page outline. */}
      <h2 id="explore-title" className="sr-only">
        Find your way around
      </h2>
      <ul className="explore-row" role="list">
        {rows.map((r, i) => (
          <li key={r.href} style={{ '--focus': r.focus } as React.CSSProperties}>
            <Link href={r.href} className="explore-panel">
              <motion.span className="explore-photo" style={{ y: drift }} aria-hidden="true">
                <Media id={r.media} sizes="(max-width: 980px) 100vw, 50vw" />
              </motion.span>
              <motion.span
                className="explore-curtain"
                aria-hidden="true"
                initial={{ scaleX: 1 }}
                whileInView={{ scaleX: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: motionTokens.duration.crawl * 1.1, delay: i * motionTokens.stagger.loose, ease: motionTokens.easing.smooth }}
              />
              <span className="explore-body">
                <span className="explore-no" aria-hidden="true">
                  0{i + 1}
                </span>
                <small>{r.label}</small>
                <span className="explore-title">{r.title}</span>
                <span className="explore-text">{r.text}</span>
                <span className="explore-cta">
                  {r.cta} <span aria-hidden="true">→</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
