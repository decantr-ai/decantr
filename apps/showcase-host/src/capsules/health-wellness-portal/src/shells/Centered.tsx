import { Outlet } from 'react-router-dom';

export function Centered() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '1.5rem',
        background: `
          radial-gradient(ellipse at 20% 20%, color-mix(in srgb, var(--d-primary) 8%, transparent) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 80%, color-mix(in srgb, var(--d-secondary) 8%, transparent) 0%, transparent 45%),
          var(--d-bg)
        `,
      }}
    >
      <div
        className="d-surface"
        style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: 'var(--d-radius-lg)',
          padding: '2.25rem',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
