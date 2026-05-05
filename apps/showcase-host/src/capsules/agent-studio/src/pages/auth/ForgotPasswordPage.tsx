import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Reset password"
      subtitle="We'll send a reset link to your email"
      submitLabel="Send reset link"
      redirect="/reset-password"
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'you@company.com' },
      ]}
      footer={<AuthFooterLink prompt="Remember it?" label="Sign in" to="/login" />}
    />
  );
}
