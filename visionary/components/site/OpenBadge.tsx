'use client';
import { useEffect, useState } from 'react';
import { hours } from '@/lib/site';

const parse = (t: string) => {
  const m = t.match(/(\d+):(\d+)(am|pm)/i);
  if (!m) return 0;
  let h = +m[1] % 12;
  if (m[3].toLowerCase() === 'pm') h += 12;
  return h * 60 + +m[2];
};

const KL = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Status = { open: boolean; text: string };

function status(): Status {
  const now = new Date();
  const parts = KL.formatToParts(now).reduce<Record<string, string>>((a, p) => ((a[p.type] = p.value), a), {});
  const dayIdx = DAYS.indexOf(parts.weekday);
  const mins = (+parts.hour % 24) * 60 + +parts.minute;
  const today = hours[dayIdx === 0 ? 1 : 0];
  const [open, close] = today.time.split(' — ').map(parse);
  if (mins >= open && mins < close) {
    const left = close - mins;
    return { open: true, text: `Open now · closes in ${left >= 60 ? `${Math.floor(left / 60)}h ${left % 60 ? `${left % 60}m` : ''}` : `${left}m`}`.trim() };
  }
  const next: [number, (typeof hours)[number]] = mins < open ? [dayIdx, today] : [(dayIdx + 1) % 7, dayIdx === 6 ? hours[1] : hours[0]];
  const day = next[0] === dayIdx ? 'today' : DAYS[next[0]].slice(0, 3);
  return { open: false, text: `Closed · opens ${day} ${next[1].time.split(' — ')[0]}` };
}

/** Live open/closed status in Kuala Lumpur time, refreshed every minute. null until mounted (avoids hydration mismatch). */
export function useOpenStatus() {
  const [value, setValue] = useState<Status | null>(null);
  useEffect(() => {
    const tick = () => setValue(status());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  return value;
}

/** Compact status line used in the site banner. */
export function OpenStatus({ fallback }: { fallback: string }) {
  const value = useOpenStatus();
  return (
    <span className={`open-status${value?.open ? ' is-open' : ''}`}>
      <i aria-hidden="true" />
      {value?.text ?? fallback}
    </span>
  );
}
