import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function Centered() {
  return (
    <div className="paper-canvas" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)', marginBottom: '1.5rem' }}>
        <Sparkles size={22} style={{ color: 'var(--d-primary)' }} />
        <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Lumen</span>
      </Link>
      <div className="paper-card" style={{ width: '100%', maxWidth: '26rem', padding: '1.75rem', borderRadius: 'var(--d-radius-lg)' }}>
        <Outlet />
      </div>
      <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem', marginTop: '1.5rem' }}>
        &copy; 2026 Lumen — distraction-free collaboration.
      </p>
    </div>
  );
}
