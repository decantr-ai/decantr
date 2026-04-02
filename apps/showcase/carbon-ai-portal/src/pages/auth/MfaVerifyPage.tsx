import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button, Card, Input } from '@/components';

export function MfaVerifyPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <div className={css('_flex _jcc _mb3')}>
          <div
            className={css('_flex _aic _jcc _rounded')}
            style={{
              width: 48,
              height: 48,
              background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))',
            }}
          >
            <ShieldCheck size={24} style={{ color: 'var(--d-primary)' }} />
          </div>
        </div>
        <h1 className={css('_heading3')}>Two-factor verification</h1>
        <p className={css('_textsm _fgmuted _mt1')}>
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Verification code" placeholder="000 000" autoComplete="one-time-code" />
        <Button variant="primary" type="submit" className={css('_wfull')}>
          Verify
        </Button>
      </form>

      <div className={css('_textc _textsm _fgmuted')}>
        Lost your authenticator?{' '}
        <Link to="/login" className={css('_fgprimary')}>Use a backup code</Link>
      </div>
    </Card>
  );
}
