import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { MailCheck } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--d-surface-raised)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
        <MailCheck size={24} style={{ color: 'var(--d-primary)' }} />
      </div>
      <h1 className="serif-display" style={{ fontSize: '1.5rem' }}>Check your email</h1>
      <p style={{ color: 'var(--d-text-muted)' }}>
        We sent a verification link to your inbox. Click it to activate your account.
      </p>
      <div className={css('_flex _col _gap2')} style={{ fontSize: '0.875rem' }}>
        <button className="d-interactive" data-variant="primary" style={{ justifyContent: 'center' }}>
          Resend email
        </button>
        <Link to="/login" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Back to sign in</Link>
      </div>
    </div>
  );
}
