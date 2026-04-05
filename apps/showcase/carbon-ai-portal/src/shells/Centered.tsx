import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function Centered() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: 'var(--d-bg)',
        padding: '2rem 1.5rem',
        gap: '1.5rem',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', color: 'var(--d-text)' }}>
        <Sparkles size={22} style={{ color: 'var(--d-accent)' }} />
        <span style={{ fontWeight: 600, fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>Carbon</span>
      </Link>
      <div
        className="carbon-card carbon-fade-slide"
        style={{
          width: '100%',
          maxWidth: '26rem',
          padding: '2rem',
          borderRadius: 'var(--d-radius-lg)',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
