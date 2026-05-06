import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/reset-password');
  };
  return (
    <AuthForm
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
      fields={[{ label: 'Email', type: 'email', name: 'email', placeholder: 'you@kitchen.com', autoComplete: 'email' }]}
      cta="Send reset link"
      onSubmit={onSubmit}
      footer={
        <p style={{ textAlign: 'center', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem' }}>
          Remembered it? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      }
    />
  );
}
