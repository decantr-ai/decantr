import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantClass: Record<BadgeVariant, string> = {
  default: 'carbon-badge',
  success: 'carbon-badge carbon-badge-success',
  warning: 'carbon-badge carbon-badge-warning',
  danger: 'carbon-badge carbon-badge-danger',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return <span className={variantClass[variant]}>{children}</span>;
}
