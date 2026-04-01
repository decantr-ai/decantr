import { AuthForm } from '../components/AuthForm';

export function MfaVerifyPage() {
  return (
    <AuthForm
      title="Two-Factor Verification"
      description="Enter the code from your authenticator app"
      fields={[
        { id: 'mfa-code', label: 'Authentication Code', type: 'text', placeholder: '000000' },
      ]}
      submitLabel="Verify"
      secondaryLink={{ to: '/login', label: 'Use a different method' }}
    />
  );
}
