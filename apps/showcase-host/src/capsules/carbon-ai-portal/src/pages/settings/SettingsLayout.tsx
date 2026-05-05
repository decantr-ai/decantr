import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Shield, Sliders, AlertTriangle } from 'lucide-react';

const navItems = [
  { to: '/settings/profile', label: 'Profile', icon: User },
  { to: '/settings/security', label: 'Security', icon: Shield },
  { to: '/settings/preferences', label: 'Preferences', icon: Sliders },
  { to: '/settings/account', label: 'Danger zone', icon: AlertTriangle },
];

export function SettingsLayout() {
  const location = useLocation();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          padding: '1rem 1.5rem 0.875rem',
          borderBottom: '1px solid var(--d-border)',
        }}
      >
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Settings</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>
          Manage your account, security, and preferences.
        </p>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden' }}>
        <nav
          style={{
            borderRight: '1px solid var(--d-border)',
            padding: '0.875rem 0.625rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
            overflowY: 'auto',
          }}
        >
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="carbon-conv-item"
                data-active={isActive ? 'true' : 'false'}
              >
                <Icon size={14} style={{ flexShrink: 0, opacity: 0.75 }} />
                <span style={{ flex: 1 }}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
          <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
