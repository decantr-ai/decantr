import { useState } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

export function NavHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={css('_sticky _top0 _z50 _wfull') + ' carbon-glass'}
      style={{ borderBottom: '1px solid var(--d-border)' }}
    >
      <nav
        className={css('_flex _row _aic _jcsb _px6 _mx0')}
        style={{ height: 60, maxWidth: 1200, margin: '0 auto' }}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <a
          href="#"
          className={css('_fontsemi _textlg') + ' mono-data neon-text-glow'}
          style={{ color: 'var(--d-accent)', textDecoration: 'none' }}
        >
          AgentMKT
        </a>

        {/* Desktop nav links */}
        <div
          className={css('_flex _row _gap6 _aic _none _md:flex')}
          style={{ display: undefined }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={css('_textsm _fontmedium')}
              style={{
                color: 'var(--d-text-muted)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--d-text)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--d-text-muted)')
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className={css('_flex _row _gap3 _aic _none _md:flex')} style={{ display: undefined }}>
          <Link
            to="/login"
            className={css('_px4 _py2 _textsm') + ' d-interactive'}
            data-variant="ghost"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className={css('_px4 _py2 _textsm') + ' d-interactive'}
            data-variant="primary"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={css('_p2 _md:none') + ' d-interactive'}
          data-variant="ghost"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{ display: undefined }}
        >
          <Menu size={20} />
        </button>
      </nav>

      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div
          className="mobile-menu-backdrop"
          data-open=""
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in panel */}
      <div
        className={css('_flex _col _gap4 _p6') + ' mobile-menu-panel carbon-glass'}
        {...(menuOpen ? { 'data-open': '' } : {})}
      >
        <div className={css('_flex _row _jcfe')}>
          <button
            className={css('_p2') + ' d-interactive'}
            data-variant="ghost"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className={css('_flex _col _gap4')}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={css('_textsm _fontmedium _py2')}
              style={{
                color: 'var(--d-text-muted)',
                textDecoration: 'none',
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className={css('_flex _col _gap3 _mt4')}>
          <Link
            to="/login"
            className={css('_px4 _py2 _textsm _textc') + ' d-interactive'}
            data-variant="ghost"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className={css('_px4 _py2 _textsm _textc') + ' d-interactive'}
            data-variant="primary"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
