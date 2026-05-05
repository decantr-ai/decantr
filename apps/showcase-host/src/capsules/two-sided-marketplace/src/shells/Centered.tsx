import { Outlet, Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function Centered() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '2rem 1.5rem',
      background: 'var(--d-bg)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '2rem' }}>
        <Home size={22} style={{ color: 'var(--d-primary)' }} />
        Nestable
      </Link>
      <div
        className="nm-card"
        style={{ width: '100%', maxWidth: '26rem', padding: '2rem', boxShadow: 'var(--d-shadow-lg)' }}
      >
        <Outlet />
      </div>
    </div>
  );
}
