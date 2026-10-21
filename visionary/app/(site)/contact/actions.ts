'use server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { enquiries } from '@/lib/data';
import { notifyNewEnquiry } from '@/lib/notify';
import type { ActionState } from '@/lib/types';
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

  try {
    const enquiry = await enquiries.create(result.data);
    await notifyNewEnquiry(enquiry).catch(() => {});
  } catch {
    return { ok: false, message: 'Sorry, we could not send your enquiry. Please try again or WhatsApp us.', values };
  }

  revalidatePath('/admin', 'layout');
  return { ok: true };
}
