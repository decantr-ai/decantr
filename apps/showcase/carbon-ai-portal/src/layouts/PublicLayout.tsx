import { Outlet, Link, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const { pathname } = useLocation();

  return (
    <div className={css('_flex _col _minh0') + ' carbon-canvas'} style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className={css('_flex _aic _jcsb _px6 _py4') + ' carbon-glass'} style={{ position: 'sticky', top: 0, zIndex: 40 }}>
        <Link to="/" className={css('_textxl _fontsemi _fgtext')} style={{ textDecoration: 'none' }}>
          Carbon AI
        </Link>
        <nav className={css('_flex _aic _gap6')}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={css(
                '_textsm _fontmedium',
                pathname === link.to ? '_fgprimary' : '_fgmuted',
              )}
              style={{ textDecoration: 'none', transition: 'color 0.15s ease' }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            className={css('_textsm _fontmedium _fgmuted')}
            style={{ textDecoration: 'none' }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={css('_textsm _fontmedium _bgprimary _fgtext _px4 _py2 _rounded')}
            style={{ textDecoration: 'none' }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Body */}
      <main className={css('_flex1')}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={css('_py12 _px6')} style={{ borderTop: '1px solid var(--d-border)' }}>
        <div className={css('_grid _sm:gc4 _gap8')} style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={css('_flex _col _gap3')}>
            <span className={css('_fontmedium _fgtext')}>Carbon AI</span>
            <p className={css('_textsm _fgmuted')}>
              Intelligent AI assistant for developers. Built for speed, designed for clarity.
            </p>
          </div>
          <div className={css('_flex _col _gap2')}>
            <span className={css('_textsm _fontmedium _fgtext')}>Product</span>
            <Link to="/chat" className={css('_textsm _fgmuted')} style={{ textDecoration: 'none' }}>Chat</Link>
            <Link to="/about" className={css('_textsm _fgmuted')} style={{ textDecoration: 'none' }}>About</Link>
            <Link to="/contact" className={css('_textsm _fgmuted')} style={{ textDecoration: 'none' }}>Contact</Link>
          </div>
          <div className={css('_flex _col _gap2')}>
            <span className={css('_textsm _fontmedium _fgtext')}>Account</span>
            <Link to="/login" className={css('_textsm _fgmuted')} style={{ textDecoration: 'none' }}>Sign In</Link>
            <Link to="/register" className={css('_textsm _fgmuted')} style={{ textDecoration: 'none' }}>Register</Link>
          </div>
          <div className={css('_flex _col _gap2')}>
            <span className={css('_textsm _fontmedium _fgtext')}>Legal</span>
            <Link to="/privacy" className={css('_textsm _fgmuted')} style={{ textDecoration: 'none' }}>Privacy</Link>
            <Link to="/terms" className={css('_textsm _fgmuted')} style={{ textDecoration: 'none' }}>Terms</Link>
            <Link to="/cookies" className={css('_textsm _fgmuted')} style={{ textDecoration: 'none' }}>Cookies</Link>
          </div>
        </div>
        <div className={css('_textc _pt8')}>
          <p className={css('_textxs _fgmuted')}>
            &copy; 2026 Carbon AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
