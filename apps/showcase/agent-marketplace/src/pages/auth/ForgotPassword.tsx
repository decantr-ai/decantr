import { AuthForm } from '../../components/AuthForm';

export function ForgotPassword() {
  return (
    <AuthForm
      title="Reset Password"
      subtitle="Enter your email to receive a reset link"
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@swarm.ctl' },
      ]}
      submitLabel="Send Reset Link"
      footerText="Remember your password?"
      footerLink={{ label: 'Sign in', to: '/login' }}
    />
  );
}
