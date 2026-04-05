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
    navigate('/events');
  };
  return (
    <AuthForm
      title="Join the party"
      subtitle="Find your people. Always free."
      fields={[
        { label: 'Name', type: 'text', name: 'name', placeholder: 'Juno Rivers', autoComplete: 'name' },
        { label: 'Email', type: 'email', name: 'email', placeholder: 'you@pulse.events', autoComplete: 'email' },
        { label: 'Password', type: 'password', name: 'password', autoComplete: 'new-password' },
      ]}
      cta="Create Account"
      onSubmit={onSubmit}
      footer={
        <div className={css('_flex _col _gap2')} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--d-text-muted)' }}>
            Already here? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Sign in</Link>
          </span>
        </div>
      }
    />
  );
}
