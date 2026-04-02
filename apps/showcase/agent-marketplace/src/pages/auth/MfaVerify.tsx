import { AuthForm } from '../../components/AuthForm';

export function MfaVerify() {
  return (
    <AuthForm
      title="Two-Factor Authentication"
      description="Enter the 6-digit code from your authenticator app."
      fields={[
        { name: 'code', label: 'Authentication Code', type: 'text', placeholder: '000000', required: true },
      ]}
      submitLabel="Verify"
      footerLinks={[
        { label: 'Use a recovery code instead', to: '/login' },
        { label: 'Back to sign in', to: '/login' },
      ]}
    />
  );
}
