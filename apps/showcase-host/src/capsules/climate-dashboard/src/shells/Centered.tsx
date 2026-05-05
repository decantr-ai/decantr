import { Outlet, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export function Centered() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '1.5rem',
        background: 'var(--d-bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--d-text)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <div style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--d-primary)', borderRadius: 'var(--d-radius)',
            }}>
              <Leaf size={20} color="#fff" />
            </div>
            ClimateDash
          </Link>
        </div>
        <div
          className="d-surface earth-card"
          style={{
            padding: '2.25rem',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
