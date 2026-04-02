import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { KeyRound } from 'lucide-react';

export function ResetPasswordPage() {
  return (
    <div className={css('_flex _col _gap6 _wfull')}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_heading3 _fgtext')}>Set a new password</h1>
        <p className={css('_textsm _fgmuted')}>
          Choose a strong password you have not used before.
        </p>
      </div>

      <form
        className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}
        onSubmit={(e) => e.preventDefault()}
      >
        <InputField label="New password" type="password" placeholder="Enter new password" />
        <InputField label="Confirm password" type="password" placeholder="Confirm new password" />
        <Button variant="primary" icon={<KeyRound size={16} />} type="submit" className={css('_wfull _jcc')}>
          Reset password
        </Button>
      </form>

      <p className={css('_textsm _fgmuted _textc')}>
        Remembered it?{' '}
        <Link to="/login" className={css('_fgprimary _fontsemi')}>
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
