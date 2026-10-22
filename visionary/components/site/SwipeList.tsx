'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * A list that becomes a sideways swipe row on some screens (CSS decides). Only while it actually overflows is it a
 * focusable, named list, so keyboard users can scroll it there without an empty tab stop everywhere else.
 */
export default function SwipeList({ className, label, children }: { className: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [scrolls, setScrolls] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <ul ref={ref} className={className} role="list" tabIndex={scrolls ? 0 : undefined} aria-label={scrolls ? label : undefined}>
      {children}
    </ul>
  );
}
