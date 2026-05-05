import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

export function PhoneVerifyPage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/events');
  };
  return (
    <AuthForm
      title="Verify your phone"
      subtitle="We'll text you a code. Keeps ticket resales safe."
      fields={[{ label: 'Verification code', type: 'text', name: 'code', placeholder: '6-digit code' }]}
      cta="Verify Phone"
      onSubmit={onSubmit}
    />
  );
}
