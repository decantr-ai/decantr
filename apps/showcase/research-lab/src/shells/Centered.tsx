import { Outlet } from 'react-router-dom';
import { css } from '@decantr/css';

export function Centered() {
  return (
    <div
      className={css('_flex _center')}
      style={{ minHeight: '100vh', padding: '1.5rem', background: 'var(--d-surface)' }}
    >
      <div
        className="lab-panel"
        style={{
          width: '100%',
          maxWidth: '26rem',
          padding: 'var(--d-surface-p)',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
