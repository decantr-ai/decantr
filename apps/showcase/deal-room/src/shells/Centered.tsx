import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';

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
      <div
        className="d-surface"
        style={{
          width: '100%',
          maxWidth: '26rem',
          borderRadius: 'var(--d-radius-lg)',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--d-text)', fontFamily: 'var(--d-font-display)', fontWeight: 600 }}>
          <Shield size={20} style={{ color: 'var(--d-primary)' }} />
          Meridian
        </div>
        <Outlet />
      </div>
    </div>
  );
}
