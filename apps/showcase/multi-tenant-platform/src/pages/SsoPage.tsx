import { NavLink, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export function SsoPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Sign in with SSO"
      subtitle="Enter your organization's domain to continue."
      submitLabel="Continue"
      fields={[
        { name: 'domain', label: 'Organization domain', type: 'text', placeholder: 'acmecorp.io' },
      ]}
      onSubmit={(data) => { login(data.domain || '', ''); navigate('/overview'); }}
      footer={
        <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          <NavLink to="/login" style={{ color: 'var(--d-primary)' }}>Use password instead</NavLink>
        </div>
      }
    />
  );
}
