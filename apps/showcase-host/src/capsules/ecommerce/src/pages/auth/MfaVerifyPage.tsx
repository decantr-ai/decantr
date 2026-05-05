import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';

export function MfaVerifyPage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Enter your code"
      subtitle="Open your authenticator app and enter the 6-digit code"
      onSubmit={e => { e.preventDefault(); navigate('/shop'); }}
      submitLabel="Verify"
      footer={<Link to="/login" style={{ color: 'var(--d-primary)' }}>Use a different method</Link>}
    >
      <input
        className="ec-input"
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        maxLength={6}
        inputMode="numeric"
        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontFamily: 'ui-monospace, monospace', padding: '0.875rem' }}
        required
      />
    </AuthForm>
  );
}
