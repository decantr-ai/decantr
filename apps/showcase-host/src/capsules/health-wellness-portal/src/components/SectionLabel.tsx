import type { CSSProperties, ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  return (
    <div className="d-label" style={style}>
      {children}
    </div>
  );
}
