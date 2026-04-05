import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/danger', label: 'Danger Zone' },
];

export function SettingsNav() {
  return (
    <nav
      style={{
        display: 'flex',
        gap: '0.25rem',
        borderBottom: '1px solid var(--d-border)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
      }}
      aria-label="Settings sections"
    >
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          style={({ isActive }) => ({
            padding: '0.75rem 1rem',
            fontSize: '0.9375rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--d-primary)' : 'var(--d-text-muted)',
            textDecoration: 'none',
            borderBottom: isActive ? '2px solid var(--d-primary)' : '2px solid transparent',
            marginBottom: -1,
            whiteSpace: 'nowrap',
            transition: 'color 150ms ease, border-color 150ms ease',
          })}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
