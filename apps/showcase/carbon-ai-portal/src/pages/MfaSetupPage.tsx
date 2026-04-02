import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ShieldCheck, Copy } from 'lucide-react';

export function MfaSetupPage() {
  return (
    <div className={css('_flex _col _gap6 _wfull')}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_heading3 _fgtext')}>Set up two-factor auth</h1>
        <p className={css('_textsm _fgmuted')}>
          Add an extra layer of security to your account.
        </p>
      </div>

      <div className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}>
        <p className={css('_textsm _fgmuted')}>
          Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.).
        </p>

        {/* QR placeholder */}
        <div
          className={css('_flex _aic _jcc _rounded')}
          style={{
            width: '200px',
            height: '200px',
            background: 'var(--d-surface-raised)',
            margin: '0 auto',
            border: '1px solid var(--d-border)',
          }}
        >
          <ShieldCheck size={48} style={{ color: 'var(--d-text-muted)' }} />
        </div>

        <div className={css('_flex _col _gap1')}>
          <span className={css('_textxs _fgmuted _fontsemi')}>Manual entry key</span>
          <div className={css('_flex _aic _gap2')}>
            <code
              className={css('_flex1 _textsm _p2 _rounded') + ' carbon-code'}
              style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
            >
              JBSW Y3DP EHPK 3PXP
            </code>
            <button
              className={css('_flex _aic _jcc _p2 _rounded _bordernone _trans _pointer') + ' btn-ghost'}
              aria-label="Copy key"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <Link to="/mfa-verify">
          <Button variant="primary" className={css('_wfull _jcc')}>
            Continue to verification
          </Button>
        </Link>
      </div>

      <Link
        to="/login"
        className={css('_textsm _fgmuted _textc _fontsemi _trans') + ' nav-link'}
      >
        Skip for now
      </Link>
    </div>
  );
}
