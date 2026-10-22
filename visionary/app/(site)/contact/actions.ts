'use server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { enquiries } from '@/lib/data';
import { notifyNewEnquiry } from '@/lib/notify';
import { purgeExpiredEnquiries } from '@/lib/retention';
import type { ActionState, Enquiry } from '@/lib/types';
import { validateEnquiry } from '@/lib/validation';
import { clientIp, rateLimited } from '@/lib/rate-limit';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export async function submitEnquiry(_prev: ActionState, form: FormData): Promise<ActionState> {
  // Honeypot: real visitors never fill the hidden "website" field. Pretend success for bots.
  if (typeof form.get('website') === 'string' && form.get('website') !== '') return { ok: true };

  const h = await headers();
  if (rateLimited(`enquiry:${clientIp(h)}`, MAX_PER_WINDOW, WINDOW_MS)) {
    return { ok: false, message: 'Too many enquiries in a short time. Please WhatsApp us instead.' };
  }

  const values = Object.fromEntries(
    ['name', 'phone', 'interest', 'message'].map((k) => [k, String(form.get(k) ?? '')]),
  );
  const result = validateEnquiry(form);
  if (!result.ok) return { ok: false, message: 'Please check the highlighted fields.', fieldErrors: result.fieldErrors, values };

  let enquiry: Enquiry;
  try {
    enquiry = await enquiries.create(result.data);
  } catch (e) {
    // Data-layer errors are generic (no personal data), so they are safe to log.
    console.error(`[enquiry] save failed: ${e instanceof Error ? e.message : 'error'}`);
    return { ok: false, message: 'Sorry, we could not send your enquiry. Please try again or WhatsApp us.', values };
  }
  // Saved: the visitor sees success even if the email fails (notifyNewEnquiry logs its own failures and never throws).
  await notifyNewEnquiry(enquiry).catch((e) => console.error(`[notify] unexpected: ${e instanceof Error ? e.name : 'error'}`));
  await purgeExpiredEnquiries();

  revalidatePath('/admin', 'layout');
  return { ok: true };
}
