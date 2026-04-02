import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { CenteredShell } from '@/layouts/CenteredShell';
import { Input, Button } from '@/components';
import { ExternalLink } from 'lucide-react';

export function RegisterPage() {
  return (
    <CenteredShell>
      <div className={css('_flex _col _gap1 _textc')}>
        <h1 className={css('_text2xl _fontsemi _fgtext')}>Create an account</h1>
        <p className={css('_textsm _fgmuted')}>Get started with Carbon AI</p>
      </div>

      <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
        <div className={css('_grid _gap4')} style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Input label="First name" placeholder="John" autoComplete="given-name" />
          <Input label="Last name" placeholder="Doe" autoComplete="family-name" />
        </div>
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
        <Input label="Password" type="password" placeholder="Create a password" autoComplete="new-password" />
        <p className={css('_textxs _fgmuted')}>Must be at least 8 characters with a number and special character.</p>

        <Button variant="primary" type="submit" className={css('_wfull')}>
          Create account
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
        Already have an account?{' '}
        <Link to="/login" className={css('_fgprimary _fontmedium')}>Sign in</Link>
      </p>
    </CenteredShell>
  );
}
