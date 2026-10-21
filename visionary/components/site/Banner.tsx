import Link from 'next/link';
import { hours, mapsLink, promo } from '@/lib/site';
import { OpenStatus } from './OpenBadge';

const short = (t: string) => t.replace(' — ', '–');
const weekHours = `Mon–Sat ${short(hours[0].time)} · Sun ${short(hours[1].time)}`;

/** Slim announcement strip above the navbar: live opening status, current offer, location. Scrolls away with the page. */
export default function Banner() {
  return (
    <aside className="banner" aria-label="Announcements">
      <p className="banner-status">
        <OpenStatus fallback={weekHours} />
      </p>
      {promo.active ? (
        <Link className="banner-promo" href="/services#promotions">
          <em>Buy 3, free 1</em> on selected contact lenses
          <span className="banner-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ) : (
        <p className="banner-hours">{weekHours}</p>
      )}
      <a className="banner-place" href={mapsLink} target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
          <circle cx="12" cy="10" r="2.3" />
        </svg>
        OUG Parklane, KL
        <span className="sr-only"> (directions open Google Maps)</span>
      </a>
    </aside>
  );
}
