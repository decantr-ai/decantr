import { css } from '@decantr/css';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bot, Menu, X } from 'lucide-react';
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

export function TopNavFooterShell() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={css('_flex _col _minh0') + ' carbon-canvas'} style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        className={css('_sticky _top0 _z40') + ' carbon-glass'}
        style={{ borderBottom: '1px solid var(--d-border)' }}
      >
        <nav
          className={css('_flex _aic _jcsb _px6 _py3')}
          style={{ maxWidth: 1200, marginInline: 'auto' }}
        >
          <Link to="/" className={css('_flex _aic _gap2 _fontsemi _textlg _fgtext')}>
            <Bot size={22} strokeWidth={1.5} />
            AgentHub
          </Link>

          {/* Desktop nav */}
          <div
            className={css('_flex _aic _gap6')}
            style={{ display: 'var(--desktop-flex, flex)' }}
          >
            <div className={css('_flex _aic _gap4')}>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={
                    css('_textsm _fontmedium _trans') +
                    (location.pathname === link.to
                      ? ' ' + css('_fgtext')
                      : ' ' + css('_fgmuted'))
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className={css('_flex _aic _gap3')}>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className={css('_flex _aic _jcc _p2') + ' btn-ghost'}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{ display: 'none' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div
            className={css('_flex _col _gap4 _px6 _py4')}
            style={{ borderTop: '1px solid var(--d-border)', display: 'none' }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  css('_textsm _fontmedium _trans') +
                  (location.pathname === link.to
                    ? ' ' + css('_fgtext')
                    : ' ' + css('_fgmuted'))
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className={css('_flex _col _gap2 _mt2')}>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className={css('_flex1')}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--d-border)' }}>
        <div
          className={css('_flex _aic _jcsb _px6 _py6')}
          style={{ maxWidth: 1200, marginInline: 'auto' }}
        >
          <div className={css('_flex _aic _gap2 _textsm _fgmuted')}>
            <Bot size={16} strokeWidth={1.5} />
            <span>AgentHub</span>
          </div>
          <div className={css('_flex _aic _gap4')}>
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={css('_textsm _fgmuted _trans')}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
