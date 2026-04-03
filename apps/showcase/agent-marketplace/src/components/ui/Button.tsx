import { css } from '@decantr/css';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant, children, fullWidth, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={css('_px4 _py2', fullWidth && '_wfull _jcc') + ' d-interactive ' + className}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  );
}
