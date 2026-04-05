import { useState, type FormEvent, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  submitLabel: string;
  onSubmit: () => void;
  fields: { name: string; label: string; type: string; placeholder?: string; autoComplete?: string }[];
  footer?: ReactNode;
  altLinks?: { label: string; to: string }[];
}

export function AuthForm({ title, subtitle, submitLabel, onSubmit, fields, footer, altLinks }: AuthFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {fields.map(f => (
          <label key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="fin-label">{f.label}</span>
            <input
              className="fin-input"
              type={f.type}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              value={values[f.name] ?? ''}
              onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
            />
          </label>
        ))}
      </div>
      <button type="submit" className="d-interactive" data-variant="primary" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
        {submitLabel}
      </button>
      {altLinks && altLinks.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          {altLinks.map(l => (
            <NavLink key={l.to} to={l.to} style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>{l.label}</NavLink>
          ))}
        </div>
      )}
      {footer}
    </form>
  );
}
