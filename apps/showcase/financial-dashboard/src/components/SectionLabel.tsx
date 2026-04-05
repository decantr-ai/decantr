import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
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
