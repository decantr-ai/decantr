import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '@/components';

export function ResetPasswordPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <h1 className={css('_heading3')}>Reset password</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Enter your new password below.</p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="New password" type="password" placeholder="Enter new password" autoComplete="new-password" />
        <Input label="Confirm password" type="password" placeholder="Confirm new password" autoComplete="new-password" />
        <Button variant="primary" type="submit" className={css('_wfull')}>
          Update password
        </Button>
      </form>

      <div className={css('_textc _textsm _fgmuted')}>
        <Link to="/login" className={css('_fgprimary')}>Back to sign in</Link>
      </div>
    </Card>
  );
}
