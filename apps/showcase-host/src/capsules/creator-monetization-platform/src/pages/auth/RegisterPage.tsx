import { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  function onSubmit(e: FormEvent) { e.preventDefault(); login(); navigate('/dashboard'); }
  return (
    <AuthForm title="Create your Canvas" subtitle="Free forever. Cancel anytime."
      fields={[
        { label: 'Name', type: 'text', name: 'name', placeholder: 'Your creative name', autoComplete: 'name' },
        { label: 'Email', type: 'email', name: 'email', autoComplete: 'email' },
        { label: 'Password', type: 'password', name: 'password', autoComplete: 'new-password' },
      ]}
      cta="Create account"
      onSubmit={onSubmit}
      footer={<>Already have an account? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link></>}
    />
  );
}
