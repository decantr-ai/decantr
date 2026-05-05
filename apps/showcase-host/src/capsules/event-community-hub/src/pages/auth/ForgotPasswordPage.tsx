import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { AuthForm } from '../../components/AuthForm';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/reset-password');
  };
  return (
    <AuthForm
      title="Forgot password?"
      subtitle="We'll send you a reset link. Back in the party in a minute."
      fields={[{ label: 'Email', type: 'email', name: 'email', placeholder: 'you@pulse.events', autoComplete: 'email' }]}
      cta="Send Reset Link"
      onSubmit={onSubmit}
      footer={
        <div className={css('_textsm')} style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>← Back to sign in</Link>
        </div>
      }
    />
  );
}
