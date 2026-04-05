import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function MfaVerifyPage() {
  return (
    <AuthForm
      title="MFA required"
      subtitle="Enter the code from your authenticator app"
      submitLabel="Verify"
      redirect="/agents"
      fields={[
        { name: 'code', label: 'Authenticator code', type: 'text', placeholder: '000000' },
      ]}
      footer={<AuthFooterLink prompt="Lost access?" label="Use backup code" to="/phone-verify" />}
    />
  );
}
