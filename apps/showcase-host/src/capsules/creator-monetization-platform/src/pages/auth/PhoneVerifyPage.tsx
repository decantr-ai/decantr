import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

export function PhoneVerifyPage() {
  const navigate = useNavigate();
  function onSubmit(e: FormEvent) { e.preventDefault(); navigate('/dashboard'); }
  return (
    <AuthForm title="Verify your phone" subtitle="We'll text you a one-time code."
      fields={[
        { label: 'Phone number', type: 'tel', name: 'phone', placeholder: '+1 555 000 0000', autoComplete: 'tel' },
      ]}
      cta="Send code"
      onSubmit={onSubmit}
    />
  );
}
