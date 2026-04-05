import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';
import { useAuth } from '@/hooks/useAuth';

export function PhoneVerifyPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('+1 415 555 0199');
  const [sent, setSent] = useState(false);

  return (
    <CenteredShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="term-glow" style={{ fontSize: '1rem', textAlign: 'center', color: 'var(--d-primary)', margin: 0 }}>
          $ PHONE_VERIFY
        </h1>
        {!sent ? (
          <>
            <label className="d-label">PHONE NUMBER</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', color: 'var(--d-text)', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none' }}
            />
            <button onClick={() => setSent(true)} className="d-interactive" data-variant="primary" style={{ padding: '0.5rem', borderRadius: 0 }}>
              Send SMS Code
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textAlign: 'center' }}>
              Code sent to {phone}
            </p>
            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input key={i} maxLength={1} style={{ width: '2rem', height: '2.5rem', textAlign: 'center', background: 'var(--d-bg)', border: '1px solid var(--d-border)', color: 'var(--d-primary)', fontFamily: 'inherit', fontSize: '1rem', outline: 'none' }} />
              ))}
            </div>
            <button onClick={() => { login(); navigate('/pipelines'); }} className="d-interactive" data-variant="primary" style={{ padding: '0.5rem', borderRadius: 0 }}>
              Verify
            </button>
          </>
        )}
      </div>
    </CenteredShell>
  );
}
