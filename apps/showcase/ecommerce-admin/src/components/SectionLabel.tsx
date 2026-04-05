import type { CSSProperties, ReactNode } from 'react';

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="d-label"
      style={{
        borderLeft: '2px solid var(--d-accent)',
        paddingLeft: '0.5rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
