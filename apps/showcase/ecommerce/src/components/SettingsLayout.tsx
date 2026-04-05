import type { ReactNode } from 'react';

export function SettingsLayout({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h1>
        {description && <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9rem' }}>{description}</p>}
      </header>
      {children}
    </div>
  );
}

export function SettingsSection({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="ec-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--d-border)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h2>
        {description && <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{description}</p>}
      </div>
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
      {footer && (
        <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--d-border)', background: 'var(--d-surface-muted)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {footer}
        </div>
      )}
    </section>
  );
}
