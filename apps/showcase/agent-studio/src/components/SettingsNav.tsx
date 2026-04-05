import { NavLink } from 'react-router-dom';

const items = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/danger', label: 'Danger Zone' },
];

export function SettingsNav() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0.75rem' }}>
      <div className="d-label" style={{ padding: '0.25rem 0.5rem 0.5rem' }}>Settings</div>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className="sidebar-nav-item d-interactive"
          data-variant="ghost"
          style={({ isActive }) => ({
            padding: '0.4rem 0.75rem',
            borderRadius: 3,
            fontSize: '0.8rem',
            textDecoration: 'none',
            border: 'none',
            display: 'block',
            color: isActive ? 'var(--d-text)' : 'var(--d-text-muted)',
            background: isActive ? 'color-mix(in srgb, var(--d-accent) 12%, transparent)' : undefined,
            boxShadow: isActive ? 'inset 2px 0 0 var(--d-accent)' : undefined,
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
