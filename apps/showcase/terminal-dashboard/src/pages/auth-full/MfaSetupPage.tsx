import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredShell } from '@/components/CenteredShell';

const ASCII_QR = [
  '+---------------------------------------+',
  '|  # # . # . . # # . # . # # . . # #   |',
  '|  # . # . # # . . # . # . . # # . #   |',
  '|  . # . # . . # # . # . # # . # . .   |',
  '|  # # . . # . # . # . . # . # . # #   |',
  '|  . . # # . # . # . # # . # . # . .   |',
  '|  # . # . # . . # # . . # . # # . #   |',
  '|  . # . . # # . # . # . . # . . # .   |',
  '|  # # . # . . # . # . # # . # # . #   |',
  '|  . . # . # # . # . # . . # . . # .   |',
  '|  # . # # . . # . # . # . # # . . #   |',
  '+---------------------------------------+',
];

export function MfaSetupPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    navigate('/app');
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
          MFA SETUP
        </h1>

        <div
          className="term-panel"
          style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: '0.5rem',
              lineHeight: 1.2,
              color: 'var(--d-primary)',
              fontFamily: 'inherit',
              userSelect: 'none',
            }}
          >
            {ASCII_QR.join('\n')}
          </pre>
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              textAlign: 'center',
            }}
          >
            Scan with authenticator app
          </p>
          <code
            style={{
              fontSize: '0.6875rem',
              color: 'var(--d-secondary)',
              padding: '0.25rem 0.5rem',
              border: '1px solid var(--d-border)',
              background: 'var(--d-bg)',
            }}
          >
            JBSW Y3DP EHPK 3PXP
          </code>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label
            className="d-label"
            htmlFor="mfa-code"
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
            id="mfa-code"
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
          Enable MFA
        </button>
      </form>
    </CenteredShell>
  );
}
