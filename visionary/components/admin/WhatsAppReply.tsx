'use client';
import { useState, useTransition } from 'react';
import { logWhatsAppAttemptAction } from '@/app/(admin)/admin/(panel)/enquiries/actions';
import { fillTemplate, replyTemplates } from '@/lib/reply-templates';

type Props = { id: string; customerName: string; waLink: string | null };

/**
 * Reply composer: pick a quick reply or write a message, then open WhatsApp to the customer.
 * The click logs the attempt; the page then asks the owner to confirm it was sent.
 */
export default function WhatsAppReply({ id, customerName, waLink }: Props) {
  const [active, setActive] = useState(replyTemplates[0].id);
  const [text, setText] = useState(fillTemplate(replyTemplates[0].body, customerName));
  const [logging, startLogging] = useTransition();

  const pick = (templateId: string) => {
    const t = replyTemplates.find((x) => x.id === templateId);
    if (!t) return;
    setActive(t.id);
    setText(fillTemplate(t.body, customerName));
  };

  const openWhatsApp = () => {
    const body = text.trim();
    if (!body || !waLink) return;
    startLogging(async () => {
      await logWhatsAppAttemptAction(id, body);
    });
    const url = `${waLink.split('?')[0]}?text=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="reply-box">
      <div className="chips" role="group" aria-label="Quick replies">
        {replyTemplates.map((t) => (
          <button key={t.id} type="button" className="chip" aria-pressed={active === t.id} onClick={() => pick(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Your message</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={2000} />
      </label>
      {waLink ? (
        <div className="composer-foot">
          <span className="field-hint">
            {text.length} / 2000 · Opens WhatsApp with your message ready, then confirm it was sent.
          </span>
          <div className="btn-row">
            <button type="button" className="a-btn a-btn-primary" onClick={openWhatsApp} disabled={logging || !text.trim()}>
              Reply on WhatsApp →
            </button>
          </div>
        </div>
      ) : (
        <p className="alert alert-warn">This phone number doesn’t look like a valid Malaysian number, so WhatsApp can’t be opened. Reply by calling instead, or fix the number.</p>
      )}
    </div>
  );
}
