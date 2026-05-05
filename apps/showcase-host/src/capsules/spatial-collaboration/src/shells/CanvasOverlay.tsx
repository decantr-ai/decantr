import { Outlet } from 'react-router-dom';

export function CanvasOverlay() {
  return (
    <div
      data-theme="carbon"
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: 'var(--d-bg)',
        overflow: 'hidden',
      }}
    >
      <Outlet />
    </div>
  );
}
