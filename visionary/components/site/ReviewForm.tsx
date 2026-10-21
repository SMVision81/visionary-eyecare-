'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { submitWebsiteReview } from '@/app/(site)/review/actions';
import { leaveReviewLink } from '@/lib/site';
import type { ActionState } from '@/lib/types';

const initial: ActionState = { ok: false };
const starWords = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/** Website review form. Submissions go to the admin as Pending; the phone number is private. */
export default function ReviewForm() {
  const [state, action, pending] = useActionState(submitWebsiteReview, initial);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const [rating, setRating] = useState(Number(v.rating) || 0);
  const describe = (field: string, hint?: string) => [hint, err[field] ? `rv-${field}-error` : undefined].filter(Boolean).join(' ') || undefined;
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  // After submitting: move focus to the thank-you, or to the first field that needs fixing.
  useEffect(() => {
    if (state.ok) {
      sentRef.current?.focus();
      return;
    }
    const first = ['rating', 'review', 'name', 'phone', 'consent'].find((f) => state.fieldErrors?.[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(first === 'rating' ? 'input[name="rating"]' : `[name="${first}"]`)?.focus();
  }, [state]);

  if (state.ok)
    return (
      <div className="rvw-sent" role="status" tabIndex={-1} ref={sentRef}>
        <span className="label">Thank you</span>
        <h2>
          Review <em>received.</em>
        </h2>
        <p>We read every review before it goes on the website. It means a lot to the team.</p>
        <p className="rvw-also">Would you share it on Google too? It helps other people in OUG find us.</p>
        <a className="btn btn-crimson" href={leaveReviewLink} target="_blank" rel="noreferrer">
          Also review us on Google<span className="sr-only"> (opens Google)</span>
        </a>
      </div>
    );

  return (
    <form action={action} noValidate className="rvw-form" ref={formRef}>
      <div role="alert">{state.message && <p className="form-error">{state.message}</p>}</div>
      <div className="form-hp" aria-hidden="true">
        <label htmlFor="rv-website">Website</label>
        <input id="rv-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="rvw-stars">
        <legend>Your rating</legend>
        <div className="rvw-star-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={n <= rating ? 'is-on' : undefined}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                required
                aria-invalid={!!err.rating}
                aria-describedby={describe('rating')}
              />
              {/* Filled vs outlined star: the selection doesn't rely on colour alone. */}
              <span aria-hidden="true">{n <= rating ? '★' : '☆'}</span>
              <span className="sr-only">
                {n} {n === 1 ? 'star' : 'stars'}, {starWords[n]}
              </span>
            </label>
          ))}
          <span className="rvw-star-word" aria-hidden="true">
            {starWords[rating]}
          </span>
        </div>
        {err.rating && (
          <span id="rv-rating-error" className="field-error">
            {err.rating}
          </span>
        )}
      </fieldset>

      <div className="form-field">
        <label htmlFor="rv-review">Your review</label>
        <textarea
          id="rv-review"
          name="review"
          defaultValue={v.review}
          required
          minLength={10}
          maxLength={1000}
          placeholder="How was your eye test, fitting or new glasses?"
          aria-invalid={!!err.review}
          aria-describedby={describe('review')}
        />
        {err.review && (
          <span id="rv-review-error" className="field-error">
            {err.review}
          </span>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="rv-name">Your name</label>
          <input id="rv-name" name="name" defaultValue={v.name} required maxLength={60} placeholder="e.g. Aina Mahmud" autoComplete="name" aria-invalid={!!err.name} aria-describedby={describe('name', 'rv-name-hint')} />
          <span id="rv-name-hint" className="rvw-hint">
            Shown as first name and initial, e.g. “Aina M.”
          </span>
          {err.name && (
            <span id="rv-name-error" className="field-error">
              {err.name}
            </span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="rv-phone">Phone number</label>
          <div className="ff-tel">
            <span className="ff-prefix" aria-hidden="true">
              +60
            </span>
            <input id="rv-phone" name="phone" defaultValue={v.phone} type="tel" required placeholder="12-345 6789" autoComplete="tel-national" aria-invalid={!!err.phone} aria-describedby={describe('phone', 'rv-phone-hint')} />
          </div>
          <span id="rv-phone-hint" className="rvw-hint">
            Private. Never shown; only used to confirm your visit.
          </span>
          {err.phone && (
            <span id="rv-phone-error" className="field-error">
              {err.phone}
            </span>
          )}
        </div>
      </div>

      <div className="form-consent">
        <input
          id="rv-consent"
          name="consent"
          type="checkbox"
          required
          defaultChecked={v.consent === 'on'}
          aria-invalid={!!err.consent}
          aria-describedby={describe('consent')}
        />
        <label htmlFor="rv-consent">
          I agree to Visionary Eyecare showing my review with my first name and initial on this website, and using my phone
          number only to confirm my visit. It is never shown or used for marketing.
        </label>
      </div>
      {err.consent && (
        <span id="rv-consent-error" className="field-error">
          {err.consent}
        </span>
      )}

      <button className="btn btn-crimson" type="submit" disabled={pending} aria-busy={pending}>
        {pending ? 'Sending…' : 'Send review'}
      </button>
    </form>
  );
}
