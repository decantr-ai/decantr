import { Link } from 'react-router-dom';

interface Field {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: Field[];
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  footer?: React.ReactNode;
  showOAuth?: boolean;
  error?: string;
}

export function AuthForm({ title, subtitle, fields, submitLabel, onSubmit, footer, showOAuth, error }: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.375rem' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{subtitle}</p>}
      </div>

      {error && (
        <div className="d-annotation" data-status="error" style={{ padding: '0.5rem 0.75rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {fields.map((f) => (
          <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label
              htmlFor={f.id}
              style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}
            >
              {f.label}
            </label>
            <input
              id={f.id}
              name={f.id}
              type={f.type || 'text'}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              className="carbon-input"
              style={{ fontSize: '0.875rem' }}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="d-interactive"
        data-variant="primary"
        style={{ justifyContent: 'center', fontSize: '0.875rem', padding: '0.625rem 1rem' }}
      >
        {submitLabel}
      </button>

      {showOAuth && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button type="button" className="d-interactive" style={{ justifyContent: 'center', fontSize: '0.8125rem' }}>
              Google
            </button>
            <button type="button" className="d-interactive" style={{ justifyContent: 'center', fontSize: '0.8125rem' }}>
              GitHub
            </button>
          </div>
        </>
      )}

      {footer && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textAlign: 'center', paddingTop: '0.5rem' }}>
          {footer}
        </div>
      )}
    </form>
  );
}

export function AuthFooterLink({ children, to }: { children: React.ReactNode; to: string }) {
  return (
    <Link to={to} style={{ color: 'var(--d-accent)', textDecoration: 'none', fontWeight: 500 }}>
      {children}
    </Link>
  );
}
