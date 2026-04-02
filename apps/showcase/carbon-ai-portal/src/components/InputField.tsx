import { css } from '@decantr/css';
import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputField({ label, error, id, className = '', ...props }: InputFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={css('_flex _col _gap1')}>
      <label htmlFor={fieldId} className={css('_textsm _fontsemi _fgtext')}>
        {label}
      </label>
      <input
        id={fieldId}
        className={css('_textbase _rounded _trans') + ' carbon-input' + (className ? ' ' + className : '')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${fieldId}-error`} className={css('_textxs _fgerror')} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
