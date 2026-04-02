import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { CenteredShell } from '@/layouts/CenteredShell';
import { Input, Button } from '@/components';

export function PhoneVerifyPage() {
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
          <Smartphone size={24} className={css('_fgprimary')} />
        </div>
        <div className={css('_flex _col _gap1')}>
          <h1 className={css('_text2xl _fontsemi _fgtext')}>Verify your phone</h1>
          <p className={css('_textsm _fgmuted')}>
            We've sent a verification code to your phone number ending in ****1234.
          </p>
        </div>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Verification code" placeholder="Enter 6-digit code" maxLength={6} autoComplete="one-time-code" />
        <Button variant="primary" type="submit" className={css('_wfull')}>
          Verify phone
        </Button>
      </form>

      <div className={css('_flex _col _gap2 _aic')}>
        <button className={css('_textsm _fgprimary _fontmedium') + ' btn-ghost'} style={{ border: 'none', background: 'none', padding: 0 }}>
          Resend code
        </button>
        <Link to="/login" className={css('_textsm _fgmuted')}>
          Back to sign in
        </Link>
      </div>
    </CenteredShell>
  );
}
