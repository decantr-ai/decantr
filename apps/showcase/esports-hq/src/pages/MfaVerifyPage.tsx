import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function MfaVerifyPage() {
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerify = () => {
    login('mfa@team.gg', 'mfa');
    navigate('/team');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <Shield size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Verify 2FA Code</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Enter the 6-digit code from your authenticator app.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Verification Code</label>
        <input
          className="d-control"
          type="text"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          style={{ textAlign: 'center', letterSpacing: '0.5em', fontFamily: 'var(--d-font-mono, monospace)', fontSize: '1.25rem' }}
        />
      </div>
      <button className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleVerify}>
        Verify
      </button>
    </div>
  );
}
