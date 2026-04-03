import type { ReactNode } from 'react';

interface CardGridProps {
  columns?: string;
  children: ReactNode;
}

export function CardGrid({ columns = 'repeat(auto-fill, minmax(260px, 1fr))', children }: CardGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: columns,
      gap: 'var(--d-gap-4)',
    }}>
      {children}
    </div>
  );
}
