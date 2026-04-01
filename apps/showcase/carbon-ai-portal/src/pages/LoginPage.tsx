import { AuthForm } from '../components/AuthForm';

export function LoginPage() {
  return (
    <AuthForm
      title="Welcome back"
      description="Sign in to your Carbon AI account"
      fields={[
        { id: 'login-email', label: 'Email', type: 'email', placeholder: 'you@company.com' },
        { id: 'login-password', label: 'Password', type: 'password', placeholder: 'Your password' },
      ]}
      submitLabel="Sign In"
      secondaryLink={{ to: '/forgot-password', label: 'Forgot your password?' }}
      footerText="Don't have an account?"
      footerLink={{ to: '/register', label: 'Create one' }}
    />
  );
}
