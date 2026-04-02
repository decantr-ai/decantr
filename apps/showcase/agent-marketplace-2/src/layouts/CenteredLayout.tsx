import { Outlet } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap } from 'lucide-react';

export function CenteredLayout() {
  return (
    <div
      className={css('_flex _col _aic _jcc') + ' carbon-canvas'}
      style={{ minHeight: '100dvh', padding: '1rem' }}
    >
      <div className={css('_flex _col _aic _gap6')} style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Brand */}
        <div className={css('_flex _aic _gap2')}>
          <Zap size={24} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textlg') + ' mono-data neon-text-glow'} style={{ color: 'var(--d-accent)' }}>
            NEXUS
          </span>
        </div>

        {/* Auth content */}
        <div className={css('_wfull') + ' entrance-fade'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
