import { css } from '@decantr/css';
import { Link } from 'react-router-dom';

export function MfaSetupPage() {
  return (
    <div className={css('_wfull')}>
      <div className={css('_flex _col _gap6 _p8') + ' carbon-card carbon-fade-slide'}>
        <div className={css('_flex _col _gap2 _textc')}>
          <h1 className={css('_heading3 _fgtext')}>Set Up Two-Factor Auth</h1>
          <p className={css('_textsm _fgmuted')}>
            Scan the QR code with your authenticator app
          </p>
        </div>

        {/* QR code placeholder */}
        <div
          className={css('_flex _aic _jcc _rounded')}
          style={{
            width: 200,
            height: 200,
            margin: '0 auto',
            background: 'var(--d-surface-raised)',
            border: '1px solid var(--d-border)',
          }}
        >
          <span className={css('_textsm _fgmuted')}>QR Code</span>
        </div>

        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium _fgtext')} htmlFor="mfa-secret">
            Or enter this code manually
          </label>
          <div className={css('_px4 _py3 _rounded _textsm _fgprimary _textc') + ' carbon-code'}>
            ABCD-EFGH-IJKL-MNOP
          </div>
        </div>

        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium _fgtext')} htmlFor="mfa-code">
            Verification Code
          </label>
          <input
            id="mfa-code"
            type="text"
            placeholder="Enter 6-digit code"
            className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
            style={{ background: 'var(--d-bg)', outline: 'none' }}
          />
        </div>

        <button
          type="button"
          className={css('_bgprimary _fgtext _fontsemi _py3 _rounded _textbase _pointer')}
          style={{ border: 'none' }}
        >
          Verify &amp; Enable
        </button>
      </div>
      <p className={css('_textsm _fgmuted _textc _pt4')}>
        <Link to="/login" className={css('_fgprimary')} style={{ textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
