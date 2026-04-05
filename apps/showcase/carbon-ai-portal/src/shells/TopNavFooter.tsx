import { Outlet, Link, NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: isActive ? 'var(--d-text)' : 'var(--d-text-muted)',
  textDecoration: 'none',
  fontSize: '0.875rem',
  transition: 'color 0.12s ease',
});

export function TopNavFooter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header
        className="carbon-glass"
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)' }}>
          <Sparkles size={18} style={{ color: 'var(--d-accent)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>Carbon</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <NavLink to="/about" style={navLinkStyle}>About</NavLink>
          <NavLink to="/contact" style={navLinkStyle}>Contact</NavLink>
          <Link
            to="/login"
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.875rem' }}
          >
            Start chat
          </Link>
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

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
            <span style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Carbon</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/privacy" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Privacy</Link>
            <Link to="/terms" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Terms</Link>
            <Link to="/cookies" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Cookies</Link>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Built with Decantr</p>
        </div>
      </footer>
    </div>
  );
}
