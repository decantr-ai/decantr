import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Activity, Pill, FolderHeart, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, Heart, Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'My Health',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', match: (p: string) => p === '/dashboard' },
      { to: '/vitals', icon: Activity, label: 'Vitals', match: (p: string) => p === '/vitals' },
      { to: '/medications', icon: Pill, label: 'Medications', match: (p: string) => p === '/medications' },
    ],
  },
  {
    label: 'Care',
    items: [
      { to: '/appointments', icon: Calendar, label: 'Appointments', match: (p: string) => p.startsWith('/appointments') },
      { to: '/records', icon: FolderHeart, label: 'Health Records', match: (p: string) => p.startsWith('/records') || p === '/intake' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings/profile', icon: Settings, label: 'Settings', match: (p: string) => p.startsWith('/settings') },
    ],
  },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hotkeys: g d, g a, g r
  useEffect(() => {
    const keys: string[] = [];
    let timer: ReturnType<typeof setTimeout>;

    function handleKeydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys.push(e.key);
      clearTimeout(timer);
      timer = setTimeout(() => { keys.length = 0; }, 500);
      const combo = keys.join(' ');
      if (combo === 'g d') { navigate('/dashboard'); keys.length = 0; }
      if (combo === 'g a') { navigate('/appointments'); keys.length = 0; }
      if (combo === 'g r') { navigate('/records'); keys.length = 0; }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  // Breadcrumb
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className="hw-sidebar"
        style={{
          width: collapsed ? 72 : 256,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '0 1.125rem',
            borderBottom: '1px solid var(--d-border)',
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <NavLink
              to="/dashboard"
              style={{
                fontWeight: 700,
                fontSize: '1.0625rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                textDecoration: 'none',
                color: 'var(--d-text)',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--d-radius)',
                background: 'linear-gradient(135deg, var(--d-primary), var(--d-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Heart size={18} color="#fff" fill="#fff" />
              </div>
              Evergreen
            </NavLink>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.375rem', border: 'none' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {navGroups.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <div className="d-label" style={{ padding: '0.5rem 0.75rem 0.375rem' }}>
                  {group.label}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="d-interactive"
                    data-variant="ghost"
                    data-active={item.match(location.pathname) ? 'true' : undefined}
                    style={{
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--d-radius)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.9375rem',
                      textDecoration: 'none',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      position: 'relative',
                      border: 'none',
                    }}
                  >
                    <item.icon size={18} style={{ flexShrink: 0 }} aria-hidden />
                    {!collapsed && item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: user */}
        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.75rem', marginTop: 'auto' }}>
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem',
            }}>
              <div className="hw-avatar" style={{ width: 36, height: 36, fontSize: '0.8125rem' }} aria-hidden>
                {user.avatar}
              </div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Member since {user.memberSince}</div>
                  </div>
                  <button
                    className="d-interactive"
                    data-variant="ghost"
                    onClick={handleLogout}
                    style={{ padding: '0.375rem', border: 'none' }}
                    aria-label="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          borderBottom: '1px solid var(--d-border)',
          flexShrink: 0,
          background: 'var(--d-surface)',
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }} aria-label="Breadcrumb">
            {breadcrumb.map((seg, i) => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)', fontWeight: i === breadcrumb.length - 1 ? 600 : 400 }}>
                  {seg.label}
                </span>
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', border: 'none' }}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', border: 'none' }}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Body — sole scroll container */}
        <main className="hw-fade-in" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }} key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
