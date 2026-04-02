import { AuthForm } from '../../components/AuthForm';

export function Register() {
  return (
    <AuthForm
      title="Create Account"
      subtitle="Join the swarm network"
      fields={[
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Operator' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@swarm.ctl' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
        { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
      ]}
      submitLabel="Create Account"
      footerText="Already have an account?"
      footerLink={{ label: 'Sign in', to: '/login' }}
    />
  );
}
