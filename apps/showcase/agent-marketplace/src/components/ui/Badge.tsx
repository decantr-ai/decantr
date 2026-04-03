import type { ReactNode } from 'react';

interface BadgeProps {
  status?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

export function Badge({ status, children, className = '' }: BadgeProps) {
  return (
    <span className={'d-annotation ' + className} data-status={status}>
      {children}
    </span>
  );
}
