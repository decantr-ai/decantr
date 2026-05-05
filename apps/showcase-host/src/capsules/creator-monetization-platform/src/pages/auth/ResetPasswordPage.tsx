import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  function onSubmit(e: FormEvent) { e.preventDefault(); navigate('/login'); }
  return (
    <AuthForm title="Choose a new password"
      fields={[
        { label: 'New password', type: 'password', name: 'pw', autoComplete: 'new-password' },
        { label: 'Confirm', type: 'password', name: 'pw2', autoComplete: 'new-password' },
      ]}
      cta="Update password"
      onSubmit={onSubmit}
    />
  );
}
