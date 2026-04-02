import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Bot, BarChart3, Settings, Store, Eye, Activity, TrendingUp,
  PanelLeftClose, PanelLeft, Zap
} from 'lucide-react';

const navItems = [
  { label: 'Agents', icon: Bot, path: '/agents' },
  { label: 'Marketplace', icon: Store, path: '/marketplace' },
  { label: 'Config', icon: Settings, path: '/agents/config' },
  { label: 'Models', icon: Eye, path: '/transparency' },
  { label: 'Inference', icon: Activity, path: '/transparency/inference' },
  { label: 'Confidence', icon: TrendingUp, path: '/transparency/confidence' },
];

export function SidebarMainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Hotkeys: g+a → /agents, g+m → /marketplace, g+t → /transparency
  useEffect(() => {
    let pending = '';
    let timer: ReturnType<typeof setTimeout>;
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (pending === 'g') {
        clearTimeout(timer);
        pending = '';
        if (e.key === 'a') window.location.hash = '#/agents';
        else if (e.key === 'm') window.location.hash = '#/marketplace';
        else if (e.key === 't') window.location.hash = '#/transparency';
      } else if (e.key === 'g') {
        pending = 'g';
        timer = setTimeout(() => { pending = ''; }, 500);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={css('_flex _hscreen') + ' carbon-canvas'}>
      {/* Sidebar */}
      <aside
        className={css('_flex _col _shrink0') + ' carbon-glass'}
        style={{
          width: collapsed ? '60px' : '240px',
          transition: 'width 0.2s ease',
          borderRight: '1px solid var(--d-border)',
        }}
      >
        {/* Sidebar header */}
        <div className={css('_flex _aic _jcsb _px4 _py3')} style={{ borderBottom: '1px solid var(--d-border)' }}>
          {!collapsed && (
            <div className={css('_flex _aic _gap2')}>
              <Zap size={18} style={{ color: 'var(--d-accent)' }} />
              <span className={css('_fontsemi _textsm') + ' mono-data'} style={{ color: 'var(--d-accent)' }}>
                NEXUS
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={'d-interactive'}
            data-variant="ghost"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ padding: '0.25rem' }}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className={css('_flex _col _gap1 _p2 _flex1')}>
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path ||
              (path === '/agents' && location.pathname.startsWith('/agents/') && path === '/agents');
            return (
              <NavLink
                key={path}
                to={path}
                className={css('_flex _aic _gap3 _px3 _py2 _rounded') + ' d-interactive'}
                data-variant="ghost"
                style={{
                  background: isActive ? 'var(--d-surface)' : undefined,
                  borderColor: isActive ? 'var(--d-accent)' : undefined,
                  color: isActive ? 'var(--d-accent)' : 'var(--d-text-muted)',
                  justifyContent: collapsed ? 'center' : undefined,
                  borderLeft: isActive ? '2px solid var(--d-accent)' : '2px solid transparent',
                }}
              >
                <Icon size={18} />
                {!collapsed && <span className={css('_textsm')}>{label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className={css('_flex1 _flex _col _overauto') + ' entrance-fade'}>
        <Outlet />
      </main>
    </div>
  );
}
