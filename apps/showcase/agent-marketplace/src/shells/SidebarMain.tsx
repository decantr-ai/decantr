import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Bot,
  Store,
  Settings,
  Eye,
  Activity,
  BarChart3,
  Search,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Agents',
    items: [
      { icon: Bot, label: 'Overview', path: '/agents' },
      { icon: Store, label: 'Marketplace', path: '/marketplace' },
      { icon: Settings, label: 'Configuration', path: '/agents/config' },
    ],
  },
  {
    label: 'Transparency',
    items: [
      { icon: Eye, label: 'Models', path: '/transparency' },
      { icon: Activity, label: 'Inference Log', path: '/transparency/inference' },
      { icon: BarChart3, label: 'Confidence', path: '/transparency/confidence' },
    ],
  },
];

function getBreadcrumbs(pathname: string): { label: string; path?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Agents' }];

  const crumbs: { label: string; path?: string }[] = [];

  if (segments[0] === 'agents') {
    crumbs.push({ label: 'Agents', path: '/agents' });
    if (segments[1] === 'config') {
      crumbs.push({ label: 'Configuration' });
    } else if (segments[1]) {
      crumbs.push({ label: `Agent ${segments[1]}` });
    }
  } else if (segments[0] === 'marketplace') {
    crumbs.push({ label: 'Agents', path: '/agents' });
    crumbs.push({ label: 'Marketplace' });
  } else if (segments[0] === 'transparency') {
    crumbs.push({ label: 'Transparency', path: '/transparency' });
    if (segments[1] === 'inference') crumbs.push({ label: 'Inference Log' });
    else if (segments[1] === 'confidence') crumbs.push({ label: 'Confidence' });
  }

  return crumbs;
}

export function SidebarMainShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hotkeys: g a → /agents, g m → /marketplace, g t → /transparency
  useEffect(() => {
    let pending: string | null = null;
    let timer: ReturnType<typeof setTimeout>;

    function handleKeydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (pending === 'g') {
        clearTimeout(timer);
        pending = null;
        if (key === 'a') { navigate('/agents'); e.preventDefault(); }
        else if (key === 'm') { navigate('/marketplace'); e.preventDefault(); }
        else if (key === 't') { navigate('/transparency'); e.preventDefault(); }
      } else if (key === 'g') {
        pending = 'g';
        timer = setTimeout(() => { pending = null; }, 500);
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  const breadcrumbs = getBreadcrumbs(location.pathname);
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div
      className={css('_flex')}
      style={{ height: 'calc(100vh - 48px)', background: 'var(--d-bg)' }}
    >
      {/* Sidebar */}
      <aside
        className={css('_flex _col _shrink0')}
        style={{
          width: sidebarWidth,
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div
          className={css('_flex _aic _shrink0')}
          style={{
            height: 52,
            padding: '0 1rem',
            borderBottom: '1px solid var(--d-border)',
            justifyContent: 'space-between',
          }}
        >
          {!collapsed && (
            <Link
              to="/agents"
              className={css('_flex _aic _gap2')}
              style={{ textDecoration: 'none', color: 'var(--d-text)' }}
            >
              <Bot size={18} style={{ color: 'var(--d-accent)' }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>AgentOps</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: 6, border: 'none', marginLeft: collapsed ? 'auto' : undefined, marginRight: collapsed ? 'auto' : undefined }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={css('_flex _col _flex1 _overyauto')}
          style={{ padding: '0.5rem' }}
          aria-label="Main navigation"
        >
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: '0.5rem' }}>
              {!collapsed && (
                <div
                  className="d-label"
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderLeft: '2px solid var(--d-accent)',
                    paddingLeft: '0.5rem',
                    marginBottom: 2,
                  }}
                >
                  {group.label}
                </div>
              )}
              {group.items.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="d-interactive"
                    data-variant="ghost"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '0.375rem 0.75rem',
                      width: '100%',
                      borderRadius: 'var(--d-radius-sm)',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      color: active ? 'var(--d-accent)' : 'var(--d-text)',
                      background: active ? 'color-mix(in srgb, var(--d-accent) 10%, transparent)' : 'transparent',
                      justifyContent: collapsed ? 'center' : undefined,
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={16} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={css('_flex _aic _shrink0')}
          style={{
            padding: '0.5rem',
            borderTop: '1px solid var(--d-border)',
            gap: 8,
            justifyContent: collapsed ? 'center' : undefined,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--d-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={14} style={{ color: 'var(--d-text-muted)' }} />
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--d-text)' }}>Operator</div>
                <div style={{ fontSize: 11, color: 'var(--d-text-muted)' }}>admin@agentops.io</div>
              </div>
              <Link
                to="/login"
                className="d-interactive"
                data-variant="ghost"
                style={{ padding: 4, border: 'none' }}
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Main wrapper */}
      <div className={css('_flex _col _flex1')} style={{ overflow: 'hidden' }}>
        {/* Header */}
        <header
          className={css('_flex _aic _jcsb _shrink0')}
          style={{
            height: 52,
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--d-border)',
            background: 'var(--d-bg)',
          }}
        >
          {/* Breadcrumbs */}
          <nav className={css('_flex _aic _gap1')} style={{ fontSize: 13 }} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className={css('_flex _aic _gap1')}>
                {i > 0 && <ChevronRight size={12} style={{ color: 'var(--d-text-muted)' }} />}
                {crumb.path ? (
                  <Link to={crumb.path} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--d-text)', fontWeight: 500 }}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Command trigger */}
          <button
            className={css('_flex _aic _gap2') + ' d-interactive'}
            data-variant="ghost"
            style={{ fontSize: 12, color: 'var(--d-text-muted)', padding: '4px 10px' }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          >
            <Search size={14} />
            <span>Search</span>
            <kbd
              style={{
                fontSize: 10,
                padding: '1px 5px',
                borderRadius: 4,
                border: '1px solid var(--d-border)',
                color: 'var(--d-text-muted)',
                fontFamily: 'var(--d-font-mono)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Body — sole scroll container */}
        <main
          className={css('_flex1 _overyauto') + ' entrance-fade'}
          style={{ padding: '1.5rem' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
