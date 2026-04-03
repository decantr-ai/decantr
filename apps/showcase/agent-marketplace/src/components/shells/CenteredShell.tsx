import { css } from '@decantr/css';
import { Outlet } from 'react-router-dom';

export function CenteredShell() {
  return (
    <div
      className={css('_flex _aic _jcc _p4') + ' carbon-canvas'}
      style={{ minHeight: '100dvh' }}
    >
      <div className={css('_wfull')} style={{ maxWidth: '28rem' }}>
        <Outlet />
      </div>
    </div>
  );
}
