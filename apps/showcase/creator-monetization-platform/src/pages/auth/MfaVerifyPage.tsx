import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

export function MfaVerifyPage() {
  const navigate = useNavigate();
  function onSubmit(e: FormEvent) { e.preventDefault(); navigate('/dashboard'); }
  return (
    <AuthForm title="Enter your 2FA code" subtitle="From your authenticator app"
      fields={[{ label: '6-digit code', type: 'text', name: 'code', placeholder: '000000' }]}
      cta="Verify"
      onSubmit={onSubmit}
    />
  );
}
