import { NavLink } from 'react-router-dom';
import { User, Shield, Sliders, AlertTriangle } from 'lucide-react';

const items = [
  { to: '/settings/profile', icon: User, label: 'Profile' },
  { to: '/settings/security', icon: Shield, label: 'Security' },
  { to: '/settings/preferences', icon: Sliders, label: 'Preferences' },
  { to: '/settings/danger', icon: AlertTriangle, label: 'Danger Zone' },
];

export function SettingsNav() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className="d-interactive"
          data-variant="ghost"
          style={({ isActive }) => ({
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            textDecoration: 'none',
            background: isActive ? 'color-mix(in srgb, var(--d-accent) 12%, transparent)' : undefined,
            color: isActive ? 'var(--d-accent)' : undefined,
            borderRadius: 'var(--d-radius-sm)',
          })}
        >
          <item.icon size={14} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
