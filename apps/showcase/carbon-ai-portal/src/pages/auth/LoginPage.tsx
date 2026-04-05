import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/chat');
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to continue your conversation."
      fields={[
        { id: 'email', label: 'Email', type: 'email', placeholder: 'you@company.com', autoComplete: 'email' },
        { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'current-password' },
      ]}
      submitLabel="Sign in"
      onSubmit={handleSubmit}
      showOAuth
      footer={
        <>
          <AuthFooterLink to="/forgot-password">Forgot password?</AuthFooterLink>
          <span style={{ margin: '0 0.5rem' }}>·</span>
          New here? <AuthFooterLink to="/register">Create an account</AuthFooterLink>
        </>
      }
    />
  );
}
