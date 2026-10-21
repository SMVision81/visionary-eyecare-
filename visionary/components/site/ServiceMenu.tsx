'use client';
import { useEffect, useState } from 'react';

export type ServiceMenuItem = { slug: string; no: string; title: string; desc: string; tag: string; badge?: string; href: string };

const arrow = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

/**
 * Services page: the six services as a menu. Desktop: hovering or focusing a row swaps the large photo beside the list.
 * Phones: each service is a photo card in a swipeable row. Each row is an anchor (/services#contact-lenses).
 * `images` are server-rendered <Media> elements, one per item, in the same order.
 */
export default function ServiceMenu({ items, images }: { items: ServiceMenuItem[]; images: React.ReactNode[] }) {
  const [active, setActive] = useState(0);
  // The list only scrolls sideways on touch phones; only then is the wrapper a focusable, named region.
  const [strip, setStrip] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px) and (pointer: coarse)');
    const sync = () => setStrip(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Deep links: /services#contact-lenses highlights that service (also on later hash changes).
  useEffect(() => {
    const fromHash = () => {
      const i = items.findIndex((s) => `#${s.slug}` === window.location.hash);
      if (i >= 0) setActive(i);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [items]);

  return (
    <div className="svc-menu">
      {/* On touch phones the list becomes a swipeable strip that keyboard users can scroll too. */}
      <div className="svc-scroll" role={strip ? 'region' : undefined} aria-label={strip ? 'Our services' : undefined} tabIndex={strip ? 0 : undefined}>
        <ol className="svc-list" role="list">
          {items.map((s, i) => (
            <li
              key={s.slug}
              id={s.slug}
              className={`svc-item${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <div className="svc-img-m">{images[i]}</div>
              <span className="svc-no" aria-hidden="true">
                {s.no}
              </span>
              <h3>
                {s.title}
                {s.badge && <span className="svc-badge">{s.badge}</span>}
              </h3>
              {/* Shown on phone cards; on desktop the photo caption repeats it visually (and this stays for screen readers). */}
              <p className="svc-desc">{s.desc}</p>
              <span className="svc-tag">{s.tag}</span>
              <a className="svc-ask" href={s.href} target="_blank" rel="noreferrer">
                <span className="svc-ask-text">
                  Ask on WhatsApp<span className="sr-only"> about {s.title} (opens WhatsApp)</span>
                </span>
                {arrow}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className="svc-figure" aria-hidden="true">
        {images.map((img, i) => (
          <div key={items[i].slug} className={`svc-shot${i === active ? ' is-on' : ''}`}>
            {img}
          </div>
        ))}
        {items.map((s, i) => (
          <div key={s.slug} className={`svc-caption${i === active ? ' is-on' : ''}`}>
            <p className="svc-cap-title">
              <span>{s.no}</span>
              {s.title}
            </p>
            <p className="svc-cap-desc">{s.desc}</p>
            <p className="svc-cap-tag">{s.tag}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
