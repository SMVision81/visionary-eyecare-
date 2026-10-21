import 'server-only';
import type { Enquiry } from './types';

/**
 * Notify the business about a new enquiry.
 * Frontend phase: logs only (no personal data in logs). Phase B: send an email via the chosen provider.
 * Must never throw in a way that loses the enquiry: the enquiry is already saved before this runs.
 */
export async function notifyNewEnquiry(enquiry: Enquiry): Promise<void> {
  console.info(`[notify] New enquiry ${enquiry.id} received (email delivery not configured yet).`);
}
