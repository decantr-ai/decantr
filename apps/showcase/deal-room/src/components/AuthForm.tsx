import type { ReactNode } from 'react';
import { useState } from 'react';

interface Field {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
}

interface AuthFormProps {
  title: string;
  subtitle?: string;
  submitLabel: string;
  fields: Field[];
  onSubmit: (data: Record<string, string>) => void;
  extras?: ReactNode;
  footer?: ReactNode;
}

export function AuthForm({ title, subtitle, submitLabel, fields, onSubmit, extras, footer }: AuthFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h1 className="serif-display" style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>{subtitle}</p>}
      </div>
      <form
        onSubmit={e => { e.preventDefault(); onSubmit(values); }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {fields.map(f => (
          <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label className="d-label" htmlFor={f.name}>{f.label}</label>
            <input
              id={f.name}
              className="d-control"
              type={f.type}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              value={values[f.name] || ''}
              onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
            />
          </div>
        ))}
        <button className="d-interactive" data-variant="primary" type="submit" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
          {submitLabel}
        </button>
      </form>
      {extras}
      {footer}
    </div>
  );
}
