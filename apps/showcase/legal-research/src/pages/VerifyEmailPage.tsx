import { css } from '@decantr/css';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem', textAlign: 'center' }}>
      <div>
        <Mail size={40} style={{ color: 'var(--d-primary)', margin: '0 auto 1rem' }} />
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Verify your email</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.5rem', fontFamily: 'Georgia, serif' }}>
          We sent a verification link to your email address. Please check your inbox and click the link to continue.
        </p>
      </div>
      <button className="d-interactive" style={{ width: '100%', justifyContent: 'center' }}>
        Resend Verification Email
      </button>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
        <a href="#/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Back to sign in</a>
      </p>
    </div>
  );
}
