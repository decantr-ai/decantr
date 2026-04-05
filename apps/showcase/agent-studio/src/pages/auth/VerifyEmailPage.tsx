import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function VerifyEmailPage() {
  return (
    <AuthForm
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to you@company.com"
      submitLabel="Verify"
      redirect="/mfa-setup"
      fields={[
        { name: 'code', label: 'Verification code', type: 'text', placeholder: '000000' },
      ]}
      footer={<AuthFooterLink prompt="Didn't get it?" label="Resend" to="/verify-email" />}
    />
  );
}
