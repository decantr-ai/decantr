import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Set new password"
      subtitle="Choose a strong password. Min 12 characters."
      submitLabel="Update password"
      onSubmit={() => navigate('/login')}
      fields={[
        { name: 'password', label: 'New password', type: 'password', autoComplete: 'new-password' },
        { name: 'confirm', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
      ]}
    />
  );
}
