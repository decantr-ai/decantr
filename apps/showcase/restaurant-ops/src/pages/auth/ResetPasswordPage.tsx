import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => { e.preventDefault(); navigate('/login'); };
  return (
    <AuthForm
      title="Set new password"
      subtitle="Choose a strong password for your account."
      fields={[
        { label: 'New Password', type: 'password', name: 'password', autoComplete: 'new-password' },
        { label: 'Confirm Password', type: 'password', name: 'confirm', autoComplete: 'new-password' },
      ]}
      cta="Update Password"
      onSubmit={onSubmit}
    />
  );
}
