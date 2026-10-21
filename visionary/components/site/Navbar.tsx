'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { bookingLink, hours, phone } from '@/lib/site';
import { OpenStatus } from './OpenBadge';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services & Collections' },
  { href: '/contact', label: 'Contact' },
];

const short = (t: string) => t.replace(' — ', '–');

const phoneIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.6 3.5h2.6l1.4 4-2 1.4a12.5 12.5 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A16.5 16.5 0 0 1 5 5.2a1.6 1.6 0 0 1 1.6-1.7Z" />
  </svg>
);

/** Sticky navbar: links left, centred logo, phone + booking right (desktop); full-height menu (≤1100px). */
export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    // A drawer link hides itself on click; keep keyboard focus on the toggle instead of dropping it to <body>.
    if (open && document.getElementById('site-nav')?.contains(document.activeElement)) toggleRef.current?.focus();
    setOpen(false);
  };

  // Close the menu on any route change (Back/Forward, links outside the menu), adjusting state during render.
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const desktop = window.matchMedia('(min-width: 1101px)');
    const onResize = () => desktop.matches && setOpen(false);
    // Keep keyboard and screen-reader focus inside the open menu: everything else on the page (banner above, content below) becomes inert.
    const behind: HTMLElement[] = [];
    const skip = (el: Element) => !(el instanceof HTMLElement) || el.tagName === 'SCRIPT' || el.tagName.startsWith('NEXT-');
    for (let el = headerRef.current?.nextElementSibling; el; el = el.nextElementSibling) if (!skip(el)) behind.push(el as HTMLElement);
    for (let el = headerRef.current?.previousElementSibling; el; el = el.previousElementSibling) if (!skip(el)) behind.push(el as HTMLElement);
    behind.forEach((el) => (el.inert = true));
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    document.documentElement.classList.add('menu-open');
    return () => {
      behind.forEach((el) => (el.inert = false));
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
      document.documentElement.classList.remove('menu-open');
    };
  }, [open]);

  return (
    <header ref={headerRef} className={`navbar${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="navbar-inner">
        <button
          ref={toggleRef}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
        <nav className="nav-links" id="site-nav" aria-label="Main">
          <ul>
            {links.map((l, i) => (
              <li key={l.href} style={{ '--i': i } as React.CSSProperties}>
                <Link href={l.href} aria-current={pathname === l.href ? 'page' : undefined} onClick={close}>
                  <span className="nav-no" aria-hidden="true">
                    0{i + 1}
                  </span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-drawer-foot">
            <a className="btn btn-crimson" href={bookingLink} target="_blank" rel="noreferrer">
              Book an Eye Test<span className="sr-only"> (opens WhatsApp)</span>
            </a>
            <OpenStatus fallback="Opening hours" />
            <p>
              Mon–Sat {short(hours[0].time)}
              <br />
              Sun {short(hours[1].time)}
            </p>
            <a className="nav-drawer-phone" href={`tel:${phone.tel}`}>
              {phoneIcon}
              {phone.display}
            </a>
          </div>
        </nav>
        <Link href="/" className="brand" aria-label="Visionary Eyecare home" onClick={close}>
          <img src="/images/logo.svg" alt="" width={104} height={50} />
        </Link>
        <div className="nav-actions">
          <a className="nav-phone" href={`tel:${phone.tel}`}>
            {phoneIcon}
            {phone.display}
          </a>
          <a className="btn btn-crimson btn-sm nav-cta" href={bookingLink} target="_blank" rel="noreferrer">
            Book an Eye Test<span className="sr-only"> (opens WhatsApp)</span>
          </a>
          <a className="nav-call" href={`tel:${phone.tel}`} aria-label={`Call ${phone.display}`}>
            {phoneIcon}
          </a>
        </div>
      </div>
    </header>
  );
}
