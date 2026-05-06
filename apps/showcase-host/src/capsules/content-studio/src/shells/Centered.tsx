import { Outlet } from 'react-router-dom';
import { css } from '@decantr/css';

export function Centered() {
  return (
    <div
      className={css('_flex _center')}
      style={{ minHeight: '100vh', padding: '1.5rem', background: 'var(--d-bg)' }}
    >
      <div
        className="d-surface"
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
