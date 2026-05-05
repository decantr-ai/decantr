import { Outlet, NavLink, Link } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { css } from '@decantr/css';

const navLinks = [
  { to: '/', label: 'Home' },
];

export function TopNavFooter() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={css('_flex _col')} style={{ minHeight: '100vh' }}>
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', top: 0, left: 0, zIndex: 100, background: 'var(--d-primary)', color: '#fff', padding: '0.5rem 1rem' }}>
        Skip to main content
      </a>

      <header
        className="earth-nav"
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
          background: 'var(--d-bg)',
          flexShrink: 0,
        }}
      >
        <NavLink
          to="/"
          style={{
            fontWeight: 700,
            fontSize: '1.0625rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
            color: 'var(--d-text)',
          }}
        >
          <div style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--d-primary)', borderRadius: 'var(--d-radius)',
          }}>
            <Leaf size={18} color="#fff" />
          </div>
          ClimateDash
        </NavLink>

        <nav className={css('_flex _aic _gap6')} style={{ fontSize: '0.875rem' }} aria-label="Main navigation">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--d-primary)' : 'var(--d-text)',
                transition: 'color 0.15s ease',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={css('_flex _aic _gap3')}>
          <Link
            to="/login"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.375rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            Sign In
          </Link>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: '0.375rem', border: 'none', display: 'none' }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main id="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--d-border)',
          padding: '2rem 1.5rem',
          marginTop: 'auto',
          background: 'var(--d-surface)',
        }}
      >
        <div className={css('_flex _wrap _jcsb _gap8')} style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Leaf size={16} />
              ClimateDash
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', maxWidth: 280 }}>
              Carbon accounting and climate intelligence for organizations committed to net-zero futures.
            </div>
          </div>
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>Platform</div>
            <div className={css('_flex _col _gap2')} style={{ fontSize: '0.875rem' }}>
              <Link to="/emissions" style={{ textDecoration: 'none', color: 'var(--d-text-muted)' }}>Emissions</Link>
              <Link to="/suppliers" style={{ textDecoration: 'none', color: 'var(--d-text-muted)' }}>Supply Chain</Link>
              <Link to="/offsets" style={{ textDecoration: 'none', color: 'var(--d-text-muted)' }}>Offsets</Link>
              <Link to="/reports" style={{ textDecoration: 'none', color: 'var(--d-text-muted)' }}>Reports</Link>
            </div>
          </div>
          <div>
            <div className="d-label" style={{ marginBottom: '0.5rem' }}>Legal</div>
            <div className={css('_flex _col _gap2')} style={{ fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--d-text-muted)' }}>Privacy Policy</span>
              <span style={{ color: 'var(--d-text-muted)' }}>Terms of Service</span>
              <span style={{ color: 'var(--d-text-muted)' }}>Accessibility</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '1.5rem', borderTop: '1px solid var(--d-border)', paddingTop: '1rem' }}>
          &copy; 2026 ClimateDash. All rights reserved. A Decantr Showcase.
        </div>
      </footer>
    </div>
  );
}
