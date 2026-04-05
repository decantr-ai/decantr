import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { css } from '@decantr/css';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  return (
    <div className={css('_flex _col _aic _gap4')} style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #FED7AA, #FDBA74)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Mail size={24} style={{ color: '#9A3412' }} />
      </div>
      <div>
        <h1 className="serif-display" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Check your email</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem', maxWidth: 340 }}>
          We sent a verification link to your inbox. Open it to confirm your account.
        </p>
      </div>
      <button className="d-interactive" data-variant="ghost" onClick={() => navigate('/dashboard')}
        style={{ fontSize: '0.875rem' }}>I've verified →</button>
    </div>
  );
}
