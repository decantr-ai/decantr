import { Outlet, NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header className="fin-nav">
        <NavLink to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text)', textDecoration: 'none', fontWeight: 600 }}>
          <Activity size={18} style={{ color: 'var(--d-primary)' }} />
          <span>sentinel.obs</span>
        </NavLink>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem' }}>
          <a href="#features" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
          <a href="#testimonials" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Customers</a>
          <NavLink to="/login" className="d-interactive" data-variant="ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>Sign in</NavLink>
          <NavLink to="/register" className="d-interactive" data-variant="primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Start free</NavLink>
        </nav>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
        <div>© 2026 sentinel.obs — Observability without limits</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="#docs" style={{ color: 'inherit', textDecoration: 'none' }}>Docs</a>
          <a href="#status" style={{ color: 'inherit', textDecoration: 'none' }}>Status</a>
          <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
        </div>
      </footer>
    </div>
  );
}
