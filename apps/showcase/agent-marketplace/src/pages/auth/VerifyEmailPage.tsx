import { AuthForm } from '../../components/AuthForm';

export function VerifyEmailPage() {
  return (
    <AuthForm
      title="Verify Email"
      description="Enter the verification code sent to your email."
      fields={[
        { name: 'code', label: 'Verification Code', type: 'text', placeholder: '000000' },
      ]}
      submitLabel="Verify"
      footerLink={{ text: "Didn't receive a code?", label: 'Resend', to: '/verify-email' }}
    />
  );
}
