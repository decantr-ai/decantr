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

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    navigate('/login');
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
          RESET PASSWORD
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="reset-code" style={labelStyle}>
            Reset Code
          </label>
          <input
            id="reset-code"
            className="d-control"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter reset code"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="reset-new" style={labelStyle}>
            New Password
          </label>
          <input
            id="reset-new"
            className="d-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label className="d-label" htmlFor="reset-confirm" style={labelStyle}>
            Confirm Password
          </label>
          <input
            id="reset-confirm"
            className="d-control"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
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
          Reset Password
        </button>
      </form>
    </CenteredShell>
  );
}
