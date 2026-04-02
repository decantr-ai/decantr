import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '@/components';

export function RegisterPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <h1 className={css('_heading3')}>Create your account</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Start deploying AI agents in minutes</p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <Input label="Full name" type="text" placeholder="Jane Doe" autoComplete="name" />
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
        <Input label="Password" type="password" placeholder="Create a password" autoComplete="new-password" />
        <Input label="Confirm password" type="password" placeholder="Confirm your password" autoComplete="new-password" />

        <label className={css('_flex _aic _gap2 _textsm _fgmuted _pointer')}>
          <input type="checkbox" style={{ accentColor: 'var(--d-primary)' }} />
          <span>
            I agree to the{' '}
            <Link to="/terms" className={css('_fgprimary')}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className={css('_fgprimary')}>Privacy Policy</Link>
          </span>
        </label>

        <Button variant="primary" type="submit" className={css('_wfull')}>
          Create account
        </Button>
      </form>

      <div className={css('_textc _textsm _fgmuted')}>
        Already have an account?{' '}
        <Link to="/login" className={css('_fgprimary _fontsemi')}>
          Sign in
        </Link>
      </div>
    </Card>
  );
}
