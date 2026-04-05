import { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  function onSubmit(e: FormEvent) { e.preventDefault(); navigate('/reset-password'); }
  return (
    <AuthForm title="Reset your password" subtitle="We'll email you a reset link."
      fields={[{ label: 'Email', type: 'email', name: 'email', autoComplete: 'email' }]}
      cta="Email me a link"
      onSubmit={onSubmit}
      footer={<Link to="/login" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>← Back to sign in</Link>}
    />
  );
}
