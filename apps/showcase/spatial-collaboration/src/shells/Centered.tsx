import { Outlet } from 'react-router-dom';
import { css } from '@decantr/css';

export function Centered() {
  return (
    <div
      className={css('_flex _aic _jcc')}
      style={{ minHeight: '100dvh', background: 'var(--d-bg)', padding: '1.5rem' }}
      data-theme="carbon"
    >
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <Outlet />
      </div>
    </div>
  );
}
