import { AuthForm, AuthFooterLink, OAuthDivider, OAuthButtons } from '@/components/AuthForm';

export function RegisterPage() {
  return (
    <>
      <AuthForm
        mode="register"
        title="Create account"
        subtitle="Start building agents in seconds"
        submitLabel="Create account"
        fields={[
          { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Kaito Rivera' },
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'you@company.com' },
          { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password', placeholder: '8+ characters' },
        ]}
        footer={<AuthFooterLink prompt="Already have an account?" label="Sign in" to="/login" />}
      />
      <OAuthDivider />
      <OAuthButtons />
    </>
  );
}
