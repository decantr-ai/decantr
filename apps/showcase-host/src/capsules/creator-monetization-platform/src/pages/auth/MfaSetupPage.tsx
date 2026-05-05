import { useNavigate } from 'react-router-dom';
import { css } from '@decantr/css';
import { Shield } from 'lucide-react';

export function MfaSetupPage() {
  const navigate = useNavigate();
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <Shield size={24} style={{ color: 'var(--d-primary)', marginBottom: '0.5rem' }} />
        <h1 className="serif-display" style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>Protect your account</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Scan this code with your authenticator app.</p>
      </div>
      <div style={{ width: 160, height: 160, margin: '0 auto', background: 'repeating-conic-gradient(#1C1917 0 25%, #fff 0 50%)', backgroundSize: '16px 16px', borderRadius: 12 }} />
      <label className={css('_flex _col _gap1')}>
        <span className={css('_textsm _fontmedium')}>6-digit code</span>
        <input className="studio-input" type="text" inputMode="numeric" maxLength={6} placeholder="000000" />
      </label>
      <button className="d-interactive studio-glow" data-variant="primary"
        style={{ justifyContent: 'center', padding: '0.625rem 1rem' }}
        onClick={() => navigate('/dashboard')}>Enable 2FA</button>
    </div>
  );
}
