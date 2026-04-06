import { Outlet, NavLink } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

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
        position: 'relative',
      }}
      className="cinema-grain"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 500px 300px at 50% 50%, color-mix(in srgb, var(--d-primary) 8%, transparent), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ width: '100%', maxWidth: '28rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
        <NavLink
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--d-text)',
            textDecoration: 'none',
            fontWeight: 700,
            justifyContent: 'center',
            fontSize: '0.95rem',
          }}
        >
          <Clapperboard size={20} style={{ color: 'var(--d-primary)' }} />
          <span style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.04em' }}>AI Video Studio</span>
        </NavLink>
        <div className="d-surface" style={{ padding: '1.75rem', borderRadius: 'var(--d-radius-lg)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
