import { Outlet, NavLink } from 'react-router-dom';
import { Terminal } from 'lucide-react';

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
      className="grid-bg"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 500px 300px at 50% 50%, color-mix(in srgb, var(--d-accent) 8%, transparent), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ width: '100%', maxWidth: '24rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
        <NavLink
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--d-text)',
            textDecoration: 'none',
            fontWeight: 600,
            justifyContent: 'center',
            fontFamily: 'var(--d-font-mono)',
            fontSize: '0.95rem',
          }}
        >
          <Terminal size={20} className="neon-accent" />
          <span>agent.studio</span>
        </NavLink>
        <div className="carbon-card" style={{ padding: '1.75rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
