import { Outlet } from 'react-router-dom';

export function Centered() {
  return (
    <div
      className="pm-hero-bg"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '1.5rem',
      }}
    >
      <div
        className="pm-card"
        style={{
          width: '100%',
          maxWidth: '26rem',
          padding: '2rem',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
