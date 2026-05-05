import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header
        className="carbon-glass"
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--d-bg)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)' }}>
          <Sparkles size={20} style={{ color: 'var(--d-accent)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Copilot Shell</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#features" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Features</a>
          <a href="#how-it-works" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>How It Works</a>
          <Link
            to="/login"
            className="d-interactive"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Body */}
      <main style={{ flex: 1 }}>
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
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: 'var(--d-accent)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Copilot Shell</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Documentation</a>
            <a href="#" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>GitHub</a>
            <a href="#" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Privacy</a>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Built with Decantr</p>
        </div>
      </footer>
    </div>
  );
}
