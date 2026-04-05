import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export function InvitePage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Join Acme Corp"
      subtitle="You've been invited by Sarah Chen as a developer."
      submitLabel="Accept invitation"
      fields={[
        { name: 'name', label: 'Your name', type: 'text', placeholder: 'Your full name', autoComplete: 'name' },
        { name: 'password', label: 'Choose a password', type: 'password', placeholder: 'At least 12 characters', autoComplete: 'new-password' },
      ]}
      onSubmit={(data) => { register('', data.password || '', data.name || ''); navigate('/overview'); }}
      extras={
        <div className="d-annotation" data-status="info" style={{ alignSelf: 'flex-start' }}>
          Invitation expires in 6 days
        </div>
      }
    />
  );
}
