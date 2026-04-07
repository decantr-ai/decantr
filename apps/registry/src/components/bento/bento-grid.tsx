'use client';

import { useRef, useCallback, useEffect, type ReactNode } from 'react';

interface Props {
  type: string;
  children: ReactNode;
}

export function BentoGrid({ type, children }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const el = gridRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    // Disable cursor glow on touch devices or reduced motion
    const isTouch = matchMedia('(pointer: coarse)').matches;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducedMotion) return;

    el.addEventListener('pointermove', handlePointerMove);
    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handlePointerMove]);

  return (
    <div
      ref={gridRef}
      className="lum-bento-grid lum-stagger relative z-10"
      data-content-type={type}
    >
      {children}
    </div>
  );
}
