import { NavLink, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Create your organization"
      subtitle="Start with a free workspace. Invite your team later."
      submitLabel="Create account"
      fields={[
        { name: 'name', label: 'Your name', type: 'text', placeholder: 'Sarah Chen', autoComplete: 'name' },
        { name: 'email', label: 'Work email', type: 'email', placeholder: 'you@company.com', autoComplete: 'email' },
        { name: 'org', label: 'Organization name', type: 'text', placeholder: 'Acme Corp' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'At least 12 characters', autoComplete: 'new-password' },
      ]}
      onSubmit={(data) => { register(data.email || '', data.password || '', data.name || ''); navigate('/overview'); }}
      footer={
        <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Already have an account? <NavLink to="/login" style={{ color: 'var(--d-primary)' }}>Sign in</NavLink>
        </div>
      }
    />
  );
}
