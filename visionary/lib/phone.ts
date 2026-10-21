/**
 * Normalise a Malaysian phone number to WhatsApp/E.164 digits without "+".
 *   "012-345 6789"   -> "60123456789"
 *   "+60 12 345 6789" -> "60123456789"
 *   "60123456789"    -> "60123456789"
 * Returns null if it doesn't look like a valid Malaysian number.
 */
export function normaliseMyPhone(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `6${digits}`;
  // The contact form shows a fixed "+60" prefix, so visitors type the local part only
  // (e.g. "12-345 6789"). Accept that too.
  else if (!digits.startsWith('60') && digits.length >= 8 && digits.length <= 10) digits = `60${digits}`;
  if (!digits.startsWith('60')) return null;
  // 60 + 8–10 digits (landlines and mobiles, incl. 011 numbers)
  return /^60\d{8,10}$/.test(digits) ? digits : null;
}

/** Pretty format for display, e.g. "+60 12-345 6789". Falls back to the raw input. */
export function formatMyPhone(input: string): string {
  const n = normaliseMyPhone(input);
  if (!n) return input;
  const local = n.slice(2);
  return `+60 ${local.slice(0, 2)}-${local.slice(2, local.length - 4)} ${local.slice(-4)}`;
}

/** wa.me link to message a CUSTOMER (admin replies). For links to the business use whatsappLink() in lib/site.ts. */
export function customerWhatsAppLink(phone: string, text?: string): string | null {
  const n = normaliseMyPhone(phone);
  if (!n) return null;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
