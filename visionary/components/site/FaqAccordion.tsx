'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motionTokens } from '@/lib/motion';
import { whatsappLink, type Faq } from '@/lib/site';

const TYPING_MS = 900;
const askLink = (q: string) => whatsappLink(`Hi Visionary Eyecare, I have a question: ${q}`);

/**
 * FAQ as a chat with the team. Tapping a question "sends" it as the customer's message; after a short typing
 * indicator the team's answer appears, with a WhatsApp link prefilled with that question. Every answer is in the
 * HTML (inactive ones are `hidden`), so content is complete without JS and for search engines.
 */
export default function FaqChat({ items, greeting, links }: { items: Faq[]; greeting: string; links?: ReactNode }) {
  const [active, setActive] = useState(0);
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState(false);
  const [announce, setAnnounce] = useState('');
  const hintId = useId();
  const reduce = useReducedMotion();
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pick = (i: number) => {
    if (i === active && !typing) return;
    window.clearTimeout(timer.current);
    setActive(i);
    setAsked(true);
    setAnnounce('');
    const reply = () => {
      setTyping(false);
      setAnnounce(`Visionary Eyecare replied: ${items[i].a}`);
    };
    if (reduce) {
      reply();
      return;
    }
    setTyping(true);
    timer.current = window.setTimeout(reply, TYPING_MS);
  };

  const pop = {
    initial: asked ? { opacity: 0, y: motionTokens.distance.sm, scale: 0.98 } : false,
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth },
  } as const;

  return (
    <div className="chat-wrap">
      <div className="chat-side">
        <p className="chat-hint" id={hintId}>
          Choose a question
        </p>
        <ul className="chat-chips" role="list" aria-labelledby={hintId}>
          {items.map((f, i) => (
            <li key={f.q}>
              <button type="button" className="chat-chip" aria-current={i === active ? 'true' : undefined} onClick={() => pick(i)}>
                {f.q}
              </button>
            </li>
          ))}
        </ul>
        {links}
      </div>

      <div className="chat-window" role="group" aria-label="Chat with Visionary Eyecare">
        <div className="chat-bar">
          <span className="chat-avatar" aria-hidden="true">
            V
          </span>
          <span>
            <strong>Visionary Eyecare</strong>
            <small>Optometrist &amp; optician · OUG Parklane</small>
          </span>
        </div>
        <div className="chat-body">
          {/* Persistent status region: announces each answer after the user picks a question. */}
          <div role="status" className="sr-only">
            {announce}
          </div>
          <p className="chat-msg chat-team">
            <span className="sr-only">Visionary Eyecare: </span>
            {greeting}
          </p>
          {items.map((f, i) => (
            <div key={f.q} className="chat-exchange" hidden={i !== active}>
              {i === active && (
                <>
                  <motion.p key={`q${i}`} className="chat-msg chat-me" {...pop}>
                    <span className="sr-only">You asked: </span>
                    {f.q}
                    <span className="chat-ticks" aria-hidden="true">
                      ✓✓
                    </span>
                  </motion.p>
                  {typing ? (
                    <div className="chat-typing" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </div>
                  ) : (
                    <motion.div key={`a${i}`} className="chat-answer" {...pop}>
                      <p className="chat-msg chat-team">
                        <span className="sr-only">Visionary Eyecare: </span>
                        {f.a}
                      </p>
                      <a className="chat-cta" href={askLink(f.q)} target="_blank" rel="noreferrer">
                        Continue on WhatsApp <span aria-hidden="true">→</span>
                        <span className="sr-only"> (opens WhatsApp)</span>
                      </a>
                    </motion.div>
                  )}
                </>
              )}
              {i !== active && (
                <>
                  <p className="chat-msg chat-me">{f.q}</p>
                  <p className="chat-msg chat-team">{f.a}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
