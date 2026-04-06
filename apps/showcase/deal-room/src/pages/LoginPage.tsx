import { NavLink, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Key } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Investor Login"
      subtitle="Access your deal room securely"
      submitLabel="Sign In"
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'you@firm.com', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'current-password' },
      ]}
      onSubmit={(data) => { login(data.email || '', data.password || ''); navigate('/dashboard'); }}
      extras={
        <NavLink to="/sso" className="d-interactive" data-variant="ghost" style={{ justifyContent: 'center', fontSize: '0.8rem', textDecoration: 'none' }}>
          <Key size={14} /> Continue with SSO
        </NavLink>
      }
      footer={
        <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Need access? <NavLink to="/register" style={{ color: 'var(--d-primary)' }}>Request an invitation</NavLink>
        </div>
      }
    />
  );
}
