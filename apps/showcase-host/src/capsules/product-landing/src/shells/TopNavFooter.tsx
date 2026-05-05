import { Outlet, Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function TopNavFooter() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
        <Link
          to="/"
          className={css('_flex _aic _gap2')}
          style={{ textDecoration: 'none', color: 'var(--d-text)' }}
        >
          <Sparkles size={18} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi')}>
            Lumi<span style={{ color: 'var(--d-accent)' }}>.</span>
          </span>
        </Link>

        <nav className={css('_flex _aic _gap6') + ' nav-desktop-footer'}>
          <a href="#/" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Home</a>
          <a href="#/blog" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Blog</a>
          <a href="#/resources" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none', transition: 'color 150ms' }}>Resources</a>
        </nav>

        <div className={css('_flex _aic _gap2')}>
          <button
            className="d-interactive"
            data-variant="primary"
            onClick={() => navigate('/demo')}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
          >
            Try Demo
          </button>
          <button
            className={css('_none') + ' d-interactive mobile-menu-btn-footer'}
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
          className="lum-glass"
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
          <a href="#/" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Home</a>
          <a href="#/blog" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Blog</a>
          <a href="#/resources" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Resources</a>
          <div className="lum-divider" style={{ margin: '0.5rem 0' }} />
          <a href="#/privacy" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Privacy</a>
          <a href="#/terms" className="d-interactive" data-variant="ghost" onClick={() => setMenuOpen(false)} style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}>Terms</a>
        </div>
      )}

      {/* Body — no padding, sections own spacing */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer — multi-column */}
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
              <Sparkles size={16} style={{ color: 'var(--d-accent)' }} />
              <span className={css('_fontsemi')}>
                Lumi<span style={{ color: 'var(--d-accent)' }}>.</span>
              </span>
            </div>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', maxWidth: 280 }}>
              Build, launch, and scale beautiful applications with composable design intelligence.
            </p>
          </div>
          <div className={css('_flex _gap12 _wrap')}>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Product</span>
              <a href="#/" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Home</a>
              <a href="#/demo" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Demo</a>
              <a href="#/resources" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Resources</a>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Content</span>
              <a href="#/blog" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Blog</a>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Documentation</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Changelog</span>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className="d-label">Legal</span>
              <a href="#/privacy" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#/terms" className={css('_textsm')} style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="lum-divider" style={{ margin: '1.5rem 0' }} />
        <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)' }}>
          &copy; 2026 Lumi. All rights reserved.
        </p>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .mobile-menu-btn-footer { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-desktop-footer { display: none !important; }
          .mobile-menu-btn-footer { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
