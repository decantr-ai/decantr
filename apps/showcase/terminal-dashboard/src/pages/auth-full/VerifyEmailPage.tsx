import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem('decantr_authenticated', 'true');
    navigate('/app');
  }

  function handleResend() {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  return (
    <CenteredShell>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
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
          VERIFY EMAIL
        </h1>

        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--d-text-muted)',
            margin: 0,
            textAlign: 'center',
          }}
        >
          A 6-digit verification code has been sent to your terminal.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label
            className="d-label"
            htmlFor="verify-code"
            style={{
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Verification Code
          </label>
          <input
            id="verify-code"
            className="d-control"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: 'var(--d-bg)',
              border: '1px solid var(--d-border)',
              borderRadius: 0,
              color: 'var(--d-text)',
              fontSize: '1.25rem',
              fontFamily: 'inherit',
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '0.5em',
              boxSizing: 'border-box',
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
          {resent ? (
            <span style={{ color: 'var(--d-primary)' }}>Code resent successfully</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
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
              Resend code
            </button>
          )}
        </div>
      </form>
    </CenteredShell>
  );
}
