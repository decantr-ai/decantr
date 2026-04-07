'use client';

import { useEffect, useRef, useState } from 'react';
import { BentoCard } from './bento-card';

interface UsedByCardProps {
  count?: number;
}

export function UsedByCard({ count = 0 }: UsedByCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (count === 0) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setDisplayed(count);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          const start = performance.now();
          const duration = 500;
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setDisplayed(Math.round(progress * count));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count]);

  return (
    <BentoCard span={1} label="Used by">
      <div ref={ref}>
        <p className="d-label mb-2">Installs</p>

        {count === 0 ? (
          <p className="text-sm text-d-muted">Be the first to use this</p>
        ) : (
          <>
            <p className="text-3xl font-bold font-mono text-d-text mb-2">
              {displayed.toLocaleString()}
            </p>
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(5, count) }, (_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-d-bg bg-d-surface-raised"
                  aria-hidden="true"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </BentoCard>
  );
}
