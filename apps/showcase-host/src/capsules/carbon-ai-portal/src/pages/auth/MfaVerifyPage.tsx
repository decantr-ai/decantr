import { useNavigate } from 'react-router-dom';
import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function MfaVerifyPage() {
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/chat');
  };
  return (
    <AuthForm
      title="Two-factor verification"
      subtitle="Enter the 6-digit code from your authenticator app."
      fields={[{ id: 'code', label: 'Authentication code', placeholder: '000000', autoComplete: 'one-time-code' }]}
      submitLabel="Verify"
      onSubmit={handleSubmit}
      footer={<AuthFooterLink to="/phone-verify">Use SMS instead</AuthFooterLink>}
    />
  );
}
