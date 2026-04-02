import { AuthForm } from '../../components/AuthForm';

export function ForgotPassword() {
  return (
    <AuthForm
      title="Reset Password"
      description="Enter your email and we'll send you a reset link."
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@nexus.ai', required: true },
      ]}
      submitLabel="Send Reset Link"
      footerLinks={[
        { label: 'Back to sign in', to: '/login' },
      ]}
    />
  );
}
