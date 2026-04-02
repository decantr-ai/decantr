import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { CenteredShell } from '@/layouts/CenteredShell';
import { Input, Button } from '@/components';

export function MfaVerifyPage() {
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
          <h1 className={css('_text2xl _fontsemi _fgtext')}>Two-factor verification</h1>
          <p className={css('_textsm _fgmuted')}>
            Enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Verification code" placeholder="000000" maxLength={6} autoComplete="one-time-code" />
        <Button variant="primary" type="submit" className={css('_wfull')}>
          Verify
        </Button>
      </form>

      <div className={css('_flex _col _gap2 _textc')}>
        <Link to="/login" className={css('_textsm _fgmuted')}>
          Use a recovery code instead
        </Link>
      </div>
    </CenteredShell>
  );
}
