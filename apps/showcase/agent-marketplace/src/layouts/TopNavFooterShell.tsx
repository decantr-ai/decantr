import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot, ExternalLink } from 'lucide-react';

export function TopNavFooterShell() {
  return (
    <div className="shell-top-nav-footer carbon-canvas">
      {/* Top nav */}
      <header className={'shell-header carbon-glass ' + css('_flex _aic _jcsb _px6 _py3')}>
        <Link to="/" className={css('_flex _aic _gap2')}>
          <Bot size={20} style={{ color: 'var(--d-primary)' }} />
          <span className={'font-mono neon-text-glow ' + css('_fontsemi _textsm')}>
            AGENT<span style={{ color: 'var(--d-primary)' }}>::</span>CTRL
          </span>
        </Link>
        <nav className={css('_flex _aic _gap4')}>
          <a href="#features" className={'font-mono ' + css('_textsm _fgmuted')}>Features</a>
          <a href="#pricing" className={'font-mono ' + css('_textsm _fgmuted')}>Pricing</a>
          <Link to="/login" className="btn btn-ghost btn-sm font-mono">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm font-mono">Get Started</Link>
        </nav>
      </header>

      {/* Body */}
      <main className="shell-body">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={css('_flex _aic _jcsb _px6 _py4') + ' carbon-glass'} style={{ borderTop: '1px solid var(--d-border)' }}>
        <span className={'font-mono ' + css('_textxs _fgmuted')}>
          &copy; 2026 Agent::Ctrl. All rights reserved.
        </span>
        <div className={css('_flex _aic _gap4')}>
          <a href="#" className={css('_fgmuted')} aria-label="GitHub"><ExternalLink size={16} /></a>
          <a href="#" className={'font-mono ' + css('_textxs _fgmuted')}>Docs</a>
          <a href="#" className={'font-mono ' + css('_textxs _fgmuted')}>Status</a>
        </div>
      </footer>
    </div>
  );
}
