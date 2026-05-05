import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm, Field } from '@/components/AuthForm';

export function ResetPasswordPage() {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const mismatch = confirm.length > 0 && pw !== confirm;
  return (
    <AuthForm
      title="Set a new password"
      subtitle="Choose a strong password you'll remember"
      onSubmit={e => { e.preventDefault(); if (!mismatch) navigate('/login'); }}
      submitLabel="Update password"
      disabled={mismatch || pw.length < 8}
    >
      <Field label="New password" hint="At least 8 characters">
        <input className="nm-input" type="password" value={pw} onChange={e => setPw(e.target.value)} minLength={8} required />
      </Field>
      <Field label="Confirm password">
        <input className="nm-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} aria-invalid={mismatch || undefined} required />
      </Field>
      {mismatch && <div style={{ fontSize: '0.78rem', color: 'var(--d-error)' }}>Passwords don't match</div>}
    </AuthForm>
  );
}
