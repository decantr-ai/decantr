import { AuthForm, FormField, AuthLink } from '../../components/AuthForm';

export function ForgotPassword() {
  return (
    <AuthForm
      title="Forgot Password"
      description="Enter your email and we'll send a reset link."
      submitLabel="Send Reset Link"
      footer={
        <>
          Remember your password?{' '}
          <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <FormField label="Email" type="email" placeholder="operator@nexus.ai" />
    </AuthForm>
  );
}
