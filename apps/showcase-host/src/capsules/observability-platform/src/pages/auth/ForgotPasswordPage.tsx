import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Reset your password"
      subtitle="We'll send a reset link to your email."
      submitLabel="Send reset link"
      onSubmit={() => navigate('/reset-password')}
      fields={[{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email' }]}
      altLinks={[{ label: 'Back to sign in', to: '/login' }]}
    />
  );
}
