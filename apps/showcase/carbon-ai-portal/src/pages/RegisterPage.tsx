import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { UserPlus, ExternalLink } from 'lucide-react';

export function RegisterPage() {
  return (
    <div className={css('_flex _col _gap6 _wfull')}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_heading3 _fgtext')}>Create your account</h1>
        <p className={css('_textsm _fgmuted')}>Start using Carbon AI in seconds</p>
      </div>

      <form
        className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={css('_grid _gc2 _gap4')}>
          <InputField label="First name" placeholder="Jane" />
          <InputField label="Last name" placeholder="Doe" />
        </div>
        <InputField label="Email" type="email" placeholder="you@example.com" />
        <InputField label="Password" type="password" placeholder="Create a strong password" />

        <p className={css('_textxs _fgmuted')}>
          By creating an account, you agree to the{' '}
          <Link to="/terms" className={css('_fgprimary')}>Terms</Link> and{' '}
          <Link to="/privacy" className={css('_fgprimary')}>Privacy Policy</Link>.
        </p>

        <Button variant="primary" icon={<UserPlus size={16} />} type="submit" className={css('_wfull _jcc')}>
          Create account
        </Button>

        <div className={css('_flex _aic _gap3')}>
          <div className={css('_flex1')} style={{ height: '1px', background: 'var(--d-border)' }} />
          <span className={css('_textsm _fgmuted')}>or</span>
          <div className={css('_flex1')} style={{ height: '1px', background: 'var(--d-border)' }} />
        </div>

        <Button variant="secondary" icon={<ExternalLink size={16} />} type="button" className={css('_wfull _jcc')}>
          Continue with SSO
        </Button>
      </form>

      <p className={css('_textsm _fgmuted _textc')}>
        Already have an account?{' '}
        <Link to="/login" className={css('_fgprimary _fontsemi')}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
