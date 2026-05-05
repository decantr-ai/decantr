import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function MfaVerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const complete = code.every(d => d);

  function setAt(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  }

  return (
    <form onSubmit={e => { e.preventDefault(); if (complete) navigate('/browse'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 9999, background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', color: 'var(--d-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
        <ShieldCheck size={24} />
      </div>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.375rem' }}>Enter verification code</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Six-digit code from your authenticator app</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {code.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            className="nm-input"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => setAt(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus(); }}
            style={{ width: 44, textAlign: 'center', fontSize: '1.25rem', fontWeight: 600, padding: '0.625rem 0' }}
          />
        ))}
      </div>
      <button type="submit" className="nm-button-primary" disabled={!complete} style={{ width: '100%', padding: '0.75rem' }}>
        Verify
      </button>
    </form>
  );
}
