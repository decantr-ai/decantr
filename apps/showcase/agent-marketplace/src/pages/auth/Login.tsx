import { AuthForm } from '../../components/AuthForm';

export function Login() {
  return (
    <AuthForm
      title="Sign in"
      subtitle="Access your agent control center"
      fields={[
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@swarm.ctl' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
      ]}
      submitLabel="Sign in"
      footerText="No account?"
      footerLink={{ label: 'Register', to: '/register' }}
      secondaryLink={{ label: 'Forgot password?', to: '/forgot-password' }}
    />
  );
}
