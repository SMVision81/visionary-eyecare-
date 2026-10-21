import { formatMyPhone, normaliseMyPhone } from './phone';
import { enquiryInterests, type EnquiryInterest, type NewEnquiry, type NewWebsiteReview } from './types';

type Result<T> = { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string> };

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

export function validateEnquiry(form: FormData): Result<NewEnquiry> {
  const name = str(form.get('name'));
  const phone = str(form.get('phone'));
  const interestRaw = str(form.get('interest'));
  const message = str(form.get('message'));
  const consent = form.get('consent') === 'on';
  const errors: Record<string, string> = {};

  if (name.length < 2 || name.length > 80) errors.name = 'Please enter your name (2–80 characters).';
  if (!normaliseMyPhone(phone)) errors.phone = 'Please enter a valid Malaysian phone number, e.g. +60 12-345 6789.';
  if (interestRaw && !enquiryInterests.includes(interestRaw as EnquiryInterest)) errors.interest = 'Please choose an option.';
  if (message.length < 5 || message.length > 1000) errors.message = 'Please write a short message (5–1000 characters).';
  if (!consent) errors.consent = 'Please agree so we can contact you about your enquiry.';

  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors };
  return { ok: true, data: { name, phone: formatMyPhone(phone), interest: (interestRaw || null) as EnquiryInterest | null, message } };
}

/** Max extra characters allowed in a review's website text compared with the original ("light fixes" policy). */
export const REVIEW_EDIT_SLACK = 20;

export function validateReviewDisplay(
  original: string,
  input: { displayName: string; displayText: string; sortOrder: string },
): Result<{ displayName: string; displayText: string | null; sortOrder: number }> {
  const errors: Record<string, string> = {};
  const displayName = input.displayName.trim();
  const displayText = input.displayText.trim();
  const sortOrder = Number(input.sortOrder || 0);

  if (displayName.length < 1 || displayName.length > 60) errors.displayName = 'Display name must be 1–60 characters.';
  if (!displayText) errors.displayText = 'Website text cannot be empty. Use "Reset to original" instead.';
  else if (displayText.length > original.length + REVIEW_EDIT_SLACK)
    errors.displayText = 'Website text can only shorten the review or fix small typos. It cannot be longer than the original.';
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999) errors.sortOrder = 'Order must be a whole number 0–999.';

  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors };
  return { ok: true, data: { displayName, displayText: displayText === original.trim() ? null : displayText, sortOrder } };
}

/** Share of words in `edited` that do not appear in `original` (0–1). Used to warn about heavy rewording. */
export function rewordRatio(original: string, edited: string): number {
  const words = (s: string) => s.toLowerCase().match(/[a-z0-9\u00c0-\u024f']+/g) ?? [];
  const source = new Set(words(original));
  const target = words(edited);
  if (!target.length) return 0;
  return target.filter((w) => !source.has(w)).length / target.length;
}

/** A review written on the website form. Phone is required but private (used only to confirm a real visit). */
export function validateWebsiteReview(form: FormData): Result<NewWebsiteReview> {
  const name = str(form.get('name'));
  const rating = Number(str(form.get('rating')));
  const text = str(form.get('review'));
  const phone = str(form.get('phone'));
  const consent = form.get('consent') === 'on';
  const errors: Record<string, string> = {};

  if (name.length < 2 || name.length > 60) errors.name = 'Please enter your name (2–60 characters).';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Please choose a star rating.';
  if (text.length < 10 || text.length > 1000) errors.review = 'Please write a few words about your visit (10–1000 characters).';
  if (!normaliseMyPhone(phone)) errors.phone = 'Please enter a valid Malaysian phone number, e.g. +60 12-345 6789.';
  if (!consent) errors.consent = 'Please agree so we can show your review.';

  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors };
  return { ok: true, data: { authorName: name, rating: rating as NewWebsiteReview['rating'], text, phone: formatMyPhone(phone) } };
}
