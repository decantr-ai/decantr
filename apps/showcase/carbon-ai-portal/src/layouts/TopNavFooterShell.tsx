import { css } from '@decantr/css';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const footerLinks = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/cookies', label: 'Cookies' },
];

export function TopNavFooterShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={css('_flex _col') + ' carbon-canvas'} style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        className={css('_sticky _top0 _z50') + ' carbon-glass'}
        style={{ borderBottom: '1px solid var(--d-border)' }}
      >
        <div className={css('_flex _aic _jcsb _py3') + ' container'}>
          <Link to="/" className={css('_flex _aic _gap2 _fgtext')}>
            <div className={css('_flex _aic _jcc _roundedfull _bgprimary')} style={{ width: '32px', height: '32px' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span className={css('_fontsemi _textlg')}>Carbon AI</span>
          </Link>

          {/* Desktop nav */}
          <nav className={css('_flex _aic _gap6 _none _md:flex')}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={'nav-link' + (location.pathname === link.to ? ' active' : '')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={css('_flex _aic _gap3')}>
            <div className={css('_none _md:flex _gap3')}>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/chat">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
            <button
              className={css('_flex _aic _jcc _p2 _rounded _md:none') + ' btn-ghost'}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={css('_flex _col _gap4 _p4 _md:none')} style={{ borderTop: '1px solid var(--d-border)' }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={'nav-link' + (location.pathname === link.to ? ' active' : '')}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className={css('_flex _col _gap2')}>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" size="sm" className={css('_wfull')}>Sign in</Button>
              </Link>
              <Link to="/chat" onClick={() => setMenuOpen(false)}>
                <Button variant="primary" size="sm" className={css('_wfull')}>Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <main className={css('_flex1')}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--d-border)' }}>
        <div className={css('_flex _aic _jcsb _py6 _wrap _gap4') + ' container'}>
          <div className={css('_flex _aic _gap2 _fgmuted _textsm')}>
            <Sparkles size={14} />
            <span>2026 Carbon AI. All rights reserved.</span>
          </div>
          <nav className={css('_flex _aic _gap4')}>
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className={css('_textsm _fgmuted _trans') + ' nav-link'}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
