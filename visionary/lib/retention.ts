import 'server-only';
import { enquiries } from './data';
import { enquiryRetentionMonths } from './site';

/**
 * PDPA retention: delete enquiries older than `enquiryRetentionMonths` (with their reply history). Runs when a new
 * enquiry arrives and whenever an admin page loads, so no scheduled job is needed. Never throws.
 */
export async function purgeExpiredEnquiries(): Promise<void> {
  // N calendar months ago, clamping the day so e.g. 30 Apr -> 28/29 Feb (plain setMonth would overflow into March).
  const cutoff = new Date();
  const day = cutoff.getDate();
  cutoff.setDate(1);
  cutoff.setMonth(cutoff.getMonth() - enquiryRetentionMonths);
  cutoff.setDate(Math.min(day, new Date(cutoff.getFullYear(), cutoff.getMonth() + 1, 0).getDate()));
  try {
    const n = await enquiries.purgeOlderThan(cutoff);
    if (n) console.info(`[retention] Deleted ${n} enquir${n === 1 ? 'y' : 'ies'} older than ${enquiryRetentionMonths} months.`);
  } catch (e) {
    console.error(`[retention] Purge failed: ${e instanceof Error ? e.message : 'error'}`);
  }
}
