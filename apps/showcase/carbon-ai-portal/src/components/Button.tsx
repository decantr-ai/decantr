import { css } from '@decantr/css';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };

  const sizeAtoms: Record<string, string> = {
    sm: '_px3 _py1 _textsm',
    md: '_px4 _py2 _textbase',
    lg: '_px6 _py3 _textlg',
  };

  return (
    <button
      className={
        css(
          '_inlineflex _aic _gap2 _fontsemi _rounded _trans _pointer _selectnone _bordernone',
          sizeAtoms[size]
        ) +
        ' ' +
        baseStyles[variant] +
        ' hover-lift' +
        (className ? ' ' + className : '')
      }
      {...props}
    >
      {icon && <span className={css('_flex _aic _shrink0')}>{icon}</span>}
      {children}
    </button>
  );
}
