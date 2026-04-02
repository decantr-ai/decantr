import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { CenteredShell } from '@/layouts/CenteredShell';
import { Button } from '@/components';

export function VerifyEmailPage() {
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
          <Mail size={24} className={css('_fgprimary')} />
        </div>
        <div className={css('_flex _col _gap1')}>
          <h1 className={css('_text2xl _fontsemi _fgtext')}>Check your email</h1>
          <p className={css('_textsm _fgmuted')}>
            We've sent a verification link to your email address. Click the link to verify your account.
          </p>
        </div>
      </div>

      <Button variant="outline" className={css('_wfull')}>
        Resend verification email
      </Button>

      <p className={css('_textsm _fgmuted _textc')}>
        Wrong email?{' '}
        <Link to="/register" className={css('_fgprimary _fontmedium')}>Go back</Link>
      </p>
    </CenteredShell>
  );
}
