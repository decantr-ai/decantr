import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CenteredShell } from '@/layouts/CenteredShell';
import { Input, Button } from '@/components';

export function ForgotPasswordPage() {
  return (
    <CenteredShell>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_text2xl _fontsemi _fgtext')}>Forgot password?</h1>
        <p className={css('_textsm _fgmuted')}>
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
        <Button variant="primary" type="submit" className={css('_wfull')}>
          Send reset link
        </Button>
      </form>

      <Link to="/login" className={css('_flex _aic _jcc _gap2 _textsm _fgmuted')}>
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </CenteredShell>
  );
}
