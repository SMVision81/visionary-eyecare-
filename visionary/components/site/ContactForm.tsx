'use client';
import { useActionState, type ReactNode } from 'react';
import { submitEnquiry } from '@/app/(site)/contact/actions';
import { enquiryLink } from '@/lib/site';
import { enquiryInterests, type ActionState } from '@/lib/types';

const initial: ActionState = { ok: false };

const interestIcons: Record<string, ReactNode> = {
  'Eye examination': (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  'New spectacles': (
    <>
      <circle cx="6.8" cy="15" r="3.4" />
      <circle cx="17.2" cy="15" r="3.4" />
      <path d="M10.2 13.8q1.8-2 3.6 0M3.4 13.5 2 8.6M20.6 13.5 22 8.6" />
    </>
  ),
  'Contact lenses': (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
    </>
  ),
  'Buy 3 Free 1 lens promotion': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5l-7 7" />
      <circle cx="9.3" cy="9.3" r="1.4" />
      <circle cx="14.7" cy="14.7" r="1.4" />
    </>
  ),
  'Something else': (
    <>
      <path d="M4 5.5h16v11l-10.5 0L4 20Z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </>
  ),
};

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const describe = (field: string) => (err[field] ? `${field}-error` : undefined);

  if (state.ok)
    return (
      <div className="form-sent" role="status">
        <svg className="sent-env" viewBox="0 0 130 100" aria-hidden="true">
          <rect x="5" y="18" width="120" height="76" rx="9" />
          <path d="M5 18l60 44 60-44" />
          <circle className="sent-seal" cx="65" cy="60" r="17" />
          <path className="sent-check" d="m56 60 6.5 6.5L74 54" />
        </svg>
        <span className="label">Enquiry received</span>
        <h2>
          Sealed and <em>sent.</em>
        </h2>
        <p>Our team will get back to you on WhatsApp or by phone soon. Need an answer right away? Message us directly.</p>
        <a className="btn btn-navy" href={enquiryLink} target="_blank" rel="noreferrer">
          Open WhatsApp
        </a>
      </div>
    );

  return (
    <>
      <span className="label">Send an enquiry</span>
      <p className="letter-to">To: Visionary Eyecare · OUG Parklane, Kuala Lumpur</p>
      <h2>
        How can we <em>help?</em>
      </h2>
      <form action={action} noValidate>
        {state.message && (
          <p className="form-error" role="alert">
            {state.message}
          </p>
        )}
        <div className="form-hp" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="name">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" /></svg>
              Your name
            </label>
            <input id="name" name="name" defaultValue={v.name} required maxLength={80} placeholder="e.g. Aina" autoComplete="name" aria-invalid={!!err.name} aria-describedby={describe('name')} />
            {err.name && <span id="name-error" className="field-error">{err.name}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="phone">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
              Phone number (WhatsApp)
            </label>
            <div className="ff-tel">
              <span className="ff-prefix" aria-hidden="true">
                +60
              </span>
              <input id="phone" name="phone" defaultValue={v.phone} type="tel" required placeholder="12-345 6789" autoComplete="tel-national" aria-invalid={!!err.phone} aria-describedby={describe('phone')} />
            </div>
            {err.phone && <span id="phone-error" className="field-error">{err.phone}</span>}
          </div>
        </div>
        <div className="form-field">
          <span className="ff-label" id="interest-label">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 4.5H12l8 8-8.5 8.5-8-8V4.5Z" /><circle cx="9" cy="9" r="1.7" /></svg>
            I’m interested in
          </span>
          <div className="chip-group" role="radiogroup" aria-labelledby="interest-label">
            {enquiryInterests.map((i) => (
              <label className="chip" key={i}>
                <input type="radio" name="interest" value={i} defaultChecked={v.interest === i} required />
                <span>
                  <svg className="chip-ico" viewBox="0 0 24 24" aria-hidden="true">{interestIcons[i]}</svg>
                  {i}
                  <i className="chip-dot" aria-hidden="true" />
                </span>
              </label>
            ))}
          </div>
          {err.interest && <span id="interest-error" className="field-error">{err.interest}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="message">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" /></svg>
            Message
          </label>
          <p className="letter-dear" aria-hidden="true">Dear Visionary Eyecare,</p>
          <textarea id="message" name="message" defaultValue={v.message} required maxLength={1000} placeholder="Tell us a little about what you need..." aria-invalid={!!err.message} aria-describedby={describe('message')} />
          <p className="letter-sign" aria-hidden="true">— yours sincerely,</p>
          {err.message && <span id="message-error" className="field-error">{err.message}</span>}
        </div>
        <div className="form-consent">
          <input id="consent" name="consent" type="checkbox" required aria-invalid={!!err.consent} aria-describedby={describe('consent')} />
          <label htmlFor="consent">
            I agree to Visionary Eyecare using my name and phone number to reply to this enquiry. We don’t share your details
            or use them for marketing.
          </label>
        </div>
        {err.consent && <span id="consent-error" className="field-error">{err.consent}</span>}
        <div className="form-send">
          <button className="btn btn-crimson" type="submit" disabled={pending} aria-busy={pending}>
            <svg className="plane" viewBox="0 0 64 24" aria-hidden="true">
              <path className="trail" d="M2 20C12 21 22 13 34 11" />
              <path className="body" d="M36 3l26 9-9 7-4.5-3.5L41 21l2.5-7.5-9.5-3.5z" />
              <path className="fold" d="M34 10.5 48.5 15.5" />
            </svg>
            {pending ? 'Sending…' : 'Send Enquiry'}
          </button>
          <span>We reply on WhatsApp.</span>
          <svg className="postmark form-chop" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="45" className="pm-ring" />
            <circle cx="50" cy="50" r="30" className="pm-ring pm-ring-solid" />
            <defs>
              <path id="pm-arc" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" />
            </defs>
            <text className="pm-text"><textPath href="#pm-arc">VISIONARY EYECARE · OUG PARKLANE ·</textPath></text>
            <g className="pm-specs">
              <circle cx="38" cy="47" r="11" />
              <circle cx="62" cy="47" r="11" />
              <path d="M49 44q1.5-3 3 0M27 43c-4-2-6-5-7-9M73 43c4-2 6-5 7-9" />
            </g>
            <text className="pm-kl" x="50" y="70">KUALA LUMPUR</text>
          </svg>
        </div>
      </form>
    </>
  );
}
