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
    navigate('/floor');
  };
  return (
    <AuthForm
      title="Create your account"
      subtitle="Get your restaurant running on Tavola."
      fields={[
        { label: 'Restaurant Name', type: 'text', name: 'restaurant', placeholder: 'The Golden Fork' },
        { label: 'Your Name', type: 'text', name: 'name', placeholder: 'Chef Maria', autoComplete: 'name' },
        { label: 'Email', type: 'email', name: 'email', placeholder: 'you@restaurant.com', autoComplete: 'email' },
        { label: 'Password', type: 'password', name: 'password', autoComplete: 'new-password' },
      ]}
      cta="Create Account"
      onSubmit={onSubmit}
      footer={
        <p className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      }
    />
  );
}
