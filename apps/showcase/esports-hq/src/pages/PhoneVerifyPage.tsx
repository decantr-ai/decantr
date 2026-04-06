import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function PhoneVerifyPage() {
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerify = () => {
    login('phone@team.gg', 'phone');
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
          <Phone size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Verify Phone Number</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Enter the code sent to your phone.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>SMS Code</label>
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
        Verify Phone
      </button>
      <button className="d-interactive" data-variant="ghost" style={{ width: '100%', justifyContent: 'center' }}>
        Resend Code
      </button>
    </div>
  );
}
