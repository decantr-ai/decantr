import { AuthForm } from '../../components/AuthForm';

export function RegisterPage() {
  return (
    <AuthForm
      title="Create Account"
      description="Start orchestrating your agent swarm."
      fields={[
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@example.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
        { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password' },
      ]}
      submitLabel="Create Account"
      footerLink={{ text: 'Already have an account?', label: 'Sign In', to: '/login' }}
    />
  );
}
