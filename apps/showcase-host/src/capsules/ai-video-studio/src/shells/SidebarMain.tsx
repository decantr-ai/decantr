import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FolderOpen, Users, FileText, Monitor, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, Clapperboard, Command,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'Production',
    items: [
      { to: '/projects', icon: FolderOpen, label: 'Projects' },
      { to: '/characters', icon: Users, label: 'Characters' },
      { to: '/prompts', icon: FileText, label: 'Prompts' },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { to: '/renders', icon: Monitor, label: 'Renders' },
    ],
  },
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const keys: string[] = [];
    let timer: ReturnType<typeof setTimeout>;
    function handleKeydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys.push(e.key);
      clearTimeout(timer);
      timer = setTimeout(() => { keys.length = 0; }, 500);
      const combo = keys.join(' ');
      if (combo === 'g p') { navigate('/projects'); keys.length = 0; }
      if (combo === 'g c') { navigate('/characters'); keys.length = 0; }
      if (combo === 'g m') { navigate('/prompts'); keys.length = 0; }
      if (combo === 'g r') { navigate('/renders'); keys.length = 0; }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--d-bg)' }}>
      <aside
        style={{
          width: collapsed ? 56 : 240,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 120ms ease',
          overflow: 'hidden',
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
        }}
      >
        {/* Brand */}
        <div style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '0 0.75rem',
          borderBottom: '1px solid var(--d-border)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <NavLink to="/" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--d-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <Clapperboard size={16} style={{ color: 'var(--d-primary)' }} />
              <span style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.03em' }}>Video Studio</span>
            </NavLink>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', border: 'none' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {navGroups.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <div className="d-label" style={{ padding: '0.25rem 0.75rem 0.25rem', marginBottom: 2 }}>
                  {group.label}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="sidebar-nav-item d-interactive"
                    data-variant="ghost"
                    data-active={isActive(item.to) ? 'true' : undefined}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      border: 'none',
                      color: 'var(--d-text-muted)',
                    }}
                  >
                    <item.icon size={14} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', marginTop: 'auto' }}>
          <NavLink
            to="/settings/profile"
            className="sidebar-nav-item d-interactive"
            data-variant="ghost"
            data-active={location.pathname.startsWith('/settings') ? 'true' : undefined}
            style={{ padding: '0.375rem 0.75rem', borderRadius: 3, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', textDecoration: 'none', justifyContent: collapsed ? 'center' : 'flex-start', border: 'none', color: 'var(--d-text-muted)' }}
          >
            <Settings size={14} />
            {!collapsed && 'Settings'}
          </NavLink>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.5rem', marginTop: 4, borderTop: '1px solid var(--d-border)' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 3,
                background: 'var(--d-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, color: '#0a0a0a',
                fontFamily: "'JetBrains Mono', monospace",
              }}>{user.avatar}</div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{user.role}</div>
                  </div>
                  <button className="d-interactive" data-variant="ghost" onClick={logout} style={{ padding: '0.25rem', border: 'none' }} aria-label="Sign out">
                    <LogOut size={12} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', borderBottom: '1px solid var(--d-border)', flexShrink: 0, background: 'var(--d-bg)',
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
            {breadcrumb.map((seg, i) => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--d-primary)' : 'var(--d-text-muted)', textTransform: 'capitalize' }}>{seg.label}</span>
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '4px 10px', fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--d-text-muted)' }}>
              <Search size={12} />
              <span style={{ marginLeft: 6 }}>Search...</span>
              <span style={{ marginLeft: 8, fontSize: '0.6rem', opacity: 0.6 }}><Command size={9} style={{ display: 'inline', verticalAlign: 'middle' }} />K</span>
            </button>
          </div>
        </header>
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
