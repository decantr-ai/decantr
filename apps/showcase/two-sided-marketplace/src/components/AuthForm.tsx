import type { ReactNode, FormEvent } from 'react';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  submitLabel: string;
  footer?: ReactNode;
  disabled?: boolean;
}

export function AuthForm({ title, subtitle, onSubmit, children, submitLabel, footer, disabled }: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {children}
      </div>
      <button type="submit" className="nm-button-primary" disabled={disabled} style={{ width: '100%', padding: '0.75rem' }}>
        {submitLabel}
      </button>
      {footer && <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>{footer}</div>}
    </form>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{hint}</span>}
    </label>
  );
}
