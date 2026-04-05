import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm, Field } from '@/components/AuthForm';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Reset your password"
      subtitle="Enter your email and we'll send a reset link"
      onSubmit={e => { e.preventDefault(); navigate('/reset-password'); }}
      submitLabel="Send reset link"
      footer={<Link to="/login" style={{ color: 'var(--d-primary)' }}>Back to sign in</Link>}
    >
      <Field label="Email"><input className="ec-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></Field>
    </AuthForm>
  );
}
