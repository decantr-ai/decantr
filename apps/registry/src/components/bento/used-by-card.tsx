'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  count: number;
}

export function UsedByCard({ count }: Props) {
  const [displayCount, setDisplayCount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (count === 0) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayCount(count);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const duration = 500;
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayCount(Math.round(eased * count));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [count]);

  return (
    <div
      ref={cardRef}
      className="lum-bento-card flex flex-col gap-3 items-center justify-center text-center"
      role="region"
      aria-label="Install count"
    >
      {count > 0 ? (
        <>
          <span className="lum-stat-glow">{displayCount}</span>
          <span className="text-xs text-d-muted">installs</span>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: Math.min(5, count) }).map((_, i) => (
              <span
                key={i}
                className="w-6 h-6 rounded-full bg-d-surface-raised border border-d-border"
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <span className="lum-stat-glow">0</span>
          <span className="text-xs text-d-muted">Be the first to use this</span>
        </>
      )}
    </div>
  );
}
