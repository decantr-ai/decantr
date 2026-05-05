import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Mail } from 'lucide-react';
import { AuthForm } from '../../components/AuthForm';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/mfa-setup');
  };
  return (
    <div className={css('_flex _col _gap4')}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '0.875rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--d-primary), #7a00ff)', marginBottom: '0.75rem' }}>
          <Mail size={24} color="#fff" />
        </div>
      </div>
      <AuthForm
        title="Check your inbox"
        subtitle="We sent a code to verify your email. Drop it here to continue."
        fields={[{ label: 'Verification code', type: 'text', name: 'code', placeholder: '6-digit code' }]}
        cta="Verify Email"
        onSubmit={onSubmit}
      />
    </div>
  );
}
