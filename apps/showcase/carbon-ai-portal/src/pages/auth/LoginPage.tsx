import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '@/components';

export function LoginPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <h1 className={css('_heading3')}>Welcome back</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Sign in to your Carbon AI account</p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
        <Input label="Password" type="password" placeholder="Enter your password" autoComplete="current-password" />

        <div className={css('_flex _jcsb _aic')}>
          <label className={css('_flex _aic _gap2 _textsm _fgmuted _pointer')}>
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

      <div className={css('_textc _textsm _fgmuted')}>
        Don't have an account?{' '}
        <Link to="/register" className={css('_fgprimary _fontsemi')}>
          Sign up
        </Link>
      </div>
    </Card>
  );
}
