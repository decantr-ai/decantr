import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Layers, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function TopNavFooter() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={css('_flex _col')} style={{ minHeight: '100vh' }} data-theme="carbon">
      {/* Header */}
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
          <Layers size={20} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textlg')}>SpatialOps</span>
        </Link>

        <nav className={css('_flex _aic _gap6')} style={{ display: 'var(--nav-display, flex)' }}>
          <a href="#/about" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>About</a>
          <a href="#/" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Workspace</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          {isAuthenticated ? (
            <button className="d-interactive" data-variant="primary" onClick={() => navigate('/')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>
              Workspace
            </button>
          ) : (
            <>
              <button className="d-interactive" data-variant="ghost" onClick={() => navigate('/login')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>Log in</button>
              <button className="d-interactive" data-variant="primary" onClick={() => navigate('/register')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>Create Space</button>
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

      {/* Mobile menu */}
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
          <a href="#/about" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>About</a>
          <a href="#/" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Workspace</a>
          <hr className="carbon-divider" style={{ margin: '0.5rem 0' }} />
          {isAuthenticated ? (
            <button className="d-interactive" data-variant="primary" onClick={() => { navigate('/'); setMenuOpen(false); }} style={{ width: '100%' }}>Workspace</button>
          ) : (
            <>
              <button className="d-interactive" data-variant="ghost" onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{ width: '100%' }}>Log in</button>
              <button className="d-interactive" data-variant="primary" onClick={() => { navigate('/register'); setMenuOpen(false); }} style={{ width: '100%' }}>Create Space</button>
            </>
          )}
        </div>
      )}

      {/* Body */}
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
              <Layers size={16} style={{ color: 'var(--d-accent)' }} />
              <span className={css('_fontsemi')}>SpatialOps</span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', maxWidth: 280 }}>
              Collaborative spatial workspace for teams who think visually.
            </p>
          </div>
          <div className={css('_flex _gap12 _wrap')}>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Product</span>
              <a href="#/" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Workspace</a>
              <a href="#/about" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>About</a>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Resources</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Documentation</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>API Reference</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Status</span>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Company</span>
              <a href="#/about" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>About</a>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Blog</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Careers</span>
            </div>
          </div>
        </div>
        <div className="carbon-divider" style={{ margin: '1.5rem 0' }}></div>
        <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)' }}>
          &copy; 2026 SpatialOps. All rights reserved.
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
