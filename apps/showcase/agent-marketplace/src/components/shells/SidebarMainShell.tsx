import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Bot, Store, Settings, Brain, ScrollText, Target,
  PanelLeftClose, PanelLeft, Search, LogOut, User,
} from 'lucide-react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { CommandPalette } from '../ui/CommandPalette';
import { useHotkeys } from '../../hooks/useHotkeys';

const SIDEBAR_KEY = 'agent-marketplace-sidebar-collapsed';

const NAV_GROUPS = [
  {
    label: 'AGENTS',
    items: [
      { path: '/agents', label: 'Overview', icon: Bot },
      { path: '/marketplace', label: 'Marketplace', icon: Store },
      { path: '/agents/config', label: 'Configuration', icon: Settings },
    ],
  },
  {
    label: 'TRANSPARENCY',
    items: [
      { path: '/transparency', label: 'Models', icon: Brain },
      { path: '/transparency/inference', label: 'Inference Log', icon: ScrollText },
      { path: '/transparency/confidence', label: 'Confidence', icon: Target },
    ],
  },
];

const HOTKEYS = [
  { key: 'g a', route: '/agents', label: 'Go to Agents' },
  { key: 'g m', route: '/marketplace', label: 'Go to Marketplace' },
  { key: 'g t', route: '/transparency', label: 'Go to Transparency' },
];

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Home' }];

  const crumbs: { label: string; href?: string }[] = [];
  if (segments[0] === 'agents') {
    crumbs.push({ label: 'Agents', href: '/agents' });
    if (segments[1] === 'config') crumbs.push({ label: 'Configuration' });
    else if (segments[1]) crumbs.push({ label: segments[1] });
  } else if (segments[0] === 'marketplace') {
    crumbs.push({ label: 'Marketplace' });
  } else if (segments[0] === 'transparency') {
    crumbs.push({ label: 'Transparency', href: '/transparency' });
    if (segments[1] === 'inference') crumbs.push({ label: 'Inference Log' });
    else if (segments[1] === 'confidence') crumbs.push({ label: 'Confidence' });
  }
  return crumbs;
}

function getPageTitle(pathname: string): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.path === pathname) return item.label;
    }
  }
  if (pathname.startsWith('/agents/') && pathname !== '/agents/config') return 'Agent Detail';
  return 'Dashboard';
}

export function SidebarMainShell() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === 'true');
  const location = useLocation();
  const navigate = useNavigate();

  useHotkeys(HOTKEYS);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  const breadcrumbs = getBreadcrumbs(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className={css('_flex _hscreen') + ' carbon-canvas'}>
      {/* Sidebar */}
      <aside
        className={'sidebar d-surface carbon-glass'}
        data-collapsed={collapsed ? '' : undefined}
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--d-border)',
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        {/* Sidebar header */}
        <div className={css('_flex _aic _jcsb _px3 _py3')} style={{ borderBottom: '1px solid var(--d-border)' }}>
          {!collapsed && (
            <span className={css('_textsm _fontbold') + ' mono-data neon-text-glow'} style={{ color: 'var(--d-accent)' }}>
              AgentMKT
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={css('_flex _aic _jcc')}
            style={{
              background: 'none', border: 'none', color: 'var(--d-text-muted)',
              cursor: 'pointer', padding: '0.25rem',
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav groups */}
        <nav className={css('_flex _col _gap1 _p2 _flex1 _overyauto')}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} className={css('_flex _col _gap1')}>
              {!collapsed && (
                <div
                  className={'d-label'}
                  style={{
                    borderLeft: '2px solid var(--d-accent)',
                    paddingLeft: '0.5rem',
                    marginTop: '0.75rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  {group.label}
                </div>
              )}
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path === '/agents' && location.pathname.startsWith('/agents/') && location.pathname !== '/agents/config' && item.path === '/agents');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={'sidebar-nav-item'}
                    data-active={isActive ? '' : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          className={css('_flex _aic _gap2 _p3')}
          style={{ borderTop: '1px solid var(--d-border)' }}
        >
          <div
            className={css('_flex _aic _jcc _roundedfull')}
            style={{
              width: 32, height: 32, background: 'var(--d-surface-raised)',
              border: '1px solid var(--d-border)', flexShrink: 0,
            }}
          >
            <User size={14} style={{ color: 'var(--d-text-muted)' }} />
          </div>
          {!collapsed && (
            <>
              <span className={css('_textsm _flex1 _truncate')}>Operator</span>
              <button
                onClick={() => {
                  localStorage.removeItem('agent-marketplace-auth');
                  navigate('/login');
                }}
                style={{
                  background: 'none', border: 'none', color: 'var(--d-text-muted)',
                  cursor: 'pointer', padding: '0.25rem',
                }}
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={css('_flex _col _flex1 _minh0')}>
        {/* Header bar */}
        <header
          className={css('_flex _aic _jcsb _px6 _py3')}
          style={{ borderBottom: '1px solid var(--d-border)', flexShrink: 0 }}
        >
          <div className={css('_flex _col _gap1')}>
            <Breadcrumbs items={breadcrumbs} />
            <h1 className={css('_textxl _fontsemi')}>{pageTitle}</h1>
          </div>
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className={css('_flex _aic _gap2 _px3 _py1') + ' d-interactive'}
            data-variant="ghost"
            style={{ fontSize: '0.8rem' }}
          >
            <Search size={14} />
            <span className="mono-data" style={{ color: 'var(--d-text-muted)' }}>
              Search...
            </span>
            <kbd className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Main scrollable area */}
        <main className={css('_flex1 _overauto _p6') + ' entrance-fade'}>
          <Outlet />
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
