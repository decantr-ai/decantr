import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white',
  secondary: 'bg-[var(--bg-elevated)] hover:bg-[var(--border-hover)] text-[var(--fg)] border border-[var(--border)]',
  ghost: 'bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--fg-muted)]',
  danger: 'bg-[var(--error)] hover:opacity-90 text-white',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-[var(--radius-pill)] transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
