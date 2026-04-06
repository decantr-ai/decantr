import { NavLink, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export function InvitePage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Accept Invitation"
      subtitle="You have been invited to join a deal room"
      submitLabel="Accept & Create Account"
      fields={[
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', autoComplete: 'name' },
        { name: 'password', label: 'Create Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
      ]}
      onSubmit={(data) => { register('invite@firm.com', data.password || '', data.name || ''); navigate('/dashboard'); }}
      footer={
        <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
          Already have an account? <NavLink to="/login" style={{ color: 'var(--d-primary)' }}>Sign in</NavLink>
        </div>
      }
    />
  );
}
