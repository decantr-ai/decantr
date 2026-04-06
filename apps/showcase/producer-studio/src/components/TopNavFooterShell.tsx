import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'Testimonials', to: '/#testimonials' },
];

export function TopNavFooterShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 48px)', background: 'var(--d-bg)' }}>
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
            fontWeight: 700,
            fontSize: '0.875rem',
            color: 'var(--d-primary)',
            letterSpacing: '0.05em',
            textDecoration: 'none',
          }}
        >
          <span className="studio-glow-cyan">&#9835;</span>{' '}
          PRODUCER STUDIO
        </Link>

        <nav className="ps-nav-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.to}
              href={l.to}
              style={{
                fontSize: '0.8125rem',
                color: location.pathname === l.to ? 'var(--d-primary)' : 'var(--d-text-muted)',
                textDecoration: 'none',
              }}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.8125rem',
              border: '1px solid var(--d-border)',
              borderRadius: 'var(--d-radius)',
              color: 'var(--d-text)',
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            Start Producing
          </Link>
        </nav>

        <button
          className="ps-nav-mobile-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid var(--d-border)',
            color: 'var(--d-text)',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>
      </header>

      {menuOpen && (
        <div
          className="ps-nav-mobile-menu"
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
            <a key={l.to} href={l.to} onClick={() => setMenuOpen(false)} style={{ fontSize: '0.875rem', color: 'var(--d-text)', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.875rem', color: 'var(--d-primary)' }}>
            Sign in
          </Link>
        </div>
      )}

      <main style={{ flex: 1 }}>{children}</main>

      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          padding: '2rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--d-text-muted)',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--d-primary)' }} className="studio-glow-cyan">
            &#9835; PRODUCER STUDIO
          </span>
          <span>&copy; 2026 Producer Studio. Make beats, not noise.</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/#features" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Features</a>
          <a href="/#pricing" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
          <Link to="/login" style={{ color: 'var(--d-text-muted)' }}>Sign in</Link>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .ps-nav-desktop { display: none !important; }
          .ps-nav-mobile-toggle { display: block !important; }
          .ps-nav-mobile-menu { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
