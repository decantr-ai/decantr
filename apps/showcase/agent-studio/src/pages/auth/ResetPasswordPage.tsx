import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function ResetPasswordPage() {
  return (
    <AuthForm
      title="Set new password"
      subtitle="Enter your new password twice"
      submitLabel="Update password"
      redirect="/login"
      fields={[
        { name: 'password', label: 'New password', type: 'password', autoComplete: 'new-password', placeholder: '8+ characters' },
        { name: 'confirm', label: 'Confirm password', type: 'password', autoComplete: 'new-password', placeholder: 'Repeat' },
      ]}
      footer={<AuthFooterLink prompt="Back to" label="Sign in" to="/login" />}
    />
  );
}
