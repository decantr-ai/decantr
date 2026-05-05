import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Create your workspace"
      subtitle="Free for 30 days. No credit card."
      submitLabel="Create account"
      onSubmit={() => { register('test@test.io', 'pw', 'User'); navigate('/verify-email'); }}
      fields={[
        { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
        { name: 'email', label: 'Work email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
      ]}
      altLinks={[{ label: 'Already have an account?', to: '/login' }]}
    />
  );
}
