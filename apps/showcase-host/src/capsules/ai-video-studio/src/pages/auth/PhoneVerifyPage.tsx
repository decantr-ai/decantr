import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Smartphone } from 'lucide-react';

export function PhoneVerifyPage() {
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('phone@studio.ai', 'phone');
    navigate('/projects');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Smartphone size={24} style={{ color: 'var(--d-primary)' }} />
      </div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Phone verification</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Enter the code sent to your phone</p>
      <input
        className="d-control"
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="000000"
        maxLength={6}
        style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.5rem', fontFamily: "'JetBrains Mono', monospace" }}
      />
      <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
        Verify
      </button>
    </form>
  );
}
