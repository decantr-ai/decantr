import { AuthForm, FormField, AuthLink } from '../../components/AuthForm';

export function MfaVerify() {
  return (
    <AuthForm
      title="Verify Identity"
      description="Enter the code from your authenticator app."
      submitLabel="Verify"
      footer={
        <>
          Lost your device?{' '}
          <AuthLink to="/forgot-password">Use recovery code</AuthLink>
        </>
      }
    >
      <FormField label="Authentication Code" placeholder="Enter 6-digit code" />
    </AuthForm>
  );
}
