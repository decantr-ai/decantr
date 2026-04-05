import { Outlet, NavLink } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'rgba(24, 24, 27, 0.85)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <NavLink
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--d-text)',
            textDecoration: 'none',
            fontWeight: 600,
            fontFamily: 'var(--d-font-mono)',
            fontSize: '0.9rem',
          }}
        >
          <Terminal size={18} className="neon-accent" />
          <span>agent.studio</span>
        </NavLink>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
          <a href="#features" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Features</a>
          <a href="#workflow" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Workflow</a>
          <a href="#pricing" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
          <a href="https://github.com" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Docs</a>
          <NavLink to="/login" className="d-interactive" data-variant="ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Sign in
          </NavLink>
          <NavLink to="/register" className="d-interactive" data-variant="primary" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a' }}>
            Start building
          </NavLink>
        </nav>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          padding: '2rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--d-text-muted)',
          fontFamily: 'var(--d-font-mono)',
        }}
      >
        <div>© 2026 agent.studio — Build precision AI agents</div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <a href="#docs" style={{ color: 'inherit', textDecoration: 'none' }}>Docs</a>
          <a href="#changelog" style={{ color: 'inherit', textDecoration: 'none' }}>Changelog</a>
          <a href="#status" style={{ color: 'inherit', textDecoration: 'none' }}>Status</a>
          <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
        </div>
      </footer>
    </div>
  );
}
