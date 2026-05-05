import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };
  return (
    <AuthForm
      title="Pick a new password"
      subtitle="Make it strong. Make it yours."
      fields={[
        { label: 'New password', type: 'password', name: 'password', autoComplete: 'new-password' },
        { label: 'Confirm password', type: 'password', name: 'confirm', autoComplete: 'new-password' },
      ]}
      cta="Reset Password"
      onSubmit={onSubmit}
    />
  );
}
