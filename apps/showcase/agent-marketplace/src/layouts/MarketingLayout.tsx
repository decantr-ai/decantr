import { Outlet, NavLink } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap } from 'lucide-react';

export function MarketingLayout() {
  return (
    <div className={css('_flex _col')} style={{ minHeight: '100dvh' }}>
      {/* Top nav */}
      <header
        className={css('_flex _aic _jcsb _px6 _py4 _sticky _top0 _z30')}
        style={{
          background: 'rgba(24, 24, 27, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--d-border)',
        }}
      >
        <NavLink to="/" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none' }}>
          <Zap size={22} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textlg')}>AgentSwarm</span>
        </NavLink>
        <nav className={css('_flex _aic _gap4')}>
          <NavLink
            to="/login"
            className={css('_textsm') + ' d-interactive'}
            data-variant="ghost"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/register"
            className={css('_textsm') + ' d-interactive neon-glow-hover'}
            data-variant="primary"
          >
            Get Started
          </NavLink>
        </nav>
      </header>

      {/* Main content with entrance-fade */}
      <main className={css('_flex1') + ' entrance-fade'}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className={css('_px6 _py8')}
        style={{ borderTop: '1px solid var(--d-border)', background: 'var(--d-surface)' }}
      >
        <div className={css('_flex _jcsb _aic _container')}>
          <div className={css('_flex _aic _gap2')}>
            <Zap size={16} style={{ color: 'var(--d-accent)' }} />
            <span className={css('_textsm _fgmuted')}>AgentSwarm</span>
          </div>
          <span className={css('_textsm _fgmuted') + ' mono-data'}>
            &copy; 2026 AgentSwarm. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
