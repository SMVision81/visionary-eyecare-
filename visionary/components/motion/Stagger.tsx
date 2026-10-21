'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { motionTokens } from '@/lib/motion';

const item = {
  hidden: { opacity: 0, y: motionTokens.distance.lg },
  show: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth } },
};

type StaggerProps = {
  children: React.ReactNode;
  as?: 'div' | 'ul' | 'ol';
  className?: string;
  gap?: number;
};

/**
 * Staggers the entrance of its direct <StaggerItem> children when scrolled into view.
 * Usage:
 *   <Stagger as="ul" className="why-grid">
 *     {items.map((i) => <StaggerItem as="li" key={i.id}>…</StaggerItem>)}
 *   </Stagger>
 */
export function Stagger({ children, as = 'div', className, gap = motionTokens.stagger.normal }: StaggerProps) {
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
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  as = 'div',
  className,
}: {
  children: React.ReactNode;
  as?: 'div' | 'li' | 'article';
  className?: string;
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  );
}
