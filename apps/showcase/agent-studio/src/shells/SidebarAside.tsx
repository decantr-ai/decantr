import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, type ReactNode } from 'react';
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

interface SidebarAsideProps {
  aside?: ReactNode;
  asideTitle?: string;
  asideWidth?: number;
}

export function SidebarAside({ aside, asideTitle = 'Inspector', asideWidth = 320 }: SidebarAsideProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [asideCollapsed, setAsideCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const showAside = aside !== undefined;

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

  const sidebarWidth = collapsed ? 52 : 220;
  const asideRenderWidth = asideCollapsed ? 36 : asideWidth;

  const isActive = (to: string) => {
    if (to === '/agents') return location.pathname === '/agents' || location.pathname.startsWith('/agents/');
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${sidebarWidth}px 1fr${showAside ? ` ${asideRenderWidth}px` : ''}`,
        gridTemplateRows: '48px 1fr',
        height: '100vh',
        background: 'var(--d-bg)',
        transition: 'grid-template-columns 120ms ease',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          gridRow: '1 / 3',
          display: 'flex',
          flexDirection: 'column',
          background: '#18181B',
          borderRight: '1px solid var(--d-border)',
          overflow: 'hidden',
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
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem' }}>
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

      {/* Header */}
      <header
        style={{
          gridColumn: showAside ? '2 / 4' : '2 / 3',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          flexShrink: 0,
        }}
      >
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

      {/* Main body */}
      <main
        className="entrance-fade"
        style={{
          gridColumn: '2 / 3',
          gridRow: '2 / 3',
          overflow: 'auto',
          padding: '1.25rem',
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>

      {/* Aside */}
      {showAside && (
        <aside
          style={{
            gridColumn: '3 / 4',
            gridRow: '2 / 3',
            borderLeft: '1px solid var(--d-border)',
            background: '#18181B',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 120ms ease',
          }}
        >
          <div style={{
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.625rem',
            borderBottom: '1px solid var(--d-border)',
            flexShrink: 0,
          }}>
            {!asideCollapsed && (
              <div className="d-label" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.65rem' }}>
                {asideTitle}
              </div>
            )}
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => setAsideCollapsed(!asideCollapsed)}
              style={{ padding: '0.25rem', border: 'none', marginLeft: 'auto' }}
              aria-label={asideCollapsed ? 'Expand aside' : 'Collapse aside'}
            >
              {asideCollapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>
          </div>
          {!asideCollapsed && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              {aside}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
