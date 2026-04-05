import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/chat');
  };

  return (
    <AuthForm
      title="Create your account"
      subtitle="Start chatting with Carbon in under a minute."
      fields={[
        { id: 'name', label: 'Full name', placeholder: 'Avery Chen', autoComplete: 'name' },
        { id: 'email', label: 'Work email', type: 'email', placeholder: 'you@company.com', autoComplete: 'email' },
        { id: 'password', label: 'Password', type: 'password', placeholder: 'At least 12 characters', autoComplete: 'new-password' },
      ]}
      submitLabel="Create account"
      onSubmit={handleSubmit}
      showOAuth
      footer={<>Already have one? <AuthFooterLink to="/login">Sign in</AuthFooterLink></>}
    />
  );
}
