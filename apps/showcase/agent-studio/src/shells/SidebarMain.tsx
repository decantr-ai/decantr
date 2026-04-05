import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText, Wrench, ClipboardCheck, Activity, Bot, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, Terminal, Command,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'Build',
    items: [
      { to: '/agents', icon: Bot, label: 'Agents' },
      { to: '/prompts', icon: FileText, label: 'Prompts' },
      { to: '/tools', icon: Wrench, label: 'Tools' },
    ],
  },
  {
    label: 'Observe',
    items: [
      { to: '/evals', icon: ClipboardCheck, label: 'Evals' },
      { to: '/traces', icon: Activity, label: 'Traces' },
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
      if (combo === 'g a') { navigate('/agents'); keys.length = 0; }
      if (combo === 'g p') { navigate('/prompts'); keys.length = 0; }
      if (combo === 'g t') { navigate('/tools'); keys.length = 0; }
      if (combo === 'g e') { navigate('/evals'); keys.length = 0; }
      if (combo === 'g r') { navigate('/traces'); keys.length = 0; }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  const isActive = (to: string) => {
    if (to === '/agents') return location.pathname === '/agents' || location.pathname.startsWith('/agents/');
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--d-bg)' }}>
      <aside
        style={{
          width: collapsed ? 52 : 220,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 120ms ease',
          overflow: 'hidden',
          background: '#18181B',
          borderRight: '1px solid var(--d-border)',
        }}
      >
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '0 0.75rem',
          borderBottom: '1px solid var(--d-border)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <NavLink to="/" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--d-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontFamily: 'var(--d-font-mono)' }}>
              <Terminal size={16} className="neon-accent" />
              agent.studio
            </NavLink>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem', border: 'none' }}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

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
                      padding: '0.4rem 0.75rem',
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
                    {!collapsed && (
                      <kbd className="kbd" style={{ marginLeft: 'auto', opacity: 0.5 }}>
                        g{item.label[0]?.toLowerCase()}
                      </kbd>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', marginTop: 'auto' }}>
          <NavLink
            to="/settings/profile"
            className="sidebar-nav-item d-interactive"
            data-variant="ghost"
            data-active={location.pathname.startsWith('/settings') ? 'true' : undefined}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 3, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', textDecoration: 'none', justifyContent: collapsed ? 'center' : 'flex-start', border: 'none', color: 'var(--d-text-muted)' }}
          >
            <Settings size={14} />
            {!collapsed && 'Settings'}
          </NavLink>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.5rem', marginTop: 4, borderTop: '1px solid var(--d-border)' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 3,
                background: 'var(--d-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, color: '#0a0a0a', fontFamily: 'var(--d-font-mono)',
              }}>{user.avatar}</div>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>{user.role}</div>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.25rem', borderBottom: '1px solid var(--d-border)', flexShrink: 0, background: 'var(--d-bg)',
        }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontFamily: 'var(--d-font-mono)' }}>
            {breadcrumb.map((seg, i) => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--d-accent)' : 'var(--d-text-muted)' }}>{seg.label}</span>
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '4px 10px', fontSize: '0.72rem', fontFamily: 'var(--d-font-mono)', color: 'var(--d-text-muted)' }}>
              <Search size={12} />
              <span style={{ marginLeft: 6 }}>Search...</span>
              <kbd className="kbd" style={{ marginLeft: 8 }}><Command size={9} />K</kbd>
            </button>
          </div>
        </header>
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
