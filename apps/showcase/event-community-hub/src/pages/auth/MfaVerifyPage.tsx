import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthForm } from '../../components/AuthForm';

export function MfaVerifyPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login();
    navigate('/events');
  };
  return (
    <AuthForm
      title="Two-factor"
      subtitle="Enter the 6-digit code from your authenticator app."
      fields={[{ label: 'Code', type: 'text', name: 'code', placeholder: '000000' }]}
      cta="Verify & Sign In"
      onSubmit={onSubmit}
    />
  );
}
