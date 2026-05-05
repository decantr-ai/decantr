import { css } from '@decantr/css';
import { Link, useLocation } from 'react-router-dom';
import { User, Shield, SlidersHorizontal, AlertTriangle } from 'lucide-react';

const settingsNav = [
  { to: '/settings/profile', icon: User, label: 'Profile' },
  { to: '/settings/security', icon: Shield, label: 'Security' },
  { to: '/settings/preferences', icon: SlidersHorizontal, label: 'Preferences' },
  { to: '/settings/danger', icon: AlertTriangle, label: 'Danger Zone' },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className={css('_flex _gap6')}>
      {/* Settings nav */}
      <div className={css('_flex _col _gap1 _shrink0')} style={{ width: 180 }}>
        <span className="d-label" style={{ padding: '0.25rem 0.625rem', marginBottom: '0.25rem' }}>Settings</span>
        {settingsNav.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="d-interactive"
              data-variant="ghost"
              style={{
                padding: '0.375rem 0.625rem',
                textDecoration: 'none',
                borderRadius: 2,
                fontSize: '0.8125rem',
                background: isActive ? 'color-mix(in srgb, var(--d-primary) 8%, transparent)' : undefined,
                color: isActive ? 'var(--d-primary)' : undefined,
              }}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: '40rem' }}>
        {children}
      </div>
    </div>
  );
}
