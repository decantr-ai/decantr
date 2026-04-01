import { AuthForm } from '../components/AuthForm';

export function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Reset your password"
      description="Enter your email and we will send you a reset link"
      fields={[
        { id: 'forgot-email', label: 'Email', type: 'email', placeholder: 'you@company.com' },
      ]}
      submitLabel="Send Reset Link"
      footerText="Remember your password?"
      footerLink={{ to: '/login', label: 'Sign in' }}
    />
  );
}
