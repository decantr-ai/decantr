import { Outlet } from 'react-router-dom';
import { css } from '@decantr/css';

export function Centered() {
  return (
    <div
      className={css('_flex _center') + ' paper-canvas'}
      style={{ minHeight: '100vh', padding: '1.5rem' }}
    >
      <div
        className="d-surface paper-card"
        style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: 'var(--d-radius-lg)',
          padding: 'var(--d-surface-p)',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
