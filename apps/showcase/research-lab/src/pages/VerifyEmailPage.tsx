import { css } from '@decantr/css';
import { FlaskConical, Mail } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem', textAlign: 'center' }}>
      <div>
        <div className={css('_flex _center')} style={{ marginBottom: '0.75rem' }}>
          <FlaskConical size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontWeight: 500, fontSize: '1.125rem' }}>Verify your email</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Check your institutional inbox
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 2, background: 'color-mix(in srgb, var(--d-primary) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mail size={28} style={{ color: 'var(--d-primary)' }} />
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
        We sent a verification link to your email address. Click the link to activate your account.
      </p>

      <button className="d-interactive" style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}>
        Resend Verification Email
      </button>

      <a href="#/login" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>
        Back to sign in
      </a>
    </div>
  );
}
