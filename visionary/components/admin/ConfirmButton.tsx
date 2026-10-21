'use client';
import { useState } from 'react';

type Props = {
  /** Value for the `op` field, e.g. "removed:rev_003" or "approved:bulk". */
  op: string;
  label: string;
  confirmText: string;
  variant?: 'danger' | 'primary' | 'ghost';
  title?: string;
};

/** A form submit button that asks "Are you sure?" inline before submitting. */
export default function ConfirmButton({ op, label, confirmText, variant = 'ghost', title }: Props) {
  const [confirming, setConfirming] = useState(false);
  const cls = `a-btn a-btn-sm a-btn-${variant}`;
  if (confirming)
    return (
      <span className="confirm-inline">
        <span>{confirmText}</span>
        <button type="submit" name="op" value={op} className={`${cls} a-btn-danger`}>
          Yes
        </button>
        <button type="button" className={`${cls} a-btn-ghost`} onClick={() => setConfirming(false)}>
          No
        </button>
      </span>
    );
  return (
    <button type="button" className={cls} title={title} onClick={() => setConfirming(true)}>
      {label}
    </button>
  );
}
