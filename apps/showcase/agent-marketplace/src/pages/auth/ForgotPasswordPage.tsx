import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '@/components';

export function ForgotPasswordPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <h1 className={css('_heading3')}>Reset your password</h1>
        <p className={css('_textsm _fgmuted _mt1')}>
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" />

        <Button variant="primary" type="submit" className={css('_wfull')}>
          Send reset link
        </Button>
      </form>

      <div className={css('_textc _textsm _fgmuted')}>
        <Link to="/login" className={css('_fgprimary')}>Back to sign in</Link>
      </div>
    </Card>
  );
}
