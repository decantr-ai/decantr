import { NavLink, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Key } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your organization"
      submitLabel="Sign in"
      fields={[
        { name: 'email', label: 'Work email', type: 'email', placeholder: 'you@company.com', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'current-password' },
      ]}
      onSubmit={(data) => { login(data.email || '', data.password || ''); navigate('/overview'); }}
      extras={
        <NavLink to="/sso" className="d-interactive" data-variant="ghost" style={{ justifyContent: 'center', fontSize: '0.8rem', textDecoration: 'none' }}>
          <Key size={14} /> Continue with SSO
        </NavLink>
      }
      footer={
        <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Don't have an account? <NavLink to="/register" style={{ color: 'var(--d-primary)' }}>Create one</NavLink>
        </div>
      }
    />
  );
}
