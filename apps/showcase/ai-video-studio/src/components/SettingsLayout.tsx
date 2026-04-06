import { NavLink, useLocation } from 'react-router-dom';
import { User, Shield, Palette, AlertTriangle } from 'lucide-react';

const tabs = [
  { to: '/settings/profile', label: 'Profile', icon: User },
  { to: '/settings/security', label: 'Security', icon: Shield },
  { to: '/settings/preferences', label: 'Preferences', icon: Palette },
  { to: '/settings/danger', label: 'Danger Zone', icon: AlertTriangle },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', gap: 'var(--d-gap-6)', maxWidth: 900 }}>
      <nav style={{ width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="d-label" style={{ padding: '0.25rem 0.75rem', marginBottom: '0.25rem' }}>SETTINGS</div>
        {tabs.map(tab => {
          const active = location.pathname === tab.to;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="d-interactive"
              data-variant="ghost"
              style={{
                padding: '0.4rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                textDecoration: 'none',
                border: 'none',
                borderLeft: active ? '2px solid var(--d-primary)' : '2px solid transparent',
                borderRadius: 0,
                color: active ? 'var(--d-text)' : 'var(--d-text-muted)',
                background: active ? 'color-mix(in srgb, var(--d-primary) 8%, transparent)' : undefined,
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
