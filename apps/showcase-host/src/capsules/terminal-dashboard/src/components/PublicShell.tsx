import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Docs', to: '/docs' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 48px)',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 48,
          zIndex: 10,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          background: 'var(--d-bg)',
          borderBottom: '1px solid var(--d-border)',
        }}
      >
        <Link
          to="/"
          style={{
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--d-primary)',
            letterSpacing: '0.05em',
          }}
        >
          <span className="term-glow">TERMINAL</span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
          }}
          className="nav-desktop"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                fontSize: '0.8125rem',
                color:
                  location.pathname === l.to
                    ? 'var(--d-primary)'
                    : 'var(--d-text-muted)',
                transition: 'color 0.15s',
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="d-interactive"
            data-variant="primary"
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.8125rem',
              borderRadius: 0,
            }}
          >
            Login
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid var(--d-border)',
            color: 'var(--d-text)',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            borderRadius: 0,
          }}
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '1rem 1.5rem',
            background: 'var(--d-surface)',
            borderBottom: '1px solid var(--d-border)',
          }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '0.875rem',
                padding: '0.5rem 0',
                color:
                  location.pathname === l.to
                    ? 'var(--d-primary)'
                    : 'var(--d-text)',
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="d-interactive"
            data-variant="primary"
            onClick={() => setMenuOpen(false)}
            style={{ borderRadius: 0, textAlign: 'center', marginTop: '0.5rem' }}
          >
            Login
          </Link>
        </div>
      )}

      {/* Body */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          padding: '2rem 1.5rem',
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--d-text-muted)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--d-primary)' }}>
            TERMINAL DASHBOARD
          </span>
          <span>&copy; 2026 Terminal Inc. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/privacy" style={{ color: 'var(--d-text-muted)' }}>
            Privacy
          </Link>
          <Link to="/terms" style={{ color: 'var(--d-text-muted)' }}>
            Terms
          </Link>
          <Link to="/docs" style={{ color: 'var(--d-text-muted)' }}>
            Docs
          </Link>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
          .nav-mobile-menu { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
