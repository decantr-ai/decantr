import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  return (
    <div className={css('_flex _col _aic _gap3')} style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <Mail size={40} style={{ color: 'var(--d-primary)' }} />
      <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Verify your email</h1>
      <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', maxWidth: 300, lineHeight: 1.6 }}>
        We sent a verification link to your email. Click it to activate your account.
      </p>
      <button className="d-interactive" style={{ fontSize: '0.875rem' }}>Resend email</button>
      <Link to="/login" className={css('_textsm')} style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>
        Back to sign in
      </Link>
    </div>
  );
}
