'use client';
import { useEffect, useRef, useState } from 'react';

/** "Select all on this page" for the reviews bulk bar. Its state follows the row checkboxes in the same form. */
export default function SelectAll({ count }: { count: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'none' | 'some' | 'all'>('none');

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const sync = () => {
      const boxes = [...form.querySelectorAll<HTMLInputElement>('input[name="ids"]')];
      const on = boxes.filter((b) => b.checked).length;
      setState(on === 0 ? 'none' : on === boxes.length ? 'all' : 'some');
    };
    form.addEventListener('change', sync);
    sync();
    return () => form.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'some';
  }, [state]);

  return (
    <label className="select-all">
      <input
        ref={ref}
        type="checkbox"
        checked={state === 'all'}
        onChange={(e) => {
          const on = e.target.checked;
          e.target.form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((box) => {
            box.checked = on;
          });
          setState(on ? 'all' : 'none');
        }}
      />
      Select all {count} on this page
    </label>
  );
}
