import { css } from '@decantr/css';
import { Link } from 'react-router-dom';

interface AuthField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  fields: AuthField[];
  submitLabel: string;
  footerText?: string;
  footerLink?: { label: string; to: string };
  secondaryLink?: { label: string; to: string };
}

export function AuthForm({ title, subtitle, fields, submitLabel, footerText, footerLink, secondaryLink }: AuthFormProps) {
  return (
    <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
      <div className={css('_flex _col _gap1')} style={{ marginBottom: 'var(--d-gap-2)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h1>
        <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{subtitle}</p>
      </div>

      {fields.map((field) => (
        <div key={field.name} className={css('_flex _col _gap1')}>
          <label htmlFor={field.name} className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            className="d-control neon-glow-hover"
            autoComplete={field.type === 'password' ? 'current-password' : field.type === 'email' ? 'email' : undefined}
          />
        </div>
      ))}

      <button
        type="submit"
        className="d-interactive neon-glow-hover"
        style={{
          width: '100%',
          justifyContent: 'center',
          background: 'var(--d-accent)',
          color: 'var(--d-bg)',
          borderColor: 'var(--d-accent)',
          fontWeight: 500,
          marginTop: 'var(--d-gap-2)',
        }}
      >
        {submitLabel}
      </button>

      {(footerText || secondaryLink) && (
        <div className={css('_flex _col _aic _gap2')} style={{ marginTop: 'var(--d-gap-1)' }}>
          {footerText && footerLink && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
              {footerText}{' '}
              <Link to={footerLink.to} style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>
                {footerLink.label}
              </Link>
            </p>
          )}
          {secondaryLink && (
            <Link to={secondaryLink.to} className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              {secondaryLink.label}
            </Link>
          )}
        </div>
      )}
    </form>
  );
}
