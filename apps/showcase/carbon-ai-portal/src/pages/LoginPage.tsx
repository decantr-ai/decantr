import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { LogIn, ExternalLink } from 'lucide-react';

export function LoginPage() {
  return (
    <div className={css('_flex _col _gap6 _wfull')}>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_heading3 _fgtext')}>Welcome back</h1>
        <p className={css('_textsm _fgmuted')}>Sign in to continue to Carbon AI</p>
      </div>

      <form
        className={css('_flex _col _gap4 _p6 _rounded') + ' carbon-card'}
        onSubmit={(e) => e.preventDefault()}
      >
        <InputField label="Email" type="email" placeholder="you@example.com" />
        <InputField label="Password" type="password" placeholder="Enter your password" />

        <div className={css('_flex _jcsb _aic')}>
          <label className={css('_flex _aic _gap2 _textsm _fgmuted _pointer')}>
            <input type="checkbox" style={{ accentColor: 'var(--d-primary)' }} />
            Remember me
          </label>
          <Link to="/forgot-password" className={css('_textsm _fgprimary _trans')}>
            Forgot password?
          </Link>
        </div>

        <Button variant="primary" icon={<LogIn size={16} />} type="submit" className={css('_wfull _jcc')}>
          Sign in
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
        No account?{' '}
        <Link to="/register" className={css('_fgprimary _fontsemi')}>
          Create one
        </Link>
      </p>
    </div>
  );
}
