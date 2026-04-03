import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-pill)] px-4 py-2 text-[var(--fg)] placeholder:text-[var(--fg-dim)] focus:outline-none focus:border-[var(--primary)] transition-colors ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
