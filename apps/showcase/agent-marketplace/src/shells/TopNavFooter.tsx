import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../App';

export function TopNavFooter() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={css('_flex _col')} style={{ minHeight: '100vh' }} data-theme="carbon-neon">
      {/* Header — sticky, 52px, border-bottom */}
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
          <Zap size={20} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textlg') + ' mono-data'}>AgentOps</span>
        </Link>

        {/* Desktop nav */}
        <nav className={css('_flex _aic _gap6')} style={{ display: 'var(--nav-display, flex)' }}>
          <a href="#/marketplace" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Marketplace</a>
          <a href="#/transparency" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Transparency</a>
          <a href="#/" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Pricing</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          {isAuthenticated ? (
            <button className="d-interactive" data-variant="primary" onClick={() => navigate('/agents')}>Dashboard</button>
          ) : (
            <>
              <button className="d-interactive" data-variant="ghost" onClick={() => navigate('/login')}>Log in</button>
              <button className="d-interactive" data-variant="primary" onClick={() => navigate('/register')}>Deploy Agent</button>
            </>
          )}
          <button
            className={css('_none') + ' d-interactive mobile-menu-btn'}
            data-variant="ghost"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="carbon-glass"
          style={{
            position: 'fixed',
            top: 52,
            right: 0,
            bottom: 0,
            width: 280,
            zIndex: 20,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <a href="#/marketplace" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Marketplace</a>
          <a href="#/transparency" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Transparency</a>
          <a href="#/" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Pricing</a>
          <hr className="carbon-divider" style={{ margin: '0.5rem 0' }} />
          {isAuthenticated ? (
            <button className="d-interactive" data-variant="primary" onClick={() => { navigate('/agents'); setMenuOpen(false); }} style={{ width: '100%' }}>Dashboard</button>
          ) : (
            <>
              <button className="d-interactive" data-variant="ghost" onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{ width: '100%' }}>Log in</button>
              <button className="d-interactive" data-variant="primary" onClick={() => { navigate('/register'); setMenuOpen(false); }} style={{ width: '100%' }}>Deploy Agent</button>
            </>
          )}
        </div>
      )}

      {/* Body — flex:1, no padding (sections own their spacing) */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          padding: '2rem 1.5rem',
          marginTop: 'auto',
        }}
      >
        <div className={css('_flex _jcsb _wrap _gap8')} style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={css('_flex _col _gap2')}>
            <div className={css('_flex _aic _gap2')}>
              <Zap size={16} style={{ color: 'var(--d-accent)' }} />
              <span className={css('_fontsemi') + ' mono-data'}>AgentOps</span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', maxWidth: 280 }}>
              Deploy, monitor, and orchestrate autonomous AI agents at scale.
            </p>
          </div>
          <div className={css('_flex _gap12 _wrap')}>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Platform</span>
              <a href="#/marketplace" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Marketplace</a>
              <a href="#/" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
              <a href="#/transparency" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Transparency</a>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Resources</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Documentation</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>API Reference</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Status</span>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Company</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>About</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Blog</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Careers</span>
            </div>
          </div>
        </div>
        <div className="carbon-divider" style={{ margin: '1.5rem 0' }}></div>
        <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)' }}>
          &copy; 2026 AgentOps. All rights reserved.
        </p>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          nav { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
