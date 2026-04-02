import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Zap } from 'lucide-react';

export function CenteredLayout() {
  return (
    <div
      className={css('_flex _col _aic _jcc _px4')}
      style={{ minHeight: '100dvh', background: 'var(--d-bg)' }}
    >
      <div className={css('_w100 _flex _col _aic _gap6')} style={{ maxWidth: '28rem' }}>
        <Link to="/" className={css('_flex _aic _gap2 _mb4')} style={{ textDecoration: 'none' }}>
          <Zap size={24} style={{ color: 'var(--d-accent)' }} />
          <span className={css('_fontsemi _textxl')}>AgentSwarm</span>
        </Link>
        <div className={css('_w100') + ' entrance-fade'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
