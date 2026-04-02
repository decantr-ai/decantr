import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot } from 'lucide-react';

export function CenteredShell() {
  return (
    <div className="shell-centered carbon-canvas">
      <div className={css('_flex _col _aic _gap6') + ' fade-in'} style={{ width: '100%', maxWidth: '400px' }}>
        <Link to="/" className={css('_flex _aic _gap2')} aria-label="Home">
          <Bot size={24} style={{ color: 'var(--d-primary)' }} />
          <span className={'font-mono neon-text-glow ' + css('_fontsemi _textlg')}>
            AGENT<span style={{ color: 'var(--d-primary)' }}>::</span>CTRL
          </span>
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
