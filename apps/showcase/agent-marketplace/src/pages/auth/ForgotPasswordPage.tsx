import { AuthForm } from '../../components/AuthForm';

export function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Forgot Password"
      description="Enter your email to receive a reset link."
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@example.com' },
      ]}
      submitLabel="Send Reset Link"
      footerLink={{ text: 'Remember your password?', label: 'Sign In', to: '/login' }}
    />
  );
}
