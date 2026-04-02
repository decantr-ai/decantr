import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Bot, LayoutDashboard, Settings, Store,
  Eye, Activity, BarChart3, LogOut, Command,
} from 'lucide-react';

const agentNav = [
  { to: '/agents', icon: LayoutDashboard, label: 'Overview' },
  { to: '/marketplace', icon: Store, label: 'Marketplace' },
  { to: '/agents/config', icon: Settings, label: 'Configuration' },
];

const transparencyNav = [
  { to: '/transparency', icon: Eye, label: 'Models' },
  { to: '/transparency/inference', icon: Activity, label: 'Inference Log' },
  { to: '/transparency/confidence', icon: BarChart3, label: 'Confidence' },
];

export function SidebarMainShell({ section }: { section: 'agents' | 'transparency' }) {
  const location = useLocation();
  const nav = section === 'agents' ? agentNav : transparencyNav;

  return (
    <div className="shell-sidebar-main carbon-canvas">
      {/* Header */}
      <header className={'shell-header carbon-glass ' + css('_flex _aic _jcsb _px4')}>
        <div className={css('_flex _aic _gap3')}>
          <Bot size={20} style={{ color: 'var(--d-primary)' }} />
          <span className={'font-mono ' + css('_fontsemi _textsm')}>
            AGENT<span style={{ color: 'var(--d-primary)' }}>::</span>CTRL
          </span>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <button className="btn btn-ghost btn-sm" aria-label="Command palette">
            <Command size={14} />
            <span className={'font-mono ' + css('_textxs _fgmuted')}>Ctrl+K</span>
          </button>
          <NavLink to="/" className="btn btn-ghost btn-sm">
            <LogOut size={14} />
          </NavLink>
        </div>
      </header>

      {/* Sidebar nav */}
      <nav className={'shell-nav ' + css('_flex _col _gap1 _p3') + ' carbon-canvas'}>
        <span className={'font-mono ' + css('_textxs _fgmuted _uppercase _px3 _pb2 _pt2')}>
          {section === 'agents' ? 'Orchestrator' : 'Transparency'}
        </span>
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={'nav-item' + (isActive ? ' active' : '')}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className={css('_my3') + ' separator'} />

        {/* Cross-section links */}
        <span className={'font-mono ' + css('_textxs _fgmuted _uppercase _px3 _pb2')}>
          {section === 'agents' ? 'Transparency' : 'Orchestrator'}
        </span>
        {(section === 'agents' ? transparencyNav : agentNav).slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={'nav-item' + (location.pathname === item.to ? ' active' : '')}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Main content area */}
      <main className={'shell-body ' + css('_p6 _overauto')}>
        <Outlet />
      </main>
    </div>
  );
}
