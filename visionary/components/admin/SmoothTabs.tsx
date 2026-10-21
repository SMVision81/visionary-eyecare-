'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';

type TabItem = { href: string; label: string; count: number; active: boolean };

const INK_KEY = 'ad-tab-ink';
const NAV_KEY = 'ad-tabnav';
const EXIT_MS = 190;

/**
 * Status filter tabs with a sliding ink indicator and a soft exit animation
 * before navigation, so switching filters feels continuous instead of a hard swap.
 * Falls back to the CSS ::after underline without JS; reduced motion skips the theatrics.
 */
export function SmoothTabs({ items }: { items: TabItem[] }) {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);

  // items change on every filter navigation; React may reuse this instance, so
  // this effect must run after each render, not only on mount.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const ink = inkRef.current;
    if (!nav || !ink) return;
    nav.classList.add('tabs-js');

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const place = (a: HTMLAnchorElement) => {
      ink.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop + a.offsetHeight - 1}px)`;
      ink.style.width = `${a.offsetWidth}px`;
    };
    const active = nav.querySelector<HTMLAnchorElement>('a.is-active');
    const page = document.querySelector('.admin-page');

    // React can reuse the .admin-page node across navigations, so any exit state we
    // added manually must be cleared here once the new page has rendered.
    page?.classList.remove('is-leaving');
    try {
      if (sessionStorage.getItem(NAV_KEY)) {
        sessionStorage.removeItem(NAV_KEY);
        page?.classList.add('from-tab'); // chrome stays put; only the list re-enters
      }
    } catch {
      /* private mode */
    }

    let from: { l: number; t: number; w: number } | null = null;
    try {
      from = JSON.parse(sessionStorage.getItem(INK_KEY) ?? 'null');
      sessionStorage.removeItem(INK_KEY);
    } catch {
      /* ignore */
    }

    if (active) {
      if (from && !reduce) {
        ink.style.transition = 'none';
        ink.style.transform = `translate(${from.l}px, ${from.t}px)`;
        ink.style.width = `${from.w}px`;
        void ink.offsetWidth;
        ink.style.transition = '';
      }
      place(active);
    }

    const ro = new ResizeObserver(() => {
      const a = nav.querySelector<HTMLAnchorElement>('a.is-active');
      if (a) place(a);
    });
    ro.observe(nav);
    return () => ro.disconnect();
  }, [items]);

  function go(e: React.MouseEvent<HTMLAnchorElement>, item: TabItem) {
    if (item.active || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const nav = navRef.current;
    const cur = nav?.querySelector<HTMLAnchorElement>('a.is-active');
    try {
      if (nav && cur) {
        sessionStorage.setItem(INK_KEY, JSON.stringify({ l: cur.offsetLeft, t: cur.offsetTop + cur.offsetHeight - 1, w: cur.offsetWidth }));
      }
      sessionStorage.setItem(NAV_KEY, '1');
    } catch {
      /* private mode */
    }
    const page = document.querySelector('.admin-page');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (page && !reduce) {
      page.classList.add('is-leaving');
      window.setTimeout(() => router.push(item.href), EXIT_MS);
      // Safety net: if the destination has no tabs (e.g. slow nav to a detail page
      // reusing this node), don't leave the exit state applied forever.
      window.setTimeout(() => document.querySelector('.admin-page.is-leaving')?.classList.remove('is-leaving'), EXIT_MS + 1200);
    } else {
      router.push(item.href);
    }
  }

  return (
    <nav className="tabs" ref={navRef} aria-label="Filter by status">
      <span className="tab-ink" ref={inkRef} aria-hidden="true" />
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={item.active ? 'is-active' : undefined}
          aria-current={item.active ? 'page' : undefined}
          onClick={(e) => go(e, item)}
        >
          {item.label}
          <span className="tab-count">{item.count}</span>
        </Link>
      ))}
    </nav>
  );
}
