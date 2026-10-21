'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { enquiries } from '@/lib/data';
import type { EnquiryStatus } from '@/lib/types';

const refresh = () => revalidatePath('/admin', 'layout');
const validId = (id: unknown): id is string => typeof id === 'string' && /^[\w-]{1,64}$/.test(id);

/** Called once when the owner opens a New enquiry (moves it to Not Yet Replied). */
export async function markOpenedAction(id: string): Promise<void> {
  await requireAdmin();
  if (!validId(id)) return;
  await enquiries.markOpened(id);
  refresh();
}

/** Owner clicked "Reply on WhatsApp": store the message as an unconfirmed reply. */
export async function logWhatsAppAttemptAction(id: string, body: string): Promise<void> {
  const session = await requireAdmin();
  const text = body.trim().slice(0, 2000);
  if (!validId(id) || !text) return;
  await enquiries.logWhatsAppAttempt(id, text, session.email);
  refresh();
}

/** Owner confirmed they sent the reply (or replied another way, e.g. by phone). */
export async function confirmRepliedAction(id: string): Promise<void> {
  await requireAdmin();
  if (!validId(id)) return;
  await enquiries.confirmReplied(id);
  refresh();
}

const allowed: EnquiryStatus[] = ['awaiting_reply', 'archived'];

/** Archive / unarchive (unarchive returns it to Not Yet Replied, or Replied if it already has a confirmed reply). */
export async function enquiryStatusAction(form: FormData): Promise<void> {
  await requireAdmin();
  const id = form.get('id');
  const status = String(form.get('status') ?? '') as EnquiryStatus;
  if (!validId(id) || !allowed.includes(status)) return;
  let next = status;
  if (status === 'awaiting_reply') {
    const e = await enquiries.get(id);
    if (e?.replies.some((r) => r.confirmed)) next = 'replied';
  }
  await enquiries.setStatus(id, next);
  refresh();
}
