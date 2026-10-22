import 'server-only';
import { createTransport } from 'nodemailer';
import { customerWhatsAppLink, formatMyPhone } from './phone';
import { email as businessEmail, siteUrl } from './site';
import type { Enquiry } from './types';

// Enquiry email sent from the business Gmail account to itself (Gmail SMTP). Configure in .env.local / Netlify:
//   GMAIL_APP_PASSWORD  required to send: a 16-character Google "app password" for the Gmail account (needs 2-Step
//                       Verification on). Without it, nothing is emailed (the enquiry is still saved in the admin).
//   GMAIL_USER          the Gmail account that sends (defaults to the business email in lib/site.ts).
//   ENQUIRY_EMAIL_TO    inbox for new enquiries (defaults to the same address).

function body(e: Enquiry) {
  const wa = customerWhatsAppLink(e.phone);
  return [
    'New enquiry from the website',
    '',
    `Name: ${e.name}`,
    `Phone: ${formatMyPhone(e.phone)}`,
    `Interested in: ${e.interest ?? 'Not specified'}`,
    '',
    'Message:',
    e.message,
    '',
    ...(wa ? [`Reply on WhatsApp: ${wa}`] : []),
    `Open in the admin: ${siteUrl}/admin/enquiries/${e.id}`,
  ].join('\n');
}

/**
 * Email the business about a new enquiry. Plain text only (customer input is never rendered as HTML).
 * Never throws: the enquiry is already saved before this runs, so a failed email must not fail the form.
 * Failures are logged as EMAIL_DELIVERY_FAILED with the SMTP error code only (no personal data).
 */
export async function notifyNewEnquiry(enquiry: Enquiry): Promise<void> {
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
  const user = process.env.GMAIL_USER || businessEmail;
  if (!pass) {
    // Loud in production: every enquiry is going unemailed until the password is set.
    const log = process.env.NODE_ENV === 'production' ? console.warn : console.info;
    log(`[notify] EMAIL_NOT_CONFIGURED: enquiry ${enquiry.id} saved but not emailed (GMAIL_APP_PASSWORD missing).`);
    return;
  }
  try {
    const mail = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 7000,
    });
    const send = mail.sendMail({
      from: { name: 'Visionary Eyecare Website', address: user },
      to: process.env.ENQUIRY_EMAIL_TO || businessEmail,
      // Strip line breaks so a crafted name can't break the subject header.
      subject: `New enquiry: ${enquiry.name.replace(/[\r\n]+/g, ' ').slice(0, 60)}`,
      text: body(enquiry),
    });
    // The visitor waits on this, so cap the whole send (the per-step timeouts above could otherwise add up).
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT_TOTAL' })), 8000);
    });
    try {
      await Promise.race([send, deadline]);
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : err instanceof Error ? err.name : 'error';
    const hint = code === 'EAUTH' ? ' Check GMAIL_USER / GMAIL_APP_PASSWORD (an app password, not the normal Gmail password).' : '';
    console.error(`[notify] EMAIL_DELIVERY_FAILED: enquiry ${enquiry.id} (${code}).${hint}`);
  }
}
