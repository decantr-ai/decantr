import { css } from '@decantr/css';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variantClass =
    variant === 'primary' ? 'badge-primary' :
    variant === 'success' ? 'badge-success' :
    variant === 'warning' ? 'badge-warning' :
    variant === 'error' ? 'badge-error' :
    'badge-default';

  return (
    <span
      className={
        css('_inlineflex _aic _px2 _py1 _textxs _fontmedium _roundedfull') +
        ' ' + variantClass
      }
    >
      {children}
    </span>
  );
}
