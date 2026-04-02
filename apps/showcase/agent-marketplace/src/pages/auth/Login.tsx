import { AuthForm } from '../../components/AuthForm';

export function Login() {
  return (
    <AuthForm
      title="Sign In"
      description="Access your agent control panel."
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@nexus.ai', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter password', required: true },
      ]}
      submitLabel="Sign In"
      showOAuth
      footerLinks={[
        { label: 'Forgot password?', to: '/forgot-password' },
        { label: "Don't have an account? Register", to: '/register' },
      ]}
    />
  );
}
