import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function TopNavFooter() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="paper-canvas">
      <header
        style={{
          height: 60,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)' }}>
          <Sparkles size={20} style={{ color: 'var(--d-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>Lumen</span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/pricing" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Pricing</Link>
          <Link to="/about" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>About</Link>
          <Link to="/contact" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Contact</Link>
          <Link to="/login" style={{ textDecoration: 'none', color: 'var(--d-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Sign in</Link>
          <Link
            to="/register"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.4375rem 0.875rem', fontSize: '0.8125rem', textDecoration: 'none', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}
          >
            Create workspace
          </Link>
        </nav>
      </header>

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '2.5rem 1.5rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={16} style={{ color: 'var(--d-primary)' }} />
              <span style={{ fontWeight: 600 }}>Lumen</span>
            </div>
            <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>The collaborative workspace for focused teams.</p>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)' }}>Product</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/pricing" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Pricing</Link>
              <Link to="/about" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>About</Link>
              <Link to="/contact" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Contact</Link>
            </div>
          </div>
          <div>
            <p className="d-label" style={{ marginBottom: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)' }}>Legal</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/privacy" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy</Link>
              <Link to="/terms" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Terms</Link>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '64rem', margin: '1.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)' }}>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>&copy; 2026 Lumen. Built with Decantr.</p>
        </div>
      </footer>
    </div>
  );
}
