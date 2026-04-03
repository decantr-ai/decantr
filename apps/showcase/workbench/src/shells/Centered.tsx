import { Outlet } from 'react-router-dom';

export function Centered() {
  return (
    <div
      className="d-mesh"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '1.5rem',
      }}
    >
      <div
        className="d-surface d-glass"
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
