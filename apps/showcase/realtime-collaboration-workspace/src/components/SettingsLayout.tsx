import { Link, useLocation } from 'react-router-dom';

interface NavItem { to: string; label: string; }

export function SettingsLayout({ title, subtitle, nav, children }: { title: string; subtitle?: string; nav: NavItem[]; children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1.75rem 2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>{subtitle}</p>}
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', alignItems: 'start' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', position: 'sticky', top: '1rem' }}>
          {nav.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '0.4375rem 0.625rem',
                  fontSize: '0.8125rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--d-radius-sm)',
                  color: active ? 'var(--d-text)' : 'var(--d-text-muted)',
                  background: active ? 'var(--d-surface-raised)' : 'transparent',
                  fontWeight: active ? 500 : 400,
                  borderLeft: active ? '2px solid var(--d-primary)' : '2px solid transparent',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}

export const workspaceNav: NavItem[] = [
  { to: '/settings', label: 'General' },
  { to: '/settings/members', label: 'Members' },
  { to: '/settings/permissions', label: 'Permissions' },
  { to: '/settings/billing', label: 'Billing' },
];

export const profileNav: NavItem[] = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/security', label: 'Security' },
  { to: '/profile/preferences', label: 'Preferences' },
];
