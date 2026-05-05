import { useNavigate } from 'react-router-dom';
import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/chat');
  };
  return (
    <AuthForm
      title="Verify your email"
      subtitle="We sent a 6-digit code to avery@carbonlabs.ai."
      fields={[{ id: 'code', label: 'Verification code', placeholder: '000000', autoComplete: 'one-time-code' }]}
      submitLabel="Verify email"
      onSubmit={handleSubmit}
      footer={<AuthFooterLink to="/login">Use a different email</AuthFooterLink>}
    />
  );
}
