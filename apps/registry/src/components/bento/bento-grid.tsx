'use client';

import { useRef, useEffect, useCallback, type ReactNode } from 'react';

const TYPE_ACCENTS: Record<string, string> = {
  pattern: '#F58882',
  theme: '#FDA303',
  blueprint: '#0AF3EB',
  shell: '#00E0AB',
  archetype: '#6500C6',
};

interface BentoGridProps {
  type: string;
  children: ReactNode;
}

export function BentoGrid({ type, children }: BentoGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const accent = TYPE_ACCENTS[type] || '#FDA303';

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = gridRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    el.style.setProperty('--mouse-x', '-200px');
    el.style.setProperty('--mouse-y', '-200px');
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handlePointerMove, handlePointerLeave]);

  return (
    <div
      ref={gridRef}
      className="lum-bento-grid lum-stagger"
      style={{ '--lum-type-accent': accent } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
