import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { Mail, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  return (
    <div className={css('_flex _col _gap6 _wfull')}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_heading3 _fgtext')}>Forgot your password?</h1>
        <p className={css('_textsm _fgmuted')}>
          Enter your email and we will send you a reset link.
        </p>
      </div>

      <form
        className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}
        onSubmit={(e) => e.preventDefault()}
      >
        <InputField label="Email address" type="email" placeholder="you@example.com" />
        <Button variant="primary" icon={<Mail size={16} />} type="submit" className={css('_wfull _jcc')}>
          Send reset link
        </Button>
      </form>

      <Link
        to="/login"
        className={css('_flex _aic _jcc _gap2 _textsm _fontsemi _fgmuted _trans') + ' nav-link'}
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}
