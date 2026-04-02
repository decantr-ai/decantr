import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { CenteredShell } from '@/layouts/CenteredShell';
import { Input, Button } from '@/components';
import { ExternalLink } from 'lucide-react';

export function LoginPage() {
  return (
    <CenteredShell>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_text2xl _fontsemi _fgtext')}>Welcome back</h1>
        <p className={css('_textsm _fgmuted')}>Sign in to your account to continue</p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
        <Input label="Password" type="password" placeholder="Enter your password" autoComplete="current-password" />

        <div className={css('_flex _aic _jcsb')}>
          <label className={css('_flex _aic _gap2 _textsm _fgmuted')}>
            <input type="checkbox" style={{ accentColor: 'var(--d-primary)' }} />
            Remember me
          </label>
          <Link to="/forgot-password" className={css('_textsm _fgprimary')}>
            Forgot password?
          </Link>
        </div>

        <Button variant="primary" type="submit" className={css('_wfull')}>
          Sign in
        </Button>
      </form>

      <div className={css('_flex _aic _gap3')}>
        <div className={css('_flex1')} style={{ height: '1px', background: 'var(--d-border)' }} />
        <span className={css('_textsm _fgmuted')}>or</span>
        <div className={css('_flex1')} style={{ height: '1px', background: 'var(--d-border)' }} />
      </div>

      <Button variant="outline" className={css('_wfull')}>
        <ExternalLink size={16} />
        Continue with GitHub
      </Button>

      <p className={css('_textsm _fgmuted _textc')}>
        Don't have an account?{' '}
        <Link to="/register" className={css('_fgprimary _fontmedium')}>Sign up</Link>
      </p>
    </CenteredShell>
  );
}
