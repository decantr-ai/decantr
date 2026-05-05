import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { AuthForm } from '../../components/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login();
    navigate('/recipes');
  };
  return (
    <AuthForm
      title="Create your account"
      subtitle="Free forever. No credit card."
      fields={[
        { label: 'Name', type: 'text', name: 'name', placeholder: 'Sage Laurent', autoComplete: 'name' },
        { label: 'Email', type: 'email', name: 'email', placeholder: 'you@kitchen.com', autoComplete: 'email' },
        { label: 'Password', type: 'password', name: 'password', autoComplete: 'new-password' },
      ]}
      cta="Join Gather"
      onSubmit={onSubmit}
      footer={
        <p style={{ textAlign: 'center', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem' }}>
          Already cooking with us? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      }
    />
  );
}
