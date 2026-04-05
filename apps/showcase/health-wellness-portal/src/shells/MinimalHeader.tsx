import { Outlet, Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';

export function MinimalHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--d-bg)' }}>
      <header style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--d-border)',
        background: 'var(--d-surface)',
        flexShrink: 0,
      }}>
        <Link to="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          textDecoration: 'none', color: 'var(--d-text)', fontWeight: 700, fontSize: '1rem',
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 'var(--d-radius)',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={15} color="#fff" fill="#fff" />
          </div>
          Evergreen
        </Link>
        <Link
          to="/appointments"
          className="d-interactive"
          data-variant="ghost"
          style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem', border: 'none', textDecoration: 'none' }}
          aria-label="End session and return to appointments"
        >
          <X size={18} /> End Session
        </Link>
      </header>
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
