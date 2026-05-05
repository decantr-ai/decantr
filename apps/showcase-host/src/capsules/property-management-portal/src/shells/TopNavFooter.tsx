import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
];

export function TopNavFooter() {
  const location = useLocation();
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="pm-topnav" style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 68,
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', color: 'var(--d-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--d-radius-sm)',
              background: 'linear-gradient(135deg, var(--d-primary), var(--d-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={18} color="#fff" />
            </div>
            Cornerstone
          </Link>
          <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                data-active={(item.to === '/pricing' ? location.pathname === '/pricing' : undefined)}
                style={({ isActive }) => ({
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  color: isActive ? 'var(--d-primary)' : 'var(--d-text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  position: 'relative',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/login" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.85rem', padding: '0.4rem 0.875rem' }}>
              Sign in
            </Link>
            <Link to="/register" className="pm-button-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.875rem' }}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="pm-fade-in" style={{ flex: 1 }} key={location.pathname}>
        <Outlet />
      </main>

      <footer className="pm-footer" style={{ padding: '2.5rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--d-primary)', fontWeight: 700 }}>
              <Building2 size={18} />
              Cornerstone
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              Professional property management software for owners, managers, and residents.
            </p>
          </div>
          <div>
            <div className="d-label" style={{ marginBottom: '0.75rem' }}>Product</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/" style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Features</Link></li>
              <li><Link to="/pricing" style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="d-label" style={{ marginBottom: '0.75rem' }}>Company</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/about" style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>About</Link></li>
              <li><Link to="/contact" style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="d-label" style={{ marginBottom: '0.75rem' }}>Legal</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/privacy" style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Privacy</Link></li>
              <li><Link to="/terms" style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Terms</Link></li>
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          © 2026 Cornerstone Properties. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
