import { useNavigate } from 'react-router-dom';
import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };
  return (
    <AuthForm
      title="Choose a new password"
      subtitle="Pick something strong that you will remember."
      fields={[
        { id: 'password', label: 'New password', type: 'password', placeholder: 'At least 12 characters', autoComplete: 'new-password' },
        { id: 'confirm', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
      ]}
      submitLabel="Update password"
      onSubmit={handleSubmit}
      footer={<AuthFooterLink to="/login">Back to sign in</AuthFooterLink>}
    />
  );
}
