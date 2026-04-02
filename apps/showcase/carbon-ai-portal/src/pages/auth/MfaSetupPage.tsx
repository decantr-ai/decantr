import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { CenteredShell } from '@/layouts/CenteredShell';
import { Input, Button } from '@/components';

export function MfaSetupPage() {
  return (
    <CenteredShell>
      <div className={css('_flex _col _aic _gap4 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull')}
          style={{
            width: '56px',
            height: '56px',
            background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)',
          }}
        >
          <Shield size={24} className={css('_fgprimary')} />
        </div>
        <div className={css('_flex _col _gap1')}>
          <h1 className={css('_text2xl _fontsemi _fgtext')}>Set up two-factor authentication</h1>
          <p className={css('_textsm _fgmuted')}>
            Scan the QR code with your authenticator app, then enter the verification code below.
          </p>
        </div>
      </div>

      {/* QR code placeholder */}
      <div
        className={css('_flex _aic _jcc _rounded _bgsurface')}
        style={{ height: '200px', border: '1px solid var(--d-border)' }}
      >
        <span className={css('_textsm _fgmuted')}>QR Code Placeholder</span>
      </div>

      <div className={css('_flex _col _gap2')}>
        <p className={css('_textxs _fgmuted _textc')}>
          Manual entry key: <code className={css('_fgprimary')}>JBSWY3DPEHPK3PXP</code>
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Verification code" placeholder="Enter 6-digit code" maxLength={6} autoComplete="one-time-code" />
        <Button variant="primary" type="submit" className={css('_wfull')}>
          Verify and enable
        </Button>
      </form>

      <Link to="/login" className={css('_textsm _fgmuted _textc')}>
        Skip for now
      </Link>
    </CenteredShell>
  );
}
