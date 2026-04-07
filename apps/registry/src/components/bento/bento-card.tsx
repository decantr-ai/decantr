import type { ReactNode } from 'react';

interface BentoCardProps {
  span?: 1 | 2 | 'full';
  label: string;
  children: ReactNode;
  className?: string;
}

export function BentoCard({ span = 1, label, children, className = '' }: BentoCardProps) {
  const spanClass =
    span === 'full'
      ? 'col-span-full'
      : span === 2
        ? 'col-span-2 max-md:col-span-full'
        : '';

  return (
    <div
      className={`lum-bento-card ${spanClass} ${className}`.trim()}
      role="region"
      aria-label={label}
    >
      {children}
    </div>
  );
}
