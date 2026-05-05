import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Gamepad2, Users, Trophy, Newspaper, Settings, ChevronLeft,
  ChevronRight, Search, LogOut, Swords,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'Games',
    items: [
      { to: '/games', icon: Gamepad2, label: 'Game Catalog' },
      { to: '/join', icon: Swords, label: 'Join Guild' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/community', icon: Users, label: 'Guild Hub' },
      { to: '/community/news', icon: Newspaper, label: 'News Feed' },
      { to: '/community/hall-of-fame', icon: Trophy, label: 'Hall of Fame' },
    ],
  },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hotkeys
  useEffect(() => {
    const keys: string[] = [];
    let timer: ReturnType<typeof setTimeout>;

    function handleKeydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys.push(e.key);
      clearTimeout(timer);
      timer = setTimeout(() => { keys.length = 0; }, 500);
      const combo = keys.join(' ');
      if (combo === 'g g') { navigate('/games'); keys.length = 0; }
      if (combo === 'g c') { navigate('/community'); keys.length = 0; }
      if (combo === 'g h') { navigate('/community/hall-of-fame'); keys.length = 0; }
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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className="gg-sidebar"
        style={{
          width: collapsed ? 64 : 240,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '0 1rem',
            borderBottom: '1px solid var(--d-border)',
          }}
        >
          {!collapsed && (
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--d-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gamepad2 size={18} style={{ color: 'var(--d-primary)' }} />
              Guild HQ
            </span>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', border: 'none' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navGroups.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <div className="d-label" style={{ padding: '0.375rem 0.75rem', marginBottom: '2px' }}>
                  {group.label}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/community'}
                    className="d-interactive"
                    data-variant="ghost"
                    data-active={location.pathname === item.to ? 'true' : undefined}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--d-radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    <item.icon size={16} style={{ flexShrink: 0 }} />
                    {!collapsed && item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', marginTop: 'auto' }}>
          <NavLink
            to="/settings"
            className="d-interactive"
            data-variant="ghost"
            data-active={location.pathname === '/settings' ? 'true' : undefined}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--d-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              width: '100%',
              textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Settings size={16} />
            {!collapsed && 'Settings'}
          </NavLink>
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              marginTop: 4,
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--d-radius-full)',
                background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {user.avatar}
              </div>
              {!collapsed && (
                <>
                  <span style={{ fontSize: '0.8rem', flex: 1 }}>{user.name}</span>
                  <button
                    className="d-interactive"
                    data-variant="ghost"
                    onClick={logout}
                    style={{ padding: '0.25rem', border: 'none' }}
                    aria-label="Sign out"
                  >
                    <LogOut size={14} />
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
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          flexShrink: 0,
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
            {breadcrumb.map((seg, i) => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)' }}>
                  {seg.label}
                </span>
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Search size={14} />
            </button>
          </div>
        </header>

        {/* Body — sole scroll container */}
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
