import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';

export function PhoneVerifyPage() {
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Verify phone number"
      subtitle="We'll text you a 6-digit code."
      submitLabel="Send SMS"
      onSubmit={() => navigate('/mfa-verify')}
      fields={[{ name: 'phone', label: 'Phone number', type: 'tel', placeholder: '+1 555 000 0000' }]}
      altLinks={[{ label: 'Back to sign in', to: '/login' }]}
    />
  );
}
