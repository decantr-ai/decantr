import { NavLink } from 'react-router-dom';

const items = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/danger', label: 'Danger Zone' },
];

export function SettingsNav() {
  return (
    <nav style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--d-border)', marginBottom: '1rem' }}>
      {items.map(i => (
        <NavLink
          key={i.to}
          to={i.to}
          style={({ isActive }) => ({
            padding: '8px 14px',
            fontSize: '0.8rem',
            textDecoration: 'none',
            color: isActive ? 'var(--d-primary)' : 'var(--d-text-muted)',
            borderBottom: isActive ? '2px solid var(--d-primary)' : '2px solid transparent',
            marginBottom: -1,
          })}
        >
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}
