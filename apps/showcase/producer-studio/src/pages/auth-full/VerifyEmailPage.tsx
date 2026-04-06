import { Link } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function VerifyEmailPage() {
  return (
    <CenteredShell>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '2.5rem' }}>&#9993;</div>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--d-primary)', margin: 0 }}>Verify Your Email</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
          We sent a verification link to your email. Click it to activate your studio account.
        </p>
        <button className="d-interactive" data-variant="ghost" style={{ justifyContent: 'center', margin: '0 auto' }}>Resend Email</button>
        <Link to="/login" style={{ color: 'var(--d-accent)', fontSize: '0.75rem' }}>Back to sign in</Link>
      </div>
    </CenteredShell>
  );
}
