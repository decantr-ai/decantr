import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  submitLabel: string;
  fields: Array<{ name: string; label: string; type: string; placeholder?: string; autoComplete?: string }>;
  footer?: ReactNode;
  redirect?: string;
  mode?: 'login' | 'register' | 'generic';
}

export function AuthForm({ title, subtitle, submitLabel, fields, footer, redirect = '/agents', mode = 'generic' }: AuthFormProps) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') login(values.email || '', values.password || '');
    else if (mode === 'register') register(values.email || '', values.password || '', values.name || '');
    navigate(redirect);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: subtitle ? 6 : 0, fontFamily: 'var(--d-font-mono)' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{subtitle}</p>}
      </div>
      {fields.map(f => (
        <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="d-label" htmlFor={f.name}>{f.label}</label>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            className="d-control"
            style={{ fontFamily: f.type === 'password' || f.type === 'email' ? 'var(--d-font-mono)' : undefined, fontSize: '0.85rem' }}
            value={values[f.name] || ''}
            onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
          />
        </div>
      ))}
      <button
        type="submit"
        className="d-interactive"
        data-variant="primary"
        style={{
          justifyContent: 'center',
          background: 'var(--d-accent)',
          borderColor: 'var(--d-accent)',
          color: '#0a0a0a',
          fontWeight: 600,
          fontSize: '0.85rem',
          marginTop: 4,
        }}
      >
        {submitLabel}
      </button>
      {footer && <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', textAlign: 'center', marginTop: 4 }}>{footer}</div>}
    </form>
  );
}

export function OAuthDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.75rem 0', fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
      <span>OR</span>
      <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
    </div>
  );
}

export function OAuthButtons() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <button className="d-interactive" data-variant="ghost" style={{ justifyContent: 'center', fontSize: '0.8rem' }}>
        Continue with GitHub
      </button>
      <button className="d-interactive" data-variant="ghost" style={{ justifyContent: 'center', fontSize: '0.8rem' }}>
        Continue with Google
      </button>
    </div>
  );
}

export function AuthFooterLink({ prompt, label, to }: { prompt: string; label: string; to: string }) {
  return (
    <>
      {prompt}{' '}
      <Link to={to} style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>{label}</Link>
    </>
  );
}
