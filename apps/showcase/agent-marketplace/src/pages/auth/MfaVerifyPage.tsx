import { AuthForm } from '../../components/AuthForm';

export function MfaVerifyPage() {
  return (
    <AuthForm
      title="MFA Verification"
      description="Enter the code from your authenticator app."
      fields={[
        { name: 'code', label: 'Authentication Code', type: 'text', placeholder: '000000' },
      ]}
      submitLabel="Verify"
      secondaryLink={{ label: 'Use backup code', to: '/mfa-verify' }}
    />
  );
}
