import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Marketplace', path: '/marketplace' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', path: '/about' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
];

export function TopNavFooterShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function scrollToSection(href: string) {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div
      className={css('_flex _col')}
      style={{ minHeight: 'calc(100vh - 48px)', background: 'var(--d-bg)' }}
    >
      {/* Sticky header */}
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          position: 'sticky',
          top: 48,
          zIndex: 10,
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className={css('_flex _aic _gap2')}
          style={{ textDecoration: 'none', color: 'var(--d-text)' }}
        >
          <Bot size={20} style={{ color: 'var(--d-accent)' }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>AgentOps</span>
        </Link>

        {/* Desktop nav links */}
        <nav
          className={css('_flex _aic _gap6')}
          style={{ display: undefined }}
          aria-label="Main navigation"
        >
          <div className={css('_flex _aic _gap6')} style={{ display: 'var(--nav-links-display, flex)' }}>
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--d-text-muted)',
                  padding: '4px 0',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Right: CTA + hamburger */}
        <div className={css('_flex _aic _gap3')}>
          <Link
            to="/login"
            className="d-interactive"
            data-variant="ghost"
            style={{ fontSize: 13, textDecoration: 'none' }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="d-interactive"
            data-variant="primary"
            style={{ fontSize: 13, textDecoration: 'none' }}
          >
            Deploy Now
          </Link>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            style={{ display: 'none', border: 'none', padding: 6 }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={css('_flex _col _gap2')}
          style={{
            position: 'fixed',
            top: 100,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9,
            background: 'var(--d-bg)',
            padding: '1.5rem',
          }}
        >
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.href)}
              className="d-interactive"
              data-variant="ghost"
              style={{ width: '100%', justifyContent: 'flex-start', fontSize: 15 }}
            >
              {link.label}
            </button>
          ))}
          <hr className="carbon-divider" style={{ margin: '0.5rem 0' }} />
          <button
            onClick={() => { setMobileOpen(false); navigate('/login'); }}
            className="d-interactive"
            data-variant="ghost"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Log in
          </button>
          <button
            onClick={() => { setMobileOpen(false); navigate('/register'); }}
            className="d-interactive"
            data-variant="primary"
            style={{ width: '100%' }}
          >
            Deploy Now
          </button>
        </div>
      )}

      {/* Body — sections own their spacing */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          padding: '2rem 1.5rem',
          marginTop: 'auto',
        }}
      >
        <div
          className={css('_flex _wrap _gap8')}
          style={{ maxWidth: 1024, margin: '0 auto' }}
        >
          {/* Brand column */}
          <div style={{ minWidth: 180, flex: 1 }}>
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
              <Bot size={18} style={{ color: 'var(--d-accent)' }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--d-text)' }}>AgentOps</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              Deploy, monitor, and orchestrate autonomous AI agent swarms.
            </p>
          </div>

          {/* Link groups */}
          {FOOTER_GROUPS.map(group => (
            <div key={group.title} style={{ minWidth: 120 }}>
              <div
                className="d-label"
                style={{ marginBottom: '0.75rem' }}
              >
                {group.title}
              </div>
              <div className={css('_flex _col _gap2')}>
                {group.links.map(link => (
                  <span key={link.label}>
                    {link.path ? (
                      <Link
                        to={link.path}
                        style={{ fontSize: 13, color: 'var(--d-text-muted)', textDecoration: 'none' }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        onClick={link.href?.startsWith('#') ? (e) => { e.preventDefault(); scrollToSection(link.href!); } : undefined}
                        style={{ fontSize: 13, color: 'var(--d-text-muted)', textDecoration: 'none' }}
                      >
                        {link.label}
                      </a>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="carbon-divider"
          style={{ margin: '1.5rem auto', maxWidth: 1024 }}
        />
        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--d-text-muted)',
          }}
        >
          &copy; 2026 AgentOps. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
