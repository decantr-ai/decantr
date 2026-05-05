import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { AuthForm } from '../../components/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login();
    navigate('/events');
  };
  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in and jump back into the party."
      fields={[
        { label: 'Email', type: 'email', name: 'email', placeholder: 'you@pulse.events', autoComplete: 'email' },
        { label: 'Password', type: 'password', name: 'password', autoComplete: 'current-password' },
      ]}
      cta="Sign In"
      onSubmit={onSubmit}
      footer={
        <div className={css('_flex _col _gap2')} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem', textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Forgot password?</Link>
          <span style={{ color: 'var(--d-text-muted)' }}>
            New to Pulse? <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Join free</Link>
          </span>
        </div>
      }
    />
  );
}
