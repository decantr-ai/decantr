import { Outlet } from 'react-router-dom';

export function Centered() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: 'var(--d-bg)',
        padding: '1.5rem',
      }}
    >
      <div
        className="d-surface carbon-card"
        style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: 'var(--d-radius-lg)',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
