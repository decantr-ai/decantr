import { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { ShieldCheck } from 'lucide-react';
import { AuthForm } from '../../components/AuthForm';

export function MfaSetupPage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/events');
  };
  return (
    <div className={css('_flex _col _gap4')}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '0.875rem', borderRadius: '50%', background: 'linear-gradient(135deg, var(--d-secondary), var(--d-primary))', marginBottom: '0.75rem' }}>
          <ShieldCheck size={24} color="#000" />
        </div>
      </div>
      <AuthForm
        title="Lock it down"
        subtitle="Scan the QR code in your authenticator app, then enter the code below."
        fields={[{ label: 'Authenticator code', type: 'text', name: 'code', placeholder: '6-digit code' }]}
        cta="Enable MFA"
        onSubmit={onSubmit}
        footer={
          <div className={css('_textsm')} style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <Link to="/events" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Skip for now</Link>
          </div>
        }
      />
    </div>
  );
}
