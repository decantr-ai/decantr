import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { MailCheck, RefreshCw } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div className={css('_flex _col _gap6 _wfull')}>
      <div className={css('_flex _col _aic _gap4 _textc')}>
        <div
          className={css('_flex _aic _jcc _roundedfull')}
          style={{
            width: '64px',
            height: '64px',
            background: 'rgba(124,147,176,0.12)',
            color: 'var(--d-primary)',
          }}
        >
          <MailCheck size={28} />
        </div>
        <h1 className={css('_heading3 _fgtext')}>Check your email</h1>
        <p className={css('_textsm _fgmuted')} style={{ maxWidth: '340px' }}>
          We sent a verification link to your email address. Click the link to activate your account.
        </p>
      </div>

      <div className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}>
        <p className={css('_textsm _fgmuted _textc')}>
          Did not receive the email? Check your spam folder or request a new one.
        </p>
        <Button variant="secondary" icon={<RefreshCw size={16} />} className={css('_wfull _jcc')}>
          Resend verification email
        </Button>
      </div>

      <Link
        to="/login"
        className={css('_textsm _fgmuted _textc _fontsemi _trans') + ' nav-link'}
      >
        Back to sign in
      </Link>
    </div>
  );
}
