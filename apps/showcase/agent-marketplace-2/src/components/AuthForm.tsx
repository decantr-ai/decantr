import { type ReactNode } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';

interface AuthFormProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  submitLabel?: string;
  onSubmit?: () => void;
}

export function AuthForm({ title, description, children, footer, submitLabel = 'Continue' }: AuthFormProps) {
  return (
    <div className={css('_flex _col _gap6 _wfull') + ' d-surface carbon-card carbon-fade-slide'} style={{ padding: 'var(--d-gap-8)' }}>
      <div className={css('_flex _col _gap2 _textc')}>
        <h1 className={css('_textxl _fontsemi')}>{title}</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>{description}</p>
      </div>

      <form
        className={css('_flex _col _gap4')}
        onSubmit={e => { e.preventDefault(); }}
      >
        {children}

        <button
          type="submit"
          className={css('_wfull _py2 _px4') + ' d-interactive neon-glow-hover'}
          data-variant="primary"
        >
          {submitLabel}
        </button>
      </form>

      {footer && (
        <div className={css('_textc _textsm')} style={{ color: 'var(--d-text-muted)' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export function FormField({ label, type = 'text', placeholder, required = true }: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className={css('_flex _col _gap1')}>
      <label className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)' }}>
        {label} {required && <span style={{ color: 'var(--d-error)' }}>*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder || label}
        className="d-control carbon-input"
        required={required}
      />
    </div>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={css('_textsm')} style={{ color: 'var(--d-accent)' }}>
      {children}
    </Link>
  );
}

export function OAuthButtons() {
  return (
    <>
      <div className={css('_flex _aic _gap3')} style={{ color: 'var(--d-text-muted)' }}>
        <div className="carbon-divider" style={{ flex: 1, height: 0 }} />
        <span className={css('_textxs _uppercase') + ' mono-data'}>or continue with</span>
        <div className="carbon-divider" style={{ flex: 1, height: 0 }} />
      </div>
      <div className={css('_flex _gap3')}>
        <button className={css('_flex1 _py2') + ' d-interactive'} data-variant="ghost">
          GitHub
        </button>
        <button className={css('_flex1 _py2') + ' d-interactive'} data-variant="ghost">
          Google
        </button>
      </div>
    </>
  );
}
