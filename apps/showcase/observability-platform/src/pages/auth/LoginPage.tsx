import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Sign in"
      subtitle="Access your observability workspace"
      submitLabel="Sign in"
      onSubmit={() => { login('test@test.io', 'pw'); navigate('/metrics'); }}
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'nadia@acmecorp.io' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
      ]}
      altLinks={[
        { label: 'Forgot password?', to: '/forgot-password' },
        { label: 'Create account', to: '/register' },
      ]}
    />
  );
}
