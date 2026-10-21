'use server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { reviews } from '@/lib/data';
import { clientIp, rateLimited } from '@/lib/rate-limit';
import type { ActionState } from '@/lib/types';
import { validateWebsiteReview } from '@/lib/validation';

const HOUR = 60 * 60 * 1000;

/** Public: a visitor submits a review. Saved as `pending`; nothing appears on the site until the owner approves it. */
export async function submitWebsiteReview(_prev: ActionState, form: FormData): Promise<ActionState> {
  // Honeypot: real visitors never fill the hidden "website" field. Pretend success for bots.
  if (typeof form.get('website') === 'string' && form.get('website') !== '') return { ok: true };

  const h = await headers();
  if (rateLimited(`review:${clientIp(h)}`, 3, HOUR)) {
    return { ok: false, message: 'Thank you! We have already received reviews from you recently. Please try again later.' };
  }

  const values = Object.fromEntries(['name', 'rating', 'review', 'phone', 'consent'].map((k) => [k, String(form.get(k) ?? '')]));
  const result = validateWebsiteReview(form);
  if (!result.ok) return { ok: false, message: 'Please check the highlighted fields.', fieldErrors: result.fieldErrors, values };

  // One person can't flood the queue: at most 2 reviews waiting for approval per phone number.
  try {
    if ((await reviews.pendingWebsiteCount(result.data.phone)) >= 2) {
      return { ok: false, message: 'Thank you! We already have your review and will check it soon.' };
    }
    await reviews.createWebsite(result.data);
  } catch {
    return { ok: false, message: 'Sorry, we could not save your review. Please try again.', values };
  }
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
