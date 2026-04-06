import { Outlet, NavLink } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="dr-nav" role="navigation">
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
            fontFamily: 'var(--d-font-display)',
          }}
        >
          <Shield size={20} style={{ color: 'var(--d-primary)' }} />
          Meridian
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem' }}>
          <NavLink to="/about" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>
            About
          </NavLink>
          <a href="#pricing" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
          <NavLink to="/login" className="d-interactive" data-variant="ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
            Investor Login
          </NavLink>
          <NavLink to="/register" className="dr-button-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', textDecoration: 'none' }}>
            Request Access
          </NavLink>
        </div>
      </nav>

      <main style={{ flex: 1, paddingTop: 56 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text)', fontWeight: 600, fontFamily: 'var(--d-font-display)' }}>
          <Shield size={16} style={{ color: 'var(--d-primary)' }} />
          Meridian Deal Room
        </div>
        <div>Secure deal management for institutional investors.</div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
          <span>SOC 2 Type II</span>
          <span>ISO 27001</span>
          <span>GDPR Compliant</span>
        </div>
        <div style={{ marginTop: '0.5rem' }}>2026 Meridian Capital Partners. All rights reserved.</div>
      </footer>
    </div>
  );
}
