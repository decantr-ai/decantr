import { css } from '@decantr/css';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-danger',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: css('_px3 _py1 _textsm'),
  md: css('_px4 _py2 _textbase'),
  lg: css('_px6 _py3 _textlg'),
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={
        css('_inlineflex _aic _jcc _gap2 _fontmedium _rounded _trans _selectnone') +
        ' ' + variantStyles[variant] +
        ' ' + sizeStyles[size] +
        (disabled ? ' ' + css('_op50 _notallowed') : ' ' + css('_pointer')) +
        (className ? ' ' + className : '')
      }
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
