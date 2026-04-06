import { NavLink, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export function SsoPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="SSO Login"
      subtitle="Enter your corporate email to authenticate via your identity provider"
      submitLabel="Continue with SSO"
      fields={[
        { name: 'email', label: 'Corporate Email', type: 'email', placeholder: 'you@firm.com', autoComplete: 'email' },
      ]}
      onSubmit={(data) => { login(data.email || '', ''); navigate('/dashboard'); }}
      footer={
        <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Use password instead? <NavLink to="/login" style={{ color: 'var(--d-primary)' }}>Sign in</NavLink>
        </div>
      }
    />
  );
}
