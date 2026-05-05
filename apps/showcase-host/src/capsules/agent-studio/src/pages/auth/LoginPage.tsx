import { AuthForm, AuthFooterLink, OAuthDivider, OAuthButtons } from '@/components/AuthForm';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <>
      <AuthForm
        mode="login"
        title="Sign in"
        subtitle="Continue to your workspace"
        submitLabel="Sign in"
        fields={[
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'you@company.com' },
          { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password', placeholder: '••••••••' },
        ]}
        footer={<AuthFooterLink prompt="No account?" label="Create one" to="/register" />}
      />
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.78rem' }}>
        <Link to="/forgot-password" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Forgot password?</Link>
      </div>
      <OAuthDivider />
      <OAuthButtons />
    </>
  );
}
