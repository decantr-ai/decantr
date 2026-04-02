import { css } from '@decantr/css';
import { Shield } from 'lucide-react';

export function MfaSetupPage() {
  return (
    <div className={css('_w100 _flex _col _gap5 _p6') + ' d-surface carbon-card'}>
      <div className={css('_flex _col _aic _gap2 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull _mb2')}
          style={{
            width: 48,
            height: 48,
            background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
          }}
        >
          <Shield size={24} style={{ color: 'var(--d-accent)' }} />
        </div>
        <h1 className={css('_textxl _fontsemi')}>Set Up MFA</h1>
        <p className={css('_textsm _fgmuted')}>
          Scan the QR code with your authenticator app.
        </p>
      </div>

      {/* QR placeholder */}
      <div
        className={css('_flex _aic _jcc _roundedlg') + ' d-surface'}
        style={{ height: 180, background: 'var(--d-surface-raised)' }}
      >
        <span className={css('_fgmuted _textsm') + ' mono-data'}>QR Code Placeholder</span>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontsemi')} htmlFor="mfa-code">
            Verification Code
          </label>
          <input
            id="mfa-code"
            type="text"
            placeholder="Enter 6-digit code"
            className="d-control carbon-input"
          />
        </div>
        <button
          type="submit"
          className={css('_w100 _jcc') + ' d-interactive neon-glow-hover'}
          data-variant="primary"
        >
          Verify & Enable
        </button>
      </form>
    </div>
  );
}
