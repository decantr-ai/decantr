import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, FileText, GitBranch, Bell, Network, AlertOctagon, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, Activity, Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navGroups = [
  {
    label: 'Signals',
    items: [
      { to: '/metrics', icon: BarChart3, label: 'Metrics' },
      { to: '/logs', icon: FileText, label: 'Logs' },
      { to: '/traces', icon: GitBranch, label: 'Traces' },
      { to: '/traces/topology', icon: Network, label: 'Topology' },
    ],
  },
  {
    label: 'Response',
    items: [
      { to: '/alerts', icon: Bell, label: 'Alerts' },
      { to: '/alerts/rules', icon: Shield, label: 'Rules' },
      { to: '/incidents', icon: AlertOctagon, label: 'Incidents' },
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
      if (combo === 'g m') { navigate('/metrics'); keys.length = 0; }
      if (combo === 'g l') { navigate('/logs'); keys.length = 0; }
      if (combo === 'g t') { navigate('/traces'); keys.length = 0; }
      if (combo === 'g a') { navigate('/alerts'); keys.length = 0; }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  const isActive = (to: string) => {
    if (to === '/metrics') return location.pathname === '/metrics' || location.pathname.startsWith('/metrics/');
    if (to === '/logs') return location.pathname === '/logs' || location.pathname.startsWith('/logs/');
    if (to === '/traces') return location.pathname === '/traces';
    if (to === '/alerts') return location.pathname === '/alerts';
    if (to === '/incidents') return location.pathname === '/incidents' || location.pathname.startsWith('/incidents/');
    return location.pathname === to;
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside
        className="fin-sidebar"
        style={{
          width: collapsed ? 56 : 220,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 50ms linear',
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
        }}>
          {!collapsed && (
            <NavLink to="/" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--d-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <Activity size={16} style={{ color: 'var(--d-primary)' }} />
              sentinel.obs
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

        <nav style={{ flex: 1, padding: '0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {navGroups.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <div className="fin-label" style={{ padding: '0.25rem 0.75rem 0.25rem', marginBottom: 2 }}>
                  {group.label}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="d-interactive"
                    data-variant="ghost"
                    data-active={isActive(item.to) ? 'true' : undefined}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      border: 'none',
                    }}
                  >
                    <item.icon size={14} style={{ flexShrink: 0 }} />
                    {!collapsed && item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--d-border)', padding: '0.5rem', marginTop: 'auto' }}>
          <NavLink
            to="/settings/profile"
            className="d-interactive"
            data-variant="ghost"
            data-active={location.pathname.startsWith('/settings') ? 'true' : undefined}
            style={{ padding: '0.375rem 0.75rem', borderRadius: 2, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', textDecoration: 'none', justifyContent: collapsed ? 'center' : 'flex-start', border: 'none' }}
          >
            <Settings size={14} />
            {!collapsed && 'Settings'}
          </NavLink>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', marginTop: 4 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 2,
                background: 'var(--d-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700, flexShrink: 0, color: '#fff',
              }}>{user.avatar}</div>
              {!collapsed && (
                <>
                  <span style={{ fontSize: '0.75rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
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
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace' }}>
            {breadcrumb.map((seg, i) => (
              <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)' }}>{seg.label}</span>
              </span>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
              <span className="fin-status-dot" data-health="healthy" />
              LIVE
            </div>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              <Search size={12} /> Search
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
