import Link from 'next/link';
import { address, bookingLink, enquiryLink, hours, mapsLink, phone } from '@/lib/site';
import { OpenStatus } from './OpenBadge';

const short = (t: string) => t.replace(' — ', '–');

// Site footer (every page): a slim CTA card that overlaps the top edge, then a compact one-row footer.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cta">
        <div className="footer-cta-copy">
          <span className="label label-light">Begin with an eye test</span>
          <h2>
            Your first step toward <em>clearer days.</em>
          </h2>
        </div>
        <div className="footer-cta-actions">
          <p className="footer-cta-status">
            <OpenStatus fallback={`Mon–Sat ${short(hours[0].time)}`} />
          </p>
          <div className="footer-cta-btns">
            <a className="btn btn-crimson" href={bookingLink} target="_blank" rel="noreferrer">
              Book an Eye Test<span className="sr-only"> (opens WhatsApp)</span>
            </a>
            <a className="btn btn-glass" href={`tel:${phone.tel}`}>
              Call {phone.display}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" aria-label="Visionary Eyecare home">
            <img src="/images/logo-white.svg" alt="" width={124} height={60} />
          </Link>
          <p>Independent eyecare at OUG Parklane, with an in-house optometrist, optician and 20 years of experience.</p>
        </div>
        <nav className="footer-col" aria-label="Footer">
          <h3>Pages</h3>
          <Link href="/about">About us</Link>
          <Link href="/services">Services &amp; Collections</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="footer-col">
          <h3>Visit</h3>
          <p>
            {address.street},
            <br />
            {address.postcode} {address.city}
          </p>
          <a href={mapsLink} target="_blank" rel="noreferrer">
            Get directions <span aria-hidden="true">→</span>
            <span className="sr-only"> (opens Google Maps)</span>
          </a>
        </div>
        <div className="footer-col">
          <h3>Hours</h3>
          {hours.map((h) => (
            <p key={h.days}>
              <span>{h.days.replace(' — ', '–')}</span> {short(h.time)}
            </p>
          ))}
        </div>
        <div className="footer-col">
          <h3>Contact</h3>
          <a href={`tel:${phone.tel}`}>{phone.display}</a>
          <a href={enquiryLink} target="_blank" rel="noreferrer">
            WhatsApp us<span className="sr-only"> (opens WhatsApp)</span>
          </a>
          <a href="mailto:hello@visionary-eyecare.my">hello@visionary-eyecare.my</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Visionary Eyecare. We care your eyes.</span>
        <span className="footer-credit">Designed &amp; developed by Aurexis Solution</span>
      </div>
    </footer>
  );
}
