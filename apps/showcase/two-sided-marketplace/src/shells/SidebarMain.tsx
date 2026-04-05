import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Heart, MessageCircle, LayoutDashboard, List, BarChart3, Star, ArrowLeft, LogOut, PenSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'Travel',
    items: [
      { to: '/bookings', icon: Calendar, label: 'Trips' },
      { to: '/favorites', icon: Heart, label: 'Favorites' },
      { to: '/buyer/messages', icon: MessageCircle, label: 'Trip messages' },
    ],
  },
  {
    label: 'Host',
    items: [
      { to: '/seller', icon: LayoutDashboard, label: 'Overview' },
      { to: '/seller/listings', icon: List, label: 'Listings' },
      { to: '/seller/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/seller/reviews', icon: Star, label: 'Reviews' },
    ],
  },
  {
    label: 'Inbox',
    items: [
      { to: '/messages', icon: MessageCircle, label: 'All messages' },
      { to: '/reviews/write', icon: PenSquare, label: 'Write a review' },
    ],
  },
];

export function SidebarMain() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to: string) => {
    if (to === '/seller') return location.pathname === '/seller';
    if (to === '/messages') return location.pathname === '/messages' || location.pathname.startsWith('/messages/');
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--d-bg)' }}>
      <aside className="nm-sidenav" style={{ width: 244, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 1.25rem', borderBottom: '1px solid var(--d-border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700 }}>
            <Home size={20} style={{ color: 'var(--d-primary)' }} />
            Nestable
          </Link>
        </div>

        <div style={{ padding: '0.75rem 1rem 0.25rem' }}>
          <Link to="/browse" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem', width: '100%', justifyContent: 'flex-start', border: 'none' }}>
            <ArrowLeft size={14} /> Back to browsing
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
                    data-active={isActive(item.to) ? 'true' : undefined}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--d-radius-sm)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      border: 'none',
                      justifyContent: 'flex-start',
                      background: isActive(item.to) ? 'color-mix(in srgb, var(--d-primary) 10%, transparent)' : undefined,
                      color: isActive(item.to) ? 'var(--d-primary)' : undefined,
                      fontWeight: isActive(item.to) ? 600 : undefined,
                    }}
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
              <div className="nm-avatar" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>{user.avatar}</div>
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
