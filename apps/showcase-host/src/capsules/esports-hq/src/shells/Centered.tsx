import { Outlet } from 'react-router-dom';

export function Centered() {
  return (
    <div
      className="gg-dark"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '1.5rem',
      }}
    >
      <div
        className="d-surface"
        style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: 'var(--d-radius-lg)',
          padding: '2rem',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
