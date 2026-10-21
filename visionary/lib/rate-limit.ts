import 'server-only';

// Simple in-memory rate limiter (per server instance). Good enough to slow down form spam. Durable limits would need a
// shared store; website reviews are additionally capped per phone number in the database.
const buckets = new Map<string, number[]>();
let lastSweep = 0;

/** Records a hit for `key` and returns true when it exceeds `max` hits within `windowMs`. */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  // Drop stale buckets now and then so spoofed or one-off keys can't grow memory without bound.
  if (now - lastSweep > 10 * 60 * 1000 || buckets.size > 5000) {
    lastSweep = now;
    for (const [k, hits] of buckets) if (!hits.length || now - hits[hits.length - 1] > 24 * 60 * 60 * 1000) buckets.delete(k);
  }
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  return recent.length > max;
}

/**
 * The visitor's IP for rate limiting. Prefers the header set by the hosting platform (Netlify), which clients can't
 * forge; X-Forwarded-For's first entry is only a fallback for local development.
 */
export function clientIp(h: Headers): string {
  return (
    h.get('x-nf-client-connection-ip')?.trim() ||
    h.get('x-real-ip')?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}
