import { css } from '@decantr/css';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={css('_flex _col _gap1')}>
      {label && (
        <label htmlFor={inputId} className={css('_textsm _fontmedium _fgtext')}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={
          css('_wfull _px3 _py2 _textbase _rounded _bgbg _fgtext _bordernone _bw1') +
          ' carbon-input' +
          (error ? ' input-error' : '') +
          (className ? ' ' + className : '')
        }
        {...props}
      />
      {error && (
        <span className={css('_textxs _fgerror')}>{error}</span>
      )}
    </div>
  );
}
