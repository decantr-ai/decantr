import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Hexagon, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../App';
import { useTheme } from '../hooks/useTheme';

export function TopNavMain() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <div className={css('_flex _col')} style={{ minHeight: '100vh' }}>
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
          <Hexagon size={20} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textlg') + ' lum-brand'}>decantr</span>
        </Link>

        {/* Desktop nav */}
        <nav className={css('_flex _aic _gap6')} style={{ display: 'var(--nav-display, flex)' }}>
          <a href="#/browse" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Browse</a>
          <a href="#/explore" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Explore</a>
          <a href="#/pricing" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Pricing</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ padding: '0.375rem' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', padding: '0.375rem' }}
            aria-label="Search"
          >
            <Search size={16} />
          </button>
          {isAuthenticated ? (
            <button className="d-interactive" data-variant="primary" onClick={() => navigate('/dashboard')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Dashboard</button>
          ) : (
            <>
              <button className="d-interactive" data-variant="ghost" onClick={() => navigate('/login')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Log in</button>
              <button className="d-interactive" data-variant="primary" onClick={() => navigate('/register')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Sign up</button>
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
            background: 'var(--d-surface)',
            borderLeft: '1px solid var(--d-border)',
          }}
        >
          <a href="#/browse" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Browse</a>
          <a href="#/explore" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Explore</a>
          <a href="#/pricing" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Pricing</a>
          <hr style={{ border: 'none', borderTop: '1px solid var(--d-border)', margin: '0.5rem 0' }} />
          {isAuthenticated ? (
            <button className="d-interactive" data-variant="primary" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }} style={{ width: '100%' }}>Dashboard</button>
          ) : (
            <>
              <button className="d-interactive" data-variant="ghost" onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{ width: '100%' }}>Log in</button>
              <button className="d-interactive" data-variant="primary" onClick={() => { navigate('/register'); setMenuOpen(false); }} style={{ width: '100%' }}>Sign up</button>
            </>
          )}
        </div>
      )}

      {/* Body — flex:1, no padding (sections own their spacing) */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
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
              <Hexagon size={16} style={{ color: 'var(--d-accent)' }} />
              <span className={css('_fontsemi') + ' lum-brand'}>decantr</span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', maxWidth: 280 }}>
              Design Intelligence API for AI-native applications.
            </p>
          </div>
          <div className={css('_flex _gap12 _wrap')}>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Registry</span>
              <a href="#/browse" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Browse</a>
              <a href="#/explore" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Explore</a>
              <a href="#/pricing" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Resources</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Documentation</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>API Reference</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Changelog</span>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Company</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>About</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Blog</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Careers</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--d-border)', margin: '1.5rem 0' }}></div>
        <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)' }}>
          &copy; 2026 Decantr. All rights reserved.
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
