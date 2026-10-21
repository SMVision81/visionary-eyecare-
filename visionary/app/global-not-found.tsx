import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found' };

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fcfbf8', color: '#0b1a38' }}>
        <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '24px' }}>
          <div>
            <p style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 12, color: '#c8102e', fontWeight: 700 }}>
              Page not found
            </p>
            <h1 style={{ margin: '12px 0 20px', fontWeight: 500 }}>We can’t find that page.</h1>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, color: '#c8102e', fontWeight: 700 }}>
              Back to Visionary Eyecare →
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
