import { useNavigate } from 'react-router-dom';
import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function PhoneVerifyPage() {
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/chat');
  };
  return (
    <AuthForm
      title="Verify your phone"
      subtitle="We sent a code to the number ending in 4821."
      fields={[{ id: 'code', label: 'SMS code', placeholder: '000000', autoComplete: 'one-time-code' }]}
      submitLabel="Verify phone"
      onSubmit={handleSubmit}
      footer={<AuthFooterLink to="/mfa-verify">Use authenticator app instead</AuthFooterLink>}
    />
  );
}
