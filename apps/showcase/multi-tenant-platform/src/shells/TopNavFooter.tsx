import { Outlet, NavLink } from 'react-router-dom';
import { Layers } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="lp-nav" role="navigation">
        <NavLink
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'var(--d-text)',
            textDecoration: 'none',
          }}
        >
          <Layers size={20} style={{ color: 'var(--d-primary)' }} />
          Tenantly
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem' }}>
          <NavLink to="/docs" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
            Docs
          </NavLink>
          <a href="#pricing" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
          <NavLink to="/login" className="d-interactive" data-variant="ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
            Sign in
          </NavLink>
          <NavLink to="/register" className="lp-button-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', textDecoration: 'none' }}>
            Get started
          </NavLink>
        </div>
      </nav>

      <main style={{ flex: 1, paddingTop: 52 }}>
        <Outlet />
      </main>

      <footer style={{
        borderTop: '1px solid var(--d-border)',
        padding: '3rem 2rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.8rem',
        color: 'var(--d-text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text)', fontWeight: 600 }}>
          <Layers size={16} style={{ color: 'var(--d-primary)' }} />
          Tenantly
        </div>
        <div>Multi-tenant infrastructure for modern SaaS.</div>
        <div>© 2026 Tenantly, Inc. All rights reserved.</div>
      </footer>
    </div>
  );
}
