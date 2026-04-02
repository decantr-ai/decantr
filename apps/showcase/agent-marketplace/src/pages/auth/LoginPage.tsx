import { AuthForm } from '../../components/AuthForm';

export function LoginPage() {
  return (
    <AuthForm
      title="Sign In"
      description="Enter your credentials to access the dashboard."
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@example.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' },
      ]}
      submitLabel="Sign In"
      secondaryLink={{ label: 'Forgot password?', to: '/forgot-password' }}
      footerLink={{ text: "Don't have an account?", label: 'Register', to: '/register' }}
    />
  );
}
