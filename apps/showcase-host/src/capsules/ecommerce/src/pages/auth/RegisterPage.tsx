import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm, Field } from '@/components/AuthForm';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthForm
      title="Create your account"
      subtitle="Start shopping in seconds"
      onSubmit={e => { e.preventDefault(); register(email, password, name); navigate('/verify-email'); }}
      submitLabel="Create account"
      footer={<>Already have one? <Link to="/login" style={{ color: 'var(--d-primary)' }}>Sign in</Link></>}
    >
      <Field label="Full name"><input className="ec-input" value={name} onChange={e => setName(e.target.value)} placeholder="Maya Rivera" required /></Field>
      <Field label="Email"><input className="ec-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></Field>
      <Field label="Password" hint="At least 8 characters"><input className="ec-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></Field>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
        <input type="checkbox" required style={{ marginTop: '0.2rem' }} />
        <span>I agree to the <Link to="/" style={{ color: 'var(--d-primary)' }}>Terms</Link> & <Link to="/" style={{ color: 'var(--d-primary)' }}>Privacy Policy</Link></span>
      </label>
    </AuthForm>
  );
}
