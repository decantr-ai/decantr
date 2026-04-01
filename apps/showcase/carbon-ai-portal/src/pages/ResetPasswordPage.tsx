import { AuthForm } from '../components/AuthForm';

export function ResetPasswordPage() {
  return (
    <AuthForm
      title="Set new password"
      description="Choose a strong password for your account"
      fields={[
        { id: 'reset-password', label: 'New Password', type: 'password', placeholder: 'New password' },
        { id: 'reset-confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat new password' },
      ]}
      submitLabel="Update Password"
      footerText="Back to"
      footerLink={{ to: '/login', label: 'sign in' }}
    />
  );
}
