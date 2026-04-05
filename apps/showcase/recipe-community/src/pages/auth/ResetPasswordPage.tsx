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
      title="Choose a new password"
      subtitle="Make it one you'll actually remember."
      fields={[
        { label: 'New password', type: 'password', name: 'password', autoComplete: 'new-password' },
        { label: 'Confirm', type: 'password', name: 'confirm', autoComplete: 'new-password' },
      ]}
      cta="Save password"
      onSubmit={onSubmit}
    />
  );
}
