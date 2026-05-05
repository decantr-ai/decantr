import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, User, Shield, Sliders, AlertTriangle, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'Activity',
    items: [
      { to: '/orders', icon: Package, label: 'Orders' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings/profile', icon: User, label: 'Profile' },
      { to: '/settings/security', icon: Shield, label: 'Security' },
      { to: '/settings/preferences', icon: Sliders, label: 'Preferences' },
      { to: '/settings/danger', icon: AlertTriangle, label: 'Danger zone' },
    ],
  },
];

export function SidebarMain() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--d-bg)' }}>
      <aside className="ec-sidenav" style={{ width: 240, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 1.25rem', borderBottom: '1px solid var(--d-border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700 }}>
            <ShoppingBag size={20} style={{ color: 'var(--d-primary)' }} />
            Vinea
          </Link>
        </div>

        <div style={{ padding: '0.75rem 1rem 0.25rem' }}>
          <Link to="/shop" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem', width: '100%', justifyContent: 'flex-start', border: 'none' }}>
            <ArrowLeft size={14} /> Back to shop
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="d-label" style={{ padding: '0.5rem 0.75rem 0.25rem' }}>{group.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="d-interactive"
                    data-variant="ghost"
                    data-active={location.pathname === item.to || (item.to === '/orders' && location.pathname.startsWith('/orders/')) ? 'true' : undefined}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--d-radius-sm)', fontSize: '0.875rem', textDecoration: 'none', border: 'none', justifyContent: 'flex-start' }}
                  >
                    <item.icon size={16} /> {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.75rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9999, background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                {user.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
              <button
                className="d-interactive"
                data-variant="ghost"
                onClick={() => { logout(); navigate('/login'); }}
                style={{ padding: '0.375rem', border: 'none' }}
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
