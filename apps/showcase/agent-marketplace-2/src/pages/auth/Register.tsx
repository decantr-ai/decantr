import { AuthForm, FormField, AuthLink, OAuthButtons } from '../../components/AuthForm';

export function Register() {
  return (
    <AuthForm
      title="Create Account"
      description="Deploy your first agent swarm in minutes."
      submitLabel="Create Account"
      footer={
        <>
          Already have an account?{' '}
          <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <FormField label="Full Name" placeholder="Jane Operator" />
      <FormField label="Email" type="email" placeholder="operator@nexus.ai" />
      <FormField label="Password" type="password" placeholder="Create a strong password" />
      <FormField label="Confirm Password" type="password" placeholder="Repeat password" />
      <OAuthButtons />
    </AuthForm>
  );
}
