import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Bot,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Eye,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navItems = [
  { label: 'Agents', to: '/agents', icon: Bot, section: 'orchestrator' },
  { label: 'Marketplace', to: '/marketplace', icon: ShoppingBag, section: 'orchestrator' },
  { label: 'Config', to: '/agents/config', icon: Settings, section: 'orchestrator' },
  { label: 'Models', to: '/transparency', icon: Eye, section: 'transparency' },
  { label: 'Inference', to: '/transparency/inference', icon: FileText, section: 'transparency' },
  { label: 'Confidence', to: '/transparency/confidence', icon: BarChart3, section: 'transparency' },
];

export function SidebarLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const orchestratorLinks = navItems.filter((n) => n.section === 'orchestrator');
  const transparencyLinks = navItems.filter((n) => n.section === 'transparency');

  // Breadcrumbs for nested routes
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const showBreadcrumbs = pathSegments.length > 1;

  return (
    <div className={css('_flex _h100')} style={{ minHeight: '100dvh' }}>
      {/* Sidebar */}
      <aside
        className={css('_flex _col _bgsurf')}
        style={{
          width: collapsed ? '4rem' : '15rem',
          borderRight: '1px solid var(--d-border)',
          transition: 'width var(--d-duration-hover) var(--d-easing)',
          flexShrink: 0,
        }}
      >
        {/* Sidebar header with brand + collapse */}
        <div
          className={css('_flex _aic _jcsb _px4 _py3')}
          style={{ borderBottom: '1px solid var(--d-border)' }}
        >
          {!collapsed && (
            <div className={css('_flex _aic _gap2')}>
              <Zap size={20} style={{ color: 'var(--d-accent)' }} />
              <span className={css('_fontsemi _textlg')}>AgentSwarm</span>
            </div>
          )}
          {collapsed && <Zap size={20} style={{ color: 'var(--d-accent)', margin: '0 auto' }} />}
          <button
            className={css('_pointer') + ' d-interactive'}
            data-variant="ghost"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ padding: '0.25rem' }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav sections */}
        <nav className={css('_flex _col _gap1 _p2 _flex1 _overyauto')}>
          {/* Orchestrator section label */}
          <div
            className={css('_px2 _pt3 _pb1') + ' d-label'}
            style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
          >
            {collapsed ? <LayoutDashboard size={14} /> : 'Agents'}
          </div>
          {orchestratorLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                css('_flex _aic _gap3 _px3 _py2 _rounded _pointer _trans') +
                ' d-interactive neon-glow-hover' +
                (isActive ? ' neon-border-glow' : '')
              }
              data-variant="ghost"
              title={item.label}
            >
              <item.icon size={18} />
              {!collapsed && <span className={css('_textsm')}>{item.label}</span>}
            </NavLink>
          ))}

          {/* Transparency section label */}
          <div
            className={css('_px2 _pt4 _pb1') + ' d-label'}
            style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
          >
            {collapsed ? <Eye size={14} /> : 'Transparency'}
          </div>
          {transparencyLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                css('_flex _aic _gap3 _px3 _py2 _rounded _pointer _trans') +
                ' d-interactive neon-glow-hover' +
                (isActive ? ' neon-border-glow' : '')
              }
              data-variant="ghost"
              title={item.label}
            >
              <item.icon size={18} />
              {!collapsed && <span className={css('_textsm')}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className={css('_flex _col _flex1 _minw0')}>
        {/* Header bar */}
        <header
          className={css('_flex _aic _jcsb _px6 _py3 _bgsurf')}
          style={{ borderBottom: '1px solid var(--d-border)' }}
        >
          <div className={css('_flex _col')}>
            {showBreadcrumbs && (
              <nav className={css('_flex _aic _gap2 _textsm _fgmuted _mb1')}>
                {pathSegments.map((seg, i) => (
                  <span key={i} className={css('_flex _aic _gap2')}>
                    {i > 0 && <span>/</span>}
                    <span style={{ textTransform: 'capitalize' }}>{seg.replace(/[:-]/g, ' ')}</span>
                  </span>
                ))}
              </nav>
            )}
          </div>
          <NavLink
            to="/"
            className={css('_textsm _fgmuted _pointer _trans') + ' d-interactive'}
            data-variant="ghost"
          >
            Home
          </NavLink>
        </header>

        {/* Scrollable main area with entrance-fade */}
        <main
          className={css('_flex1 _overyauto _p6') + ' entrance-fade'}
          style={{ background: 'var(--d-bg)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
