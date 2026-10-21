'use client';
import { useEffect } from 'react';
import { markOpenedAction } from '@/app/(admin)/admin/(panel)/enquiries/actions';

/** Moves a 'new' enquiry to 'awaiting_reply' when the owner opens it. Renders nothing. */
export default function MarkOpened({ id, status }: { id: string; status: string }) {
  useEffect(() => {
    if (status === 'new') void markOpenedAction(id);
  }, [id, status]);
  return null;
}
