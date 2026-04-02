import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '@/components';

export function MfaVerifyPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <h1 className={css('_heading3')}>Two-factor authentication</h1>
        <p className={css('_textsm _fgmuted _mt1')}>
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Verification code" placeholder="000 000" autoComplete="one-time-code" />

        <Button variant="primary" type="submit" className={css('_wfull')}>
          Verify
        </Button>
      </form>

      <div className={css('_flex _col _aic _gap2 _textsm _fgmuted')}>
        <button
          type="button"
          className={css('_fgprimary _pointer')}
          style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer' }}
        >
          Use recovery code
        </button>
        <Link to="/login" className={css('_fgprimary')}>Back to sign in</Link>
      </div>
    </Card>
  );
}
