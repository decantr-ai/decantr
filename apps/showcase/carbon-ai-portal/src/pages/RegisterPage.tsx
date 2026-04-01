import { AuthForm } from '../components/AuthForm';

export function RegisterPage() {
  return (
    <AuthForm
      title="Create your account"
      description="Get started with Carbon AI in seconds"
      fields={[
        { id: 'reg-name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
        { id: 'reg-email', label: 'Email', type: 'email', placeholder: 'you@company.com' },
        { id: 'reg-password', label: 'Password', type: 'password', placeholder: 'Choose a strong password' },
        { id: 'reg-confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
      ]}
      submitLabel="Create Account"
      footerText="Already have an account?"
      footerLink={{ to: '/login', label: 'Sign in' }}
    />
  );
}
