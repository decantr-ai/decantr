import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/danger', label: 'Danger zone' },
];

export function SettingsLayout({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const location = useLocation();
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <div className="d-label" style={{ marginBottom: '0.5rem' }}>Account settings</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>{title}</h1>
        {description && <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9rem' }}>{description}</p>}
      </header>
      <nav style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--d-border)', overflowX: 'auto' }}>
        {tabs.map(t => {
          const active = location.pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              style={{
                padding: '0.625rem 0.875rem',
                fontSize: '0.875rem',
                textDecoration: 'none',
                color: active ? 'var(--d-primary)' : 'var(--d-text-muted)',
                fontWeight: active ? 600 : 500,
                borderBottom: active ? '2px solid var(--d-primary)' : '2px solid transparent',
                marginBottom: -1,
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>{children}</div>
    </div>
  );
}

export function SettingsSection({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="nm-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--d-border)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h2>
        {description && <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{description}</p>}
      </div>
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
      {footer && (
        <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--d-border)', background: 'var(--d-surface-raised)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {footer}
        </div>
      )}
    </section>
  );
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--d-text-muted)' }}>{label}</span>
      {children}
    </label>
  );
}
