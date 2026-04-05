import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';

export function MfaVerifyPage() {
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Enter verification code"
      subtitle="Open your authenticator app and enter the 6-digit code."
      submitLabel="Verify"
      onSubmit={() => navigate('/metrics')}
      fields={[{ name: 'code', label: 'Code', type: 'text', placeholder: '000 000' }]}
      altLinks={[{ label: 'Use backup code', to: '/phone-verify' }]}
    />
  );
}
