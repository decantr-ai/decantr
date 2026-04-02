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
        <label htmlFor={inputId} className={css('_textsm _fontsemi _fgtext')}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={'carbon-input' + (error ? ' input-error' : '') + (className ? ' ' + className : '')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className={css('_textxs _fgerror')} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
