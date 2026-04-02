import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Bot, Activity, Settings, Store, Eye, FileText, Target,
  PanelLeftClose, PanelLeft, Command,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/marketplace', label: 'Marketplace', icon: Store },
  { to: '/agents/config', label: 'Config', icon: Settings },
  { to: '/transparency', label: 'Models', icon: Eye },
  { to: '/transparency/inference', label: 'Inference', icon: FileText },
  { to: '/transparency/confidence', label: 'Confidence', icon: Target },
] as const;

export function SidebarMainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={css('_flex _h100') + ' carbon-canvas'} style={{ minHeight: '100dvh' }}>
      {/* Sidebar */}
      <nav
        className={css('_flex _col _gap1') + ' d-surface'}
        style={{
          width: collapsed ? 56 : 220,
          transition: `width var(--d-duration-hover) var(--d-easing)`,
          borderRight: '1px solid var(--d-border)',
          borderRadius: 0,
          padding: 'var(--d-gap-3)',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <div className={css('_flex _aic _gap2')} style={{ padding: 'var(--d-gap-2) var(--d-gap-1)', marginBottom: 'var(--d-gap-3)' }}>
          <Activity size={20} style={{ color: 'var(--d-accent)', flexShrink: 0 }} />
          {!collapsed && (
            <span className="mono-data" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--d-accent)' }}>
              SWARM.CTL
            </span>
          )}
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={css('_flex _aic _gap2') + ' d-interactive' + (active ? ' neon-border-glow' : ' neon-glow-hover')}
              data-variant="ghost"
              style={{
                padding: 'var(--d-gap-2) var(--d-gap-2)',
                borderRadius: 'var(--d-radius)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--d-accent)' : 'var(--d-text-muted)',
                background: active ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                border: active ? '1px solid var(--d-accent)' : '1px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </NavLink>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Collapse toggle */}
        <button
          className="d-interactive neon-glow-hover"
          data-variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          style={{ padding: 'var(--d-gap-2)', justifyContent: 'center', border: '1px solid transparent' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>

        {/* Hotkey hint */}
        {!collapsed && (
          <div className={css('_flex _aic _gap2')} style={{ padding: 'var(--d-gap-1)', color: 'var(--d-text-muted)', fontSize: '0.6875rem' }}>
            <Command size={12} />
            <span className="mono-data">g a / g m / g t</span>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className={css('_flex _col')} style={{ flex: 1, overflow: 'auto', padding: 'var(--d-gap-6)' }}>
        <Outlet />
      </main>
    </div>
  );
}
