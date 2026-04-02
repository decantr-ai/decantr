import { AuthForm } from '../../components/AuthForm';

export function ResetPasswordPage() {
  return (
    <AuthForm
      title="Reset Password"
      description="Enter your new password."
      fields={[
        { name: 'password', label: 'New Password', type: 'password', placeholder: 'Enter new password' },
        { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat new password' },
      ]}
      submitLabel="Reset Password"
      footerLink={{ text: 'Back to', label: 'Sign In', to: '/login' }}
    />
  );
}
