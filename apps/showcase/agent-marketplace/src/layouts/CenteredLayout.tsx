import { Outlet, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Bot } from 'lucide-react';

export function CenteredLayout() {
  return (
    <div
      className={css('_flex _col _aic _jcc _p4')}
      style={{ minHeight: '100dvh', background: 'var(--d-bg)' }}
    >
      {/* Brand mark */}
      <Link
        to="/"
        className={css('_flex _aic _gap2 _mb6') + ' neon-text-glow'}
        style={{ textDecoration: 'none', color: 'var(--d-accent)' }}
      >
        <div className="status-ring" data-status="active" style={{ width: '40px', height: '40px' }}>
          <Bot size={20} />
        </div>
        <span className={css('_fontsemi _textxl') + ' mono-data'}>NEXUS</span>
      </Link>

      {/* Centered card */}
      <div
        className={css('_wfull') + ' d-surface carbon-glass entrance-fade'}
        style={{ maxWidth: '28rem' }}
      >
        <Outlet />
      </div>

      {/* Footer link */}
      <p className={css('_mt4 _textsm')} style={{ color: 'var(--d-text-muted)' }}>
        <Link to="/" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>
          Back to home
        </Link>
      </p>
    </div>
  );
}
