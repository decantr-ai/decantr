import { AuthForm } from '../../components/AuthForm';

export function Register() {
  return (
    <AuthForm
      title="Create Account"
      description="Start orchestrating your AI agent swarm."
      fields={[
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Agent Operator', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'operator@nexus.ai', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters', required: true },
        { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', required: true },
      ]}
      submitLabel="Create Account"
      showOAuth
      footerLinks={[
        { label: 'Already have an account? Sign in', to: '/login' },
      ]}
    />
  );
}
