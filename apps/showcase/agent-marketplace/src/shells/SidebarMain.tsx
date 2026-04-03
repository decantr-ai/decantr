import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Zap, LayoutDashboard, Bot, Settings, Store,
  Eye, Activity, Target, LogOut, Search,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../App';

const NAV_ITEMS = [
  { group: 'Agents', items: [
    { to: '/agents', icon: LayoutDashboard, label: 'Overview' },
    { to: '/marketplace', icon: Store, label: 'Marketplace' },
    { to: '/agents/config', icon: Settings, label: 'Configuration' },
  ]},
  { group: 'Transparency', items: [
    { to: '/transparency', icon: Eye, label: 'Model Overview' },
    { to: '/transparency/inference', icon: Activity, label: 'Inference Log' },
    { to: '/transparency/confidence', icon: Target, label: 'Confidence' },
  ]},
];

export function SidebarMain() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hotkeys: g a, g m, g t
  useEffect(() => {
    let pending = '';
    let timer: ReturnType<typeof setTimeout>;
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (pending === 'g') {
        clearTimeout(timer);
        pending = '';
        if (key === 'a') navigate('/agents');
        else if (key === 'm') navigate('/marketplace');
        else if (key === 't') navigate('/transparency');
        return;
      }
      if (key === 'g') {
        pending = 'g';
        timer = setTimeout(() => { pending = ''; }, 500);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const sidebarWidth = collapsed ? 64 : 240;

  // Breadcrumb
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  return (
    <div className={css('_flex')} style={{ height: '100vh' }} data-theme="carbon-neon">
      {/* Sidebar */}
      <aside
        className={css('_flex _col _shrink0')}
        style={{
          width: sidebarWidth,
          background: 'var(--d-surface)',
          borderRight: '1px solid var(--d-border)',
          transition: 'width 200ms var(--d-easing)',
          overflow: 'hidden',
        }}
      >
        {/* Brand + collapse */}
        <div
          className={css('_flex _aic _jcsb _shrink0')}
          style={{ height: 52, padding: '0 1rem', borderBottom: '1px solid var(--d-border)' }}
        >
          {!collapsed && (
            <div className={css('_flex _aic _gap2')}>
              <Zap size={18} style={{ color: 'var(--d-accent)' }} />
              <span className={css('_fontsemi _textsm') + ' mono-data'}>AgentOps</span>
            </div>
          )}
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ padding: '0.25rem' }}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className={css('_flex _col _flex1')} style={{ padding: '0.5rem', overflowY: 'auto', gap: '0.5rem' }}>
          {NAV_ITEMS.map(group => (
            <div key={group.group} className={css('_flex _col')} style={{ gap: 2 }}>
              {!collapsed && (
                <span className="d-label" style={{ padding: '0.375rem 0.75rem', borderLeft: '2px solid var(--d-accent)', marginBottom: '0.25rem' }}>
                  {group.group}
                </span>
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/agents'}
                  className={({ isActive }) =>
                    'd-interactive' + (isActive ? '' : '')
                  }
                  data-variant="ghost"
                  style={({ isActive }) => ({
                    width: '100%',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: '0.375rem 0.75rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    background: isActive ? 'var(--d-surface-raised)' : undefined,
                    borderColor: isActive ? 'var(--d-border)' : 'transparent',
                  })}
                  title={item.label}
                >
                  <item.icon size={16} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--d-border)',
            padding: '0.5rem',
            marginTop: 'auto',
          }}
        >
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              width: '100%',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: '0.375rem 0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign out</span>}
          </button>
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
          }}
        >
          <nav className={css('_flex _aic _gap1')} aria-label="Breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.path} className={css('_flex _aic _gap1')}>
                {i > 0 && <span style={{ color: 'var(--d-text-muted)' }}>/</span>}
                <span
                  className={css('_textsm')}
                  style={{ color: i === breadcrumb.length - 1 ? 'var(--d-text)' : 'var(--d-text-muted)' }}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            style={{ gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}
          >
            <Search size={14} />
            <span>Search</span>
            <kbd className={css('_textxs') + ' mono-data'} style={{ opacity: 0.5 }}>⌘K</kbd>
          </button>
        </header>

        {/* Body — sole scroll container */}
        <main
          className="entrance-fade"
          style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
