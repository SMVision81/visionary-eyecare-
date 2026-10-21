'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { motionTokens } from '@/lib/motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const offset = (direction: Direction, distance: number) => ({
  x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
  y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
});

type RevealProps = {
  children: React.ReactNode;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
  className?: string;
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
};

/**
 * Fades + slides its children in when scrolled into view.
 * SSR-safe: renders fully visible on the server and before hydration, so content never
 * depends on JavaScript. Best for below-the-fold content.
 */
export default function Reveal({
  children,
  as = 'div',
  className,
  direction = 'up',
  distance = motionTokens.distance.lg,
  delay = 0,
  duration = motionTokens.duration.slow,
  once = true,
}: RevealProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offset(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: motionTokens.easing.smooth }}
    >
      {children}
    </MotionTag>
  );
}
