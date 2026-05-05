import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm, Field } from '@/components/AuthForm';

export function ResetPasswordPage() {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Set a new password"
      subtitle="Choose something strong and memorable"
      onSubmit={e => { e.preventDefault(); navigate('/login'); }}
      submitLabel="Update password"
      footer={<Link to="/login" style={{ color: 'var(--d-primary)' }}>Back to sign in</Link>}
    >
      <Field label="New password" hint="At least 8 characters"><input className="ec-input" type="password" value={pw} onChange={e => setPw(e.target.value)} required /></Field>
      <Field label="Confirm password"><input className="ec-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></Field>
    </AuthForm>
  );
}
