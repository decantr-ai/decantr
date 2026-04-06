import { Outlet } from 'react-router-dom';
import { css } from '@decantr/css';

export function Centered() {
  return (
    <div
      className={css('_flex _jcc _aic') + ' counsel-page'}
      style={{ minHeight: '100vh', padding: '1.5rem' }}
    >
      <div
        className="d-surface"
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
