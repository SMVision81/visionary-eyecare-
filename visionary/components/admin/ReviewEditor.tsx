'use client';
import { useActionState, useRef, useState } from 'react';
import { updateReviewAction } from '@/app/(admin)/admin/(panel)/reviews/actions';
import { rewordRatio } from '@/lib/validation';
import type { ActionState, Review } from '@/lib/types';

/** Mirrors a form field in local state so the "Reset" button and live warnings work. */
export default function ReviewEditor({ review, publish }: { review: Review; publish: boolean }) {
  const original = review.originalText;
  const initialText = review.displayText ?? original;
  const [state, action, pending] = useActionState(updateReviewAction, { ok: false } as ActionState);
  const [text, setText] = useState(initialText);
  const err = state.fieldErrors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  const dirty = text !== initialText;
  const heavyRewrite = text !== original && rewordRatio(original, text) > 0.25;

  const reset = () => {
    setText(original);
    const el = formRef.current?.querySelector<HTMLTextAreaElement>('[name=displayText]');
    if (el) el.value = original;
  };

  const submitWith = (publishFlag: boolean) => {
    const flag = formRef.current?.querySelector<HTMLInputElement>('[name=publish]');
    if (flag) flag.value = publishFlag ? '1' : '0';
    formRef.current?.requestSubmit();
  };

  return (
    <form action={action} ref={formRef}>
      <input type="hidden" name="id" value={review.id} />
      <input type="hidden" name="publish" value="0" />
      {state.message && (
        <p className={`alert ${state.ok ? 'alert-ok' : 'alert-error'}`} role="status">
          {state.message}
        </p>
      )}

      <label className="field">
        <span>Name shown on website</span>
        <input name="displayName" defaultValue={review.displayName} maxLength={60} aria-invalid={!!err.displayName} required />
        {err.displayName && <span className="field-error">{err.displayName}</span>}
      </label>

      <label className="field">
        <span>Text shown on website</span>
        <textarea
          name="displayText"
          defaultValue={initialText}
          rows={5}
          required
          maxLength={original.length + 20}
          aria-invalid={!!err.displayText}
          onChange={(e) => setText(e.target.value)}
        />
        <span className="field-hint">
          Excerpt or light fixes only — never rewrite what the customer said. {text.length} / {original.length + 20} characters.
        </span>
        {err.displayText && <span className="field-error">{err.displayText}</span>}
        {heavyRewrite && (
          <span className="alert alert-warn">
            This changes the customer’s words quite a lot. Reviews must stay truthful — prefer trimming over rewording.
          </span>
        )}
      </label>

      <div className="field-row">
        <label className="field field-sm">
          <span>Display order</span>
          <input name="sortOrder" type="number" min={0} max={999} defaultValue={review.sortOrder} aria-invalid={!!err.sortOrder} />
          <span className="field-hint">Lower shows first.</span>
          {err.sortOrder && <span className="field-error">{err.sortOrder}</span>}
        </label>
        <label className="check">
          <input type="checkbox" name="featured" defaultChecked={review.featured} />
          <span>Featured (shown first on the website)</span>
        </label>
      </div>

      <div className="btn-row">
        {publish ? (
          <>
            <button type="button" className="a-btn a-btn-primary" disabled={pending} onClick={() => submitWith(true)}>
              Approve & publish
            </button>
            <button type="button" className="a-btn a-btn-ghost" disabled={pending} onClick={() => submitWith(false)}>
              Save only
            </button>
          </>
        ) : (
          <button type="submit" className="a-btn a-btn-primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        )}
        {dirty && (
          <button type="button" className="a-btn a-btn-ghost" onClick={reset}>
            Reset to original
          </button>
        )}
      </div>
    </form>
  );
}
