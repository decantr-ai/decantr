import { AuthForm } from '../components/AuthForm';

export function VerifyEmailPage() {
  return (
    <AuthForm
      title="Verify your email"
      description="Enter the 6-digit code we sent to your inbox"
      fields={[
        { id: 'verify-code', label: 'Verification Code', type: 'text', placeholder: '000000' },
      ]}
      submitLabel="Verify Email"
      secondaryLink={{ to: '/login', label: 'Back to sign in' }}
    />
  );
}
