import { css } from '@decantr/css';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={css('_flex _col _gap1')}>
      {label && (
        <label htmlFor={inputId} className={css('_textsm _fontmedium')}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={'d-control carbon-input ' + className}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && (
        <span className="d-annotation" data-status="error" style={{ fontSize: '0.75rem' }}>
          {error}
        </span>
      )}
    </div>
  );
}
