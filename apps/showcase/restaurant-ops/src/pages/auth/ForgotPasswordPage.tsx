import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { AuthForm } from '../../components/AuthForm';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent) => { e.preventDefault(); setSent(true); };

  if (sent) {
    return (
      <div className={css('_flex _col _gap3')} style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Check your email</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>We sent a password reset link. It expires in 1 hour.</p>
        <Link to="/login" className="d-interactive" data-variant="primary"
          style={{ justifyContent: 'center', textDecoration: 'none' }}>Back to Sign In</Link>
      </div>
    );
  }

  return (
    <AuthForm
      title="Reset password"
      subtitle="Enter your email and we'll send a reset link."
      fields={[
        { label: 'Email', type: 'email', name: 'email', placeholder: 'you@restaurant.com', autoComplete: 'email' },
      ]}
      cta="Send Reset Link"
      onSubmit={onSubmit}
      footer={
        <p className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
          <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Back to sign in</Link>
        </p>
      }
    />
  );
}
