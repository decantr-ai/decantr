import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Sparkles } from 'lucide-react';

export function CenteredLayout() {
  return (
    <div
      className={css('_flex _col _aic _jcc _p4') + ' carbon-canvas'}
      style={{ minHeight: '100vh' }}
    >
      <div className={css('_flex _col _aic _gap6')} style={{ width: '100%', maxWidth: '420px' }}>
        <Link
          to="/"
          className={css('_flex _aic _gap2 _fontbold _textxl _fgtext _mb4')}
        >
          <Sparkles size={24} />
          Carbon AI
        </Link>
        <div id="main-content" className={css('_wfull')}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
