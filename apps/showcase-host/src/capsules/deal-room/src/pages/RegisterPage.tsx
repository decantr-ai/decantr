import { NavLink, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Request Access"
      subtitle="Submit your details for review"
      submitLabel="Submit Request"
      fields={[
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Victoria Ashworth', autoComplete: 'name' },
        { name: 'firm', label: 'Firm', type: 'text', placeholder: 'Meridian Capital Partners' },
        { name: 'email', label: 'Work Email', type: 'email', placeholder: 'you@firm.com', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
      ]}
      onSubmit={(data) => { register(data.email || '', data.password || '', data.name || ''); navigate('/dashboard'); }}
      footer={
        <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Already have access? <NavLink to="/login" style={{ color: 'var(--d-primary)' }}>Sign in</NavLink>
        </div>
      }
    />
  );
}
