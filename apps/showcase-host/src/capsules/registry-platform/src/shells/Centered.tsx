import { Outlet } from 'react-router-dom';

export default function Centered() {
  return (
    <div
      className="lum-canvas"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '1.5rem',
        position: 'relative',
      }}
    >
      <div className="lum-orbs" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 1 }}>
        <div className="entrance-fade">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
