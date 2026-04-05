import { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  function onSubmit(e: FormEvent) { e.preventDefault(); login(); navigate('/dashboard'); }
  return (
    <AuthForm title="Welcome back" subtitle="Sign in to your Canvas"
      fields={[
        { label: 'Email', type: 'email', name: 'email', placeholder: 'you@studio.com', autoComplete: 'email' },
        { label: 'Password', type: 'password', name: 'password', autoComplete: 'current-password' },
      ]}
      cta="Sign in"
      onSubmit={onSubmit}
      footer={<>New here? <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link> · <Link to="/forgot-password" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Forgot?</Link></>}
    />
  );
}
