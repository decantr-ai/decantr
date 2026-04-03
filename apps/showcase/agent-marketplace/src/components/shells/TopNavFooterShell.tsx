import { css } from '@decantr/css';
import { Outlet } from 'react-router-dom';

export function TopNavFooterShell() {
  return (
    <div className={css('_flex _col')} style={{ minHeight: '100dvh' }}>
      <main className={css('_flex1')}>
        <Outlet />
      </main>
    </div>
  );
}
