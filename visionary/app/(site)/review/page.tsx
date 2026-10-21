import type { Metadata } from 'next';
import { Label } from '@/components/site/Blocks';
import ReviewForm from '@/components/site/ReviewForm';
import { googleProfile, leaveReviewLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Leave a Review',
  description: 'Tell us how your visit to Visionary Eyecare at OUG Parklane went: review us on Google or write your review here.',
  alternates: { canonical: '/review' },
  // A form page, not something to rank: keep it out of search results but let links be followed.
  robots: { index: false, follow: true },
};

export default function ReviewPage() {
  return (
    <main id="main">
      <section className="rvw">
        <div className="rvw-intro">
          <Label light>Leave a review</Label>
          <h1>
            How was <em>your visit?</em>
          </h1>
          <p>Your words help other people in OUG choose with confidence, and they help us keep getting better.</p>
          <a className="rvw-google" href={leaveReviewLink} target="_blank" rel="noreferrer">
            <span className="rvw-g" aria-hidden="true">
              G
            </span>
            <span>
              <b>Review us on Google</b>
              <small>Helps us most · joins our {googleProfile.reviewCount.toLocaleString('en-MY')} Google reviews</small>
            </span>
            <span aria-hidden="true">→</span>
            <span className="sr-only"> (opens Google)</span>
          </a>
          <p className="rvw-note">Or write it here. We read every review before it appears on the website.</p>
        </div>
        <div className="rvw-card">
          <ReviewForm />
        </div>
      </section>
    </main>
  );
}
