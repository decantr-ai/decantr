import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { css } from '@decantr/css';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/chat', label: 'AI Chat', icon: '◈' },
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export function Shell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={css('_flex _hscreen') + ' lum-canvas'}>
      <a href="#main-content" className="skip-nav">
        Skip to content
      </a>

      {/* Sidebar */}
      <nav
        className={css('_flex _col _shrink0') + ' lum-glass'}
        style={{
          width: collapsed ? 64 : 240,
          transition: 'width 0.2s ease',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 0,
        }}
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <div className={css('_flex _aic _p4')} style={{ height: 64 }}>
          {!collapsed && (
            <span className={css('_fontsemi _textlg') + ' lum-brand'}>
              Carbon<span className="accent">AI</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={css('_flex _aic _jcc _ml4 _p2 _rounded _pointer')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: 'var(--d-text-muted)',
              marginLeft: collapsed ? 'auto' : undefined,
              marginRight: collapsed ? 'auto' : undefined,
              width: 32,
              height: 32,
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Nav links */}
        <div className={css('_flex _col _gap1 _p2 _flex1')}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                css('_flex _aic _gap3 _px3 _py2 _rounded _textbase') +
                (isActive
                  ? ' ' + css('_bgprimary _fgtext _fontmedium')
                  : ' ' + css('_fgmuted _h:bgsurface'))
              }
              style={{ textDecoration: 'none', transition: 'background 0.15s ease' }}
            >
              <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Bottom section */}
        <div className={css('_p3')} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <NavLink
            to="/login"
            className={css('_flex _aic _gap3 _px3 _py2 _rounded _fgmuted _textsm')}
            style={{ textDecoration: 'none' }}
          >
            <span style={{ width: 24, textAlign: 'center' }}>⏻</span>
            {!collapsed && <span>Sign Out</span>}
          </NavLink>
        </div>
      </nav>

      {/* Main content */}
      <main
        id="main-content"
        className={css('_flex1 _flex _col _overyauto')}
        style={{ position: 'relative' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
