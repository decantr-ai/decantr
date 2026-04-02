import { AuthForm } from '../../components/AuthForm';

export function ResetPassword() {
  return (
    <AuthForm
      title="Set New Password"
      subtitle="Choose a new password for your account"
      fields={[
        { name: 'password', label: 'New Password', type: 'password', placeholder: '••••••••' },
        { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
      ]}
      submitLabel="Reset Password"
      secondaryLink={{ label: 'Back to sign in', to: '/login' }}
    />
  );
}
