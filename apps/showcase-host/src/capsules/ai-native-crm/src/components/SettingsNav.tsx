import { NavLink } from 'react-router-dom';
import { User, Shield, Sliders, AlertOctagon } from 'lucide-react';

const items = [
  { to: '/settings/profile', icon: User, label: 'Profile' },
  { to: '/settings/security', icon: Shield, label: 'Security' },
  { to: '/settings/preferences', icon: Sliders, label: 'Preferences' },
  { to: '/settings/danger', icon: AlertOctagon, label: 'Danger zone' },
];

export function SettingsNav() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => isActive ? 'settings-nav-active' : ''}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--d-radius-sm)',
            fontSize: '0.825rem',
            textDecoration: 'none',
            color: isActive ? 'var(--d-accent)' : 'var(--d-text-muted)',
            background: isActive ? 'rgba(167, 139, 250, 0.1)' : 'transparent',
          })}
        >
          <item.icon size={14} /> {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
