import { Outlet, Link, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import { User, Lock, Sliders, AlertTriangle } from 'lucide-react';

const items = [
  { label: 'Profile', icon: User, href: '/settings/profile' },
  { label: 'Security', icon: Lock, href: '/settings/security' },
  { label: 'Preferences', icon: Sliders, href: '/settings/preferences' },
  { label: 'Danger Zone', icon: AlertTriangle, href: '/settings/danger' },
];

export function SidebarAside() {
  const location = useLocation();
  return (
    <div className={css('_flex')} style={{ maxWidth: '72rem', margin: '0 auto', gap: '2rem', width: '100%' }}>
      <aside style={{ width: 220, flexShrink: 0 }}>
        <h2 className="serif-display" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Settings</h2>
        <nav className={css('_flex _col _gap1')}>
          {items.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} className="d-interactive" data-variant="ghost"
                style={{
                  padding: '0.5rem 0.75rem', textDecoration: 'none',
                  borderRadius: 'var(--d-radius-sm)', fontFamily: 'system-ui, sans-serif',
                  background: active ? 'var(--d-surface-raised)' : undefined,
                  color: active ? 'var(--d-primary)' : undefined,
                  fontWeight: active ? 600 : undefined,
                }}>
                <item.icon size={16} />
                <span className={css('_textsm')}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
