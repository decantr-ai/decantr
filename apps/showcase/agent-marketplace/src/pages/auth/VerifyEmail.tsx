import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Mail, RefreshCw } from 'lucide-react';

export function VerifyEmail() {
  return (
    <div className={css('_flex _col _gap5 _wfull') + ' carbon-card ' + css('_p6') + ' fade-in'}>
      <div className={css('_flex _col _aic _gap3 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull') + ' neon-glow'}
          style={{ width: 64, height: 64, background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)' }}
        >
          <Mail size={28} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 className={'font-mono ' + css('_textxl _fontbold')}>Check your email</h1>
        <p className={'font-mono ' + css('_textsm _fgmuted')}>
          We sent a verification link to your email address. Click the link to activate your account.
        </p>
      </div>

      <div className={css('_flex _col _gap3 _p4 _rounded')} style={{ background: 'var(--d-surface-raised)' }}>
        <div className={css('_flex _aic _gap2')}>
          <span className={'status-ring status-processing pulse'} />
          <span className={'font-mono ' + css('_textsm')}>Waiting for verification...</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '60%', background: 'var(--d-primary)' }} />
        </div>
      </div>

      <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
        <RefreshCw size={14} />
        <span className="font-mono">Resend verification email</span>
      </button>

      <Link to="/login" className={'font-mono ' + css('_textxs _fgmuted _textc')}>
        Back to sign in
      </Link>
    </div>
  );
}
