import { Outlet, NavLink } from 'react-router-dom';
import { Orbit } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div className="glass-backdrop" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-header" style={{
        position: 'sticky', top: 0, zIndex: 40,
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem',
      }}>
        <NavLink to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700, fontSize: '1rem',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 'var(--d-radius-sm)',
            background: 'linear-gradient(135deg, var(--d-accent), var(--d-primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px var(--d-accent-glow)',
          }}>
            <Orbit size={16} color="#fff" />
          </div>
          <span className="crm-gradient-text">Lumen CRM</span>
        </NavLink>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
          <a href="#features" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</a>
          <a href="#testimonials" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Customers</a>
          <NavLink to="/login" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Sign in</NavLink>
          <NavLink to="/register" className="crm-button-accent" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
            Start free trial
          </NavLink>
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.8rem', color: 'var(--d-text-muted)',
      }}>
        <div>© 2026 Lumen CRM. AI-native sales intelligence.</div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
