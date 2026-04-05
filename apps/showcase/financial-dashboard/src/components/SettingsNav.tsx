import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/danger', label: 'Danger Zone' },
];

export function SettingsNav() {
  const location = useLocation();
  return (
    <nav
      style={{
        display: 'flex',
        gap: '0.25rem',
        borderBottom: '1px solid var(--d-border)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
      }}
    >
      {tabs.map(tab => {
        const active = location.pathname === tab.to;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={{
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              textDecoration: 'none',
              color: active ? 'var(--d-accent)' : 'var(--d-text-muted)',
              borderBottom: `2px solid ${active ? 'var(--d-accent)' : 'transparent'}`,
              marginBottom: '-1px',
              fontWeight: active ? 500 : 400,
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease, border-color 150ms ease',
            }}
          >
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
