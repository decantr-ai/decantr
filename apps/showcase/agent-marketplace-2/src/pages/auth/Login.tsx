import { AuthForm, FormField, AuthLink, OAuthButtons } from '../../components/AuthForm';

export function Login() {
  return (
    <AuthForm
      title="Sign In"
      description="Access your agent control center."
      submitLabel="Sign In"
      footer={
        <>
          Don't have an account?{' '}
          <AuthLink to="/register">Create one</AuthLink>
        </>
      }
    >
      <FormField label="Email" type="email" placeholder="operator@nexus.ai" />
      <FormField label="Password" type="password" placeholder="Enter password" />
      <div style={{ textAlign: 'right' }}>
        <AuthLink to="/forgot-password">Forgot password?</AuthLink>
      </div>
      <OAuthButtons />
    </AuthForm>
  );
}
