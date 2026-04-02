import { AuthForm } from '../../components/AuthForm';

export function VerifyEmail() {
  return (
    <AuthForm
      title="Verify Email"
      description="Enter the 6-digit verification code sent to your email."
      fields={[
        { name: 'code', label: 'Verification Code', type: 'text', placeholder: '000000', required: true },
      ]}
      submitLabel="Verify"
      footerLinks={[
        { label: "Didn't receive a code? Resend", to: '/verify-email' },
        { label: 'Back to sign in', to: '/login' },
      ]}
    />
  );
}
