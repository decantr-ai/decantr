import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap } from 'lucide-react';

export function TopNavFooterLayout() {
  return (
    <div className={css('_flex _col') + ' carbon-canvas'} style={{ minHeight: '100dvh' }}>
      {/* Top nav */}
      <header
        className={css('_flex _aic _jcsb _px6 _py3 _sticky _top0 _z50') + ' carbon-glass'}
        style={{ borderBottom: '1px solid var(--d-border)' }}
      >
        <div className={css('_flex _aic _gap2')}>
          <Zap size={20} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textsm') + ' mono-data'} style={{ color: 'var(--d-accent)' }}>
            NEXUS
          </span>
        </div>
        <nav className={css('_flex _aic _gap4')}>
          <a href="#features" className={css('_textsm') + ' d-interactive'} data-variant="ghost" style={{ color: 'var(--d-text-muted)' }}>
            Features
          </a>
          <a href="#pricing" className={css('_textsm') + ' d-interactive'} data-variant="ghost" style={{ color: 'var(--d-text-muted)' }}>
            Pricing
          </a>
          <Link to="/login" className={css('_textsm') + ' d-interactive'} data-variant="ghost" style={{ color: 'var(--d-text-muted)' }}>
            Sign In
          </Link>
          <Link to="/register" className={css('_textsm') + ' d-interactive'} data-variant="primary">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main */}
      <main className={css('_flex1') + ' entrance-fade'}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className={css('_flex _aic _jcsb _px6 _py4')}
        style={{ borderTop: '1px solid var(--d-border)' }}
      >
        <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
          &copy; 2026 Nexus. All rights reserved.
        </span>
        <div className={css('_flex _gap4')}>
          <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Privacy</a>
          <a href="#" className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}
