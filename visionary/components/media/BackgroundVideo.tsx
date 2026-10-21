'use client';
import { useEffect, useRef, useState } from 'react';
import type { VideoMedia } from '@/lib/media';

type Props = { item: VideoMedia; className?: string; decorative?: boolean };

/**
 * Muted, inline video for backgrounds and feature panels (loops, or plays once when `item.once`).
 * - Shows the poster only when the visitor prefers reduced motion.
 * - Pauses when off-screen to save battery and data.
 */
export default function BackgroundVideo({ item, className, decorative = true }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    const io = new IntersectionObserver(([entry]) => {
      // A play-once video that has finished stays on its last frame.
      if (entry.isIntersecting) {
        if (!video.ended) video.play().catch(() => {});
      } else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) {
    return <img className={className} src={item.poster} alt={decorative ? '' : item.alt} />;
  }

  return (
    <video
      ref={ref}
      className={className}
      poster={item.poster}
      width={item.width}
      height={item.height}
      muted
      loop={!item.once}
      playsInline
      autoPlay
      preload="metadata"
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : item.alt}
    >
      {item.srcWebm && <source src={item.srcWebm} type="video/webm" />}
      <source src={item.src} type="video/mp4" />
      {item.captions && <track kind="captions" src={item.captions} srcLang="en" label="English" default />}
    </video>
  );
}
