import { Outlet, Link, useLocation } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  MessageSquare,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy' },
];

export function PublicLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={css('_flex _col') + ' carbon-canvas'} style={{ minHeight: '100vh' }}>
      {/* Header / Top Nav */}
      <header
        className={css('_flex _aic _jcsb _px6 _py3 _sticky _top0 _z40') + ' glass-panel'}
        style={{ borderBottom: '1px solid var(--d-border)' }}
      >
        <Link to="/" className={css('_flex _aic _gap2 _fontbold _textlg _fgtext')}>
          <Sparkles size={20} />
          Carbon AI
        </Link>

        {/* Desktop nav */}
        <nav className={css('_none _md:flex _aic _gap6')}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={
                css('_textsm _fontsemi _trans') +
                ' nav-link' +
                (location.pathname === link.to ? ' active' : '')
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={css('_flex _aic _gap3')}>
          <Link
            to="/login"
            className={
              css('_none _md:inlineflex _textsm _fontsemi _trans _aic _gap2') + ' nav-link'
            }
          >
            Sign in
          </Link>
          <Link
            to="/chat"
            className={css(
              '_inlineflex _aic _gap2 _px4 _py2 _textsm _fontsemi _rounded _trans _bordernone'
            ) + ' btn-primary hover-lift'}
          >
            <MessageSquare size={16} />
            Start Chat
          </Link>
          {/* Mobile menu toggle */}
          <button
            className={css('_flex _md:none _aic _jcc _p1 _bordernone _bgbg _fgtext _pointer')}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className={css('_flex _md:none _col _gap1 _px4 _py3') + ' glass-panel'}
          style={{ borderBottom: '1px solid var(--d-border)' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={css('_py2 _px3 _textsm _fontsemi _rounded _trans') + ' nav-link'}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className={css('_py2 _px3 _textsm _fontsemi _rounded _trans') + ' nav-link'}
          >
            Sign in
          </Link>
        </nav>
      )}

      {/* Main content */}
      <main id="main-content" className={css('_flex1')}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className={css('_px6 _py8')}
        style={{ borderTop: '1px solid var(--d-border)' }}
      >
        <div
          className={css('_flex _col _md:row _jcsb _gap6')}
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          <div className={css('_flex _col _gap2')}>
            <div className={css('_flex _aic _gap2 _fontbold _textlg _fgtext')}>
              <Sparkles size={18} />
              Carbon AI
            </div>
            <p className={css('_textsm _fgmuted')} style={{ maxWidth: '320px' }}>
              Intelligent conversation, powered by advanced language models.
              Built for teams that demand clarity and speed.
            </p>
          </div>
          <div className={css('_flex _gap8 _wrap')}>
            <div className={css('_flex _col _gap2')}>
              <span className={css('_textsm _fontsemi _fgtext')}>Product</span>
              <Link to="/" className={css('_textsm _fgmuted _trans') + ' nav-link'}>Home</Link>
              <Link to="/about" className={css('_textsm _fgmuted _trans') + ' nav-link'}>About</Link>
              <Link to="/contact" className={css('_textsm _fgmuted _trans') + ' nav-link'}>Contact</Link>
            </div>
            <div className={css('_flex _col _gap2')}>
              <span className={css('_textsm _fontsemi _fgtext')}>Legal</span>
              <Link to="/privacy" className={css('_textsm _fgmuted _trans') + ' nav-link'}>Privacy</Link>
              <Link to="/terms" className={css('_textsm _fgmuted _trans') + ' nav-link'}>Terms</Link>
              <Link to="/cookies" className={css('_textsm _fgmuted _trans') + ' nav-link'}>Cookies</Link>
            </div>
          </div>
        </div>
        <div
          className={css('_flex _jcc _mt8 _pt4 _textsm _fgmuted')}
          style={{ borderTop: '1px solid var(--d-border)' }}
        >
          2026 Carbon AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
