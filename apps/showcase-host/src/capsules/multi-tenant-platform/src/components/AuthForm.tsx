import { useState, type FormEvent, type ReactNode } from 'react';
import { Layers } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface AuthFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: (data: Record<string, string>) => void;
  fields: { name: string; label: string; type: string; placeholder?: string; autoComplete?: string }[];
  footer?: ReactNode;
  extras?: ReactNode;
}

export function AuthForm({ title, subtitle, submitLabel, onSubmit, fields, footer, extras }: AuthFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '0.5rem' }}>
        <Layers size={22} style={{ color: 'var(--d-primary)' }} />
        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--d-text)' }}>Tenantly</span>
      </NavLink>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{subtitle}</p>
      </div>

      {extras}

      {fields.map(f => (
        <label key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--d-text)', fontWeight: 500 }}>{f.label}</span>
          <input
            type={f.type}
            name={f.name}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            className="d-control"
            value={values[f.name] || ''}
            onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
            required
          />
        </label>
      ))}

      <button type="submit" className="lp-button-primary" style={{ justifyContent: 'center', padding: '0.6rem 1rem', fontSize: '0.875rem' }}>
        {submitLabel}
      </button>

      {footer}
    </form>
  );
}
