import Link from 'next/link';
import { Label } from '@/components/site/Blocks';

export default function NotFound() {
  return (
    <main id="main" className="section not-found">
      <div className="center-head">
        <Label>Page not found</Label>
        <h1>
          We can’t find <em>that page.</em>
        </h1>
        <p className="muted-big">It may have moved or never existed. Let’s get you back to clearer ground.</p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-navy" href="/">
            Back to Home
          </Link>
          <Link className="btn-text" href="/contact">
            Contact us →
          </Link>
        </div>
      </div>
    </main>
  );
}
