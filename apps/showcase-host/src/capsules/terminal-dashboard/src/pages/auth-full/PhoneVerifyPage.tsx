import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'var(--d-bg)',
  border: '1px solid var(--d-border)',
  borderRadius: 0,
  color: 'var(--d-text)',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--d-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export function PhoneVerifyPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setCodeSent(true);
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem('decantr_authenticated', 'true');
    navigate('/app');
  }

  return (
    <CenteredShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1
          className="term-glow"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            textAlign: 'center',
            color: 'var(--d-primary)',
            margin: 0,
            letterSpacing: '0.1em',
          }}
        >
          PHONE VERIFY
        </h1>

        {!codeSent ? (
          <form
            onSubmit={handleSendCode}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--d-text-muted)',
                margin: 0,
                textAlign: 'center',
              }}
            >
              Enter your phone number to receive a verification code.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="d-label" htmlFor="phone-number" style={labelStyle}>
                Phone Number
              </label>
              <input
                id="phone-number"
                className="d-control"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              className="d-interactive"
              data-variant="primary"
              style={{
                width: '100%',
                padding: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                borderRadius: 0,
                cursor: 'pointer',
                letterSpacing: '0.05em',
                marginTop: '0.25rem',
              }}
            >
              Send Code
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleVerify}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div
              className="d-annotation"
              data-status="info"
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--d-border)',
                fontSize: '0.75rem',
                color: 'var(--d-text-muted)',
                textAlign: 'center',
              }}
            >
              Code sent to {phone || '+1 (555) 000-0000'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="d-label" htmlFor="phone-code" style={labelStyle}>
                Verification Code
              </label>
              <input
                id="phone-code"
                className="d-control"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={{
                  ...inputStyle,
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  letterSpacing: '0.5em',
                }}
              />
            </div>

            <button
              type="submit"
              className="d-interactive"
              data-variant="primary"
              style={{
                width: '100%',
                padding: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                borderRadius: 0,
                cursor: 'pointer',
                letterSpacing: '0.05em',
                marginTop: '0.25rem',
              }}
            >
              Verify
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCodeSent(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--d-accent)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.75rem',
                  padding: 0,
                }}
              >
                Change phone number
              </button>
            </div>
          </form>
        )}
      </div>
    </CenteredShell>
  );
}
