import { css } from '@decantr/css';
import { CenteredShell } from '@/layouts/CenteredShell';
import { Input, Button } from '@/components';

export function ResetPasswordPage() {
  return (
    <CenteredShell>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_text2xl _fontsemi _fgtext')}>Reset password</h1>
        <p className={css('_textsm _fgmuted')}>
          Choose a new password for your account.
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="New password" type="password" placeholder="Enter new password" autoComplete="new-password" />
        <Input label="Confirm password" type="password" placeholder="Confirm new password" autoComplete="new-password" />
        <p className={css('_textxs _fgmuted')}>Must be at least 8 characters with a number and special character.</p>
        <Button variant="primary" type="submit" className={css('_wfull')}>
          Reset password
        </Button>
      </form>
    </CenteredShell>
  );
}
