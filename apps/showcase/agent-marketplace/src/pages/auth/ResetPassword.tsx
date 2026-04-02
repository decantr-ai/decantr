import { AuthForm } from '../../components/AuthForm';

export function ResetPassword() {
  return (
    <AuthForm
      title="Set New Password"
      description="Choose a strong password for your account."
      fields={[
        { name: 'password', label: 'New Password', type: 'password', placeholder: 'Min. 8 characters', required: true },
        { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', required: true },
      ]}
      submitLabel="Update Password"
      footerLinks={[
        { label: 'Back to sign in', to: '/login' },
      ]}
    />
  );
}
