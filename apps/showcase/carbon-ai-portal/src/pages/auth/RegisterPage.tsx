import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '@/components';

export function RegisterPage() {
  return (
    <Card className={css('_flex _col _gap6') + ' carbon-fade-slide'}>
      <div className={css('_textc')}>
        <h1 className={css('_heading3')}>Create your account</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Start using Carbon AI for free</p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <div className={css('_grid _gc2 _gap4')}>
          <Input label="First name" placeholder="Jane" autoComplete="given-name" />
          <Input label="Last name" placeholder="Doe" autoComplete="family-name" />
        </div>
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
        <Input label="Password" type="password" placeholder="Create a password" autoComplete="new-password" />

        <p className={css('_textxs _fgmuted')}>
          By signing up, you agree to our{' '}
          <Link to="/terms" className={css('_fgprimary')}>Terms</Link>{' '}
          and{' '}
          <Link to="/privacy" className={css('_fgprimary')}>Privacy Policy</Link>.
        </p>

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
