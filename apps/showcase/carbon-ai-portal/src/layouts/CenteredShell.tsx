import { css } from '@decantr/css';
import { Outlet, Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

export function CenteredShell() {
  return (
    <div
      className={css('_flex _col _aic _jcc _p4') + ' carbon-canvas'}
      style={{ minHeight: '100vh' }}
    >
      <Link to="/" className={css('_flex _aic _gap2 _mb8 _fgtext _fontsemi _textlg')}>
        <Cpu size={22} strokeWidth={1.5} />
        Carbon AI
      </Link>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Outlet />
      </div>
      <div className={css('_mt8 _textxs _fgmuted _flex _gap4')}>
        <Link to="/privacy" className={css('_fgmuted _trans')}>Privacy</Link>
        <Link to="/terms" className={css('_fgmuted _trans')}>Terms</Link>
      </div>
    </div>
  );
}
