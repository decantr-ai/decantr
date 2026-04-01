import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';

export function CenteredLayout() {
  return (
    <div
      className={css('_flex _col _aic _jcc') + ' carbon-canvas'}
      style={{ minHeight: '100vh', padding: 'var(--d-gap-4)' }}
    >
      <div className={css('_flex _col _aic _gap8')} style={{ width: '100%', maxWidth: 420 }}>
        <Link
          to="/"
          className={css('_text2xl _fontsemi _fgtext')}
          style={{ textDecoration: 'none' }}
        >
          Carbon AI
        </Link>
        <Outlet />
        <p className={css('_textxs _fgmuted _textc')}>
          &copy; 2026 Carbon AI &middot;{' '}
          <Link to="/privacy" className={css('_fgmuted')} style={{ textDecoration: 'underline' }}>Privacy</Link>
          {' '}&middot;{' '}
          <Link to="/terms" className={css('_fgmuted')} style={{ textDecoration: 'underline' }}>Terms</Link>
        </p>
      </div>
    </div>
  );
}
