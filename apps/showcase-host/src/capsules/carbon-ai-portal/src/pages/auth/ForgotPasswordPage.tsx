import { useNavigate } from 'react-router-dom';
import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/reset-password');
  };
  return (
    <AuthForm
      title="Reset your password"
      subtitle="Enter your email and we will send you a reset link."
      fields={[{ id: 'email', label: 'Email', type: 'email', placeholder: 'you@company.com', autoComplete: 'email' }]}
      submitLabel="Send reset link"
      onSubmit={handleSubmit}
      footer={<>Remembered it? <AuthFooterLink to="/login">Sign in</AuthFooterLink></>}
    />
  );
}
