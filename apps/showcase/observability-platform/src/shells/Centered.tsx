import { Outlet, NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';

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
      <div style={{ width: '100%', maxWidth: '26rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <NavLink to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text)', textDecoration: 'none', fontWeight: 600, justifyContent: 'center' }}>
          <Activity size={18} style={{ color: 'var(--d-primary)' }} />
          <span>sentinel.obs</span>
        </NavLink>
        <div className="fin-card" data-elevated="true" style={{ padding: '1.75rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
