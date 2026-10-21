'use client';
import { useState, useTransition } from 'react';
import { confirmRepliedAction } from '@/app/(admin)/admin/(panel)/enquiries/actions';

/** Shown after "Reply on WhatsApp" was clicked: asks whether the message was actually sent. */
export default function ConfirmBar({ id }: { id: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, start] = useTransition();
  if (dismissed) return null;
  return (
    <div className="confirm-bar" role="status">
      <p>Did you send the WhatsApp message?</p>
      <div className="btn-row">
        <button type="button" className="a-btn a-btn-sm a-btn-primary" disabled={pending} onClick={() => start(() => confirmRepliedAction(id))}>
          {pending ? 'Saving…' : 'Yes, mark as replied'}
        </button>
        <button type="button" className="a-btn a-btn-sm a-btn-ghost" onClick={() => setDismissed(true)}>
          Not yet
        </button>
      </div>
    </div>
  );
}
