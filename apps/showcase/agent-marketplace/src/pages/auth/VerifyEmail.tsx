import { css } from '@decantr/css';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VerifyEmail() {
  return (
    <div className={css('_flex _col _aic _gap4')} style={{ textAlign: 'center' }}>
      <div
        className="neon-ring neon-ring-active"
        style={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Mail size={28} style={{ color: 'var(--d-accent)' }} />
      </div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Check Your Email</h1>
      <p className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
        We sent a verification link to your email address. Click the link to activate your account.
      </p>
      <button
        className="d-interactive neon-glow-hover"
        style={{
          width: '100%',
          justifyContent: 'center',
          background: 'var(--d-accent)',
          color: 'var(--d-bg)',
          borderColor: 'var(--d-accent)',
          fontWeight: 500,
        }}
      >
        Resend Email
      </button>
      <Link to="/login" className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
        Back to sign in
      </Link>
    </div>
  );
}
